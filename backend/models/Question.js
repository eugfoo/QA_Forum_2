const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: [String],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    votes: {
        up: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        down: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    locked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);