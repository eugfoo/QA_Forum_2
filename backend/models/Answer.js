const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = require('./Notification');

const AnswerSchema = new Schema({
    body: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    votes: {
        up: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        down: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
}, { timestamps: true });

AnswerSchema.pre('save', function (next) {
    this._wasNew = this.isNew;
    next();
});

AnswerSchema.post('save', async function (doc) {
    try {
        if (!this._wasNew) return;

        const question = await this.model('Question').findById(doc.question);
        if (question.user.toString() !== doc.user.toString()) {
            await Notification.create({
                recipient: question.user,
                question: question._id,
                answer: doc._id
            });
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
});

module.exports = mongoose.model('Answer', AnswerSchema);