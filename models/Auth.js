const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    userType: { 
        type: String, 
        required: true, 
        enum: ['user', 'company', 'admin'],
        default: 'user'
    },
    profile: {
        name: { type: String, required: true },
        phone: String,
        companyName: String, // Only for company type
        department: String,  // For company users
        isActive: { type: Boolean, default: true }
    },
    permissions: {
        canCreateQuestions: { type: Boolean, default: false },
        canViewAllUsers: { type: Boolean, default: false },
        canManageCompany: { type: Boolean, default: false },
        canAccessAnalytics: { type: Boolean, default: false }
    },
    lastLogin: Date,
    refreshToken: String
}, {
    timestamps: true
});

// Hash password before saving
authSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
authSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Set permissions based on user type
authSchema.pre('save', function(next) {
    if (this.isModified('userType')) {
        switch(this.userType) {
            case 'admin':
                this.permissions = {
                    canCreateQuestions: true,
                    canViewAllUsers: true,
                    canManageCompany: true,
                    canAccessAnalytics: true
                };
                break;
            case 'company':
                this.permissions = {
                    canCreateQuestions: true,
                    canViewAllUsers: false,
                    canManageCompany: true,
                    canAccessAnalytics: true
                };
                break;
            case 'user':
                this.permissions = {
                    canCreateQuestions: false,
                    canViewAllUsers: false,
                    canManageCompany: false,
                    canAccessAnalytics: false
                };
                break;
        }
    }
    next();
});

module.exports = mongoose.model('Auth', authSchema);
