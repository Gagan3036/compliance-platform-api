const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    categoryScores: [
        {
            complianceName: { type: String, required: true }, // Category name (GDPR, SOX, HIPAA, etc.)
            totalScored: { type: Number, default: 0 }, // Total weighted score earned in this category
            totalWeighted: { type: Number, default: 0 }, // Total weighted score possible in this category
            percentageScore: { type: Number, default: 0 }, // (totalScored/totalWeighted) * 100
            questionsAnswered: { type: Number, default: 0 }, // Number of questions answered in this category
            lastActivity: { type: Date, default: Date.now } // Last time user answered a question in this category
        }
    ],
    questionHistory: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            complianceName: { type: String, required: true },
            selectedOption: { type: Number, required: true },
            isCorrect: { type: Boolean, required: true },
            questionWeight: { type: Number, required: true },
            scoreEarned: { type: Number, required: true }, // Weight if correct, 0 if incorrect
            answeredAt: { type: Date, default: Date.now }
        }
    ],
    totalScore: { type: Number, default: 0 }, // Overall score across all categories
    totalPossibleScore: { type: Number, default: 0 }, // Total possible score across all categories
    overallPercentage: { type: Number, default: 0 }, // Overall percentage score
    lastActivity: { type: Date, default: Date.now } // Last activity timestamp
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema)