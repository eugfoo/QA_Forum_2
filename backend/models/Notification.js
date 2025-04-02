const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Middleware to automatically populate references
notificationSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'question',
        select: 'title'
    }).populate({
        path: 'answer',
        select: 'content anonymous user createdAt',
        populate: {
            path: 'user',
            select: 'username'
        }
    });
    next();
});

module.exports = mongoose.model('Notification', notificationSchema);