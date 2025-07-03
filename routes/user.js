const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Question = require('../models/Question');

router.post('/submit', async (req, res) => {
    const { userId, name, questionId, selectedOption } = req.body;

    try {
        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ error: 'Question not found'});

        const isCorrect = selectedOption === question.correctAnswer;
        const scoreEarned = isCorrect ? question.questionWeight : 0;

        let user = await User.findOne({ userId: userId });
        if (!user) {
            user = new User({ userId, name });
        }

        // Add to question history
        user.questionHistory.push({
            questionId,
            complianceName: question.complianceName,
            selectedOption,
            isCorrect,
            questionWeight: question.questionWeight,
            scoreEarned,
            answeredAt: new Date()
        });

        // Update or create category score
        let categoryScore = user.categoryScores.find(cs => cs.complianceName === question.complianceName);
        if (!categoryScore) {
            categoryScore = {
                complianceName: question.complianceName,
                totalScored: 0,
                totalWeighted: 0,
                percentageScore: 0,
                questionsAnswered: 0,
                lastActivity: new Date()
            };
            user.categoryScores.push(categoryScore);
        }

        // Update category scores
        categoryScore.totalScored += scoreEarned;
        categoryScore.totalWeighted += question.questionWeight;
        categoryScore.questionsAnswered += 1;
        categoryScore.percentageScore = (categoryScore.totalScored / categoryScore.totalWeighted) * 100;
        categoryScore.lastActivity = new Date();

        // Update overall scores
        user.totalScore = user.categoryScores.reduce((sum, cs) => sum + cs.totalScored, 0);
        user.totalPossibleScore = user.categoryScores.reduce((sum, cs) => sum + cs.totalWeighted, 0);
        user.overallPercentage = user.totalPossibleScore > 0 ? (user.totalScore / user.totalPossibleScore) * 100 : 0;
        user.lastActivity = new Date();

        await user.save();

        // Update question response count
        question.responses += 1;
        await question.save();

        res.json({ 
            isCorrect, 
            scoreEarned,
            categoryScore: {
                complianceName: question.complianceName,
                totalScored: categoryScore.totalScored,
                totalWeighted: categoryScore.totalWeighted,
                percentageScore: categoryScore.percentageScore
            },
            overallPercentage: user.overallPercentage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId }).populate('scores.questionId');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/showUsers', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
});

// Get user analytics by category
router.get('/analytics/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId })
            .populate('questionHistory.questionId');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            userId: user.userId,
            name: user.name,
            categoryScores: user.categoryScores,
            overallPercentage: user.overallPercentage,
            totalScore: user.totalScore,
            totalPossibleScore: user.totalPossibleScore,
            lastActivity: user.lastActivity,
            recentActivity: user.questionHistory
                .sort((a, b) => new Date(b.answeredAt) - new Date(a.answeredAt))
                .slice(0, 10) // Last 10 activities
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;