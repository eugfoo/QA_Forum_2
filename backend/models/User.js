const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '/default-avatar.png' },
    bio: { type: String, default: '' },
    questionsPostedCount: { type: Number, default: 0 },
    questionsAnsweredCount: { type: Number, default: 0 },
    upvotesReceived: { type: Number, default: 0 }
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Virtual field for notifications
UserSchema.virtual('notifications', {
    ref: 'Notification',
    localField: '_id',
    foreignField: 'recipient'
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);