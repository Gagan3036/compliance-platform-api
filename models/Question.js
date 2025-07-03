const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    complianceName: { type: String, required: true }, 
    questionWeight: { type: Number, required: true, default: 1 }, 
    responses: { type: Number, default: 0 }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Question', questionSchema)
