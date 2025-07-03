const express = require('express');
const jwt = require('jsonwebtoken');
const Auth = require('../models/Auth');
const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

// Register new user
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, userType, name, phone, companyName, department } = req.body;

        // Check if user already exists
        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Create new user
        const newUser = new Auth({
            email,
            password,
            userType: userType || 'user',
            profile: {
                name,
                phone,
                companyName: userType === 'company' ? companyName : undefined,
                department
            }
        });

        await newUser.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(newUser._id);
        
        // Save refresh token
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                userType: newUser.userType,
                profile: newUser.profile,
                permissions: newUser.permissions
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login user
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.profile.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        // Update refresh token and last login
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                profile: user.profile,
                permissions: user.permissions
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Refresh token
router.post('/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');
        
        // Find user
        const user = await Auth.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        
        // Update refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

// Logout user
router.post('/auth/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Find user and remove refresh token
            const user = await Auth.findOne({ refreshToken });
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }

        res.json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user profile
router.get('/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await Auth.findById(decoded.userId).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                profile: user.profile,
                permissions: user.permissions,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update user profile
router.put('/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const { name, phone, companyName, department } = req.body;

        const user = await Auth.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update profile
        user.profile.name = name || user.profile.name;
        user.profile.phone = phone || user.profile.phone;
        user.profile.companyName = companyName || user.profile.companyName;
        user.profile.department = department || user.profile.department;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                profile: user.profile,
                permissions: user.permissions
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Get all users
router.get('/auth/users', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const adminUser = await Auth.findById(decoded.userId);
        
        if (!adminUser || !adminUser.permissions.canViewAllUsers) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const users = await Auth.find().select('-password -refreshToken');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
