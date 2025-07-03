const express = require('express')
const router = express.Router();
const Question = require('../models/Question')
const { authenticateToken, requirePermission } = require('../middleware/auth')

router.post('/admin/add-question', authenticateToken, requirePermission('canCreateQuestions'), async (req, res) => {
    const { question, options, correctAnswer, complianceName, questionWeight } = req.body

    try {
        const newQuestion = new Question({ 
            question, 
            options, 
            correctAnswer, 
            complianceName, 
            questionWeight: questionWeight || 1 
        })
        await newQuestion.save();
        res.status(201).json({ message: 'Question added successfully'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/questions', async (req, res) => {
    try {
        const { complianceName } = req.query;
        
        const filter = {};
        if (complianceName) {
            filter.complianceName = complianceName;
        }
        
        const questions = await Question.find(filter);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/update-question/:id', authenticateToken, requirePermission('canCreateQuestions'), async (req, res) => {
    const { id } = req.params;
    const { question, options, correctAnswer, complianceName, questionWeight } = req.body;

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { question, options, correctAnswer, complianceName, questionWeight: questionWeight || 1 },
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/delete-question/:id', authenticateToken, requirePermission('canCreateQuestions'), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully', question: deletedQuestion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/question/:id', authenticateToken, requirePermission('canCreateQuestions'), async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;