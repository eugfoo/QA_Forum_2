const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');

const postAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        // Prevent users from answering their own questions
        if (question.user.toString() === req.user._id.toString()) {
            return res.status(403).json({ error: 'You cannot answer your own question' });
        }

        // Check if user has already answered (if needed)
        const existingAnswer = await Answer.findOne({
            question: questionId,
            user: req.user._id
        });
        const isFirstAnswer = !existingAnswer;

        // Parse anonymous flag; if it's a string 'true', convert to boolean true
        const anonymousFlag =
            req.body.anonymous === true || req.body.anonymous === 'true';

        // Use the original body content without any prefix
        const answerBody = req.body.body;

        const newAnswer = new Answer({
            body: answerBody,
            user: req.user._id,
            question: question._id,
            anonymous: anonymousFlag // Save the anonymous flag on the document
        });

        await newAnswer.save();

        // Add the answer reference to the question
        question.answers.push(newAnswer._id);
        await question.save();

        if (isFirstAnswer) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { questionsAnsweredCount: 1 }
            });
        }

        // Create a notification for the question author
        // First check if a notification already exists for this answer
        const existingNotification = await Notification.findOne({
            recipient: question.user,
            question: question._id,
            answer: newAnswer._id
        });
        
        if (!existingNotification) {
            const notification = new Notification({
                recipient: question.user,
                question: question._id,
                answer: newAnswer._id,
                read: false
            });
            await notification.save();
        }

        return res.status(201).json({
            message: 'Answer submitted successfully.',
            answer: newAnswer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error submitting answer.' });
    }
};

const voteAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const { voteType } = req.body;
        const voterId = req.user._id;

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        
        // Prevent users from voting on their own answers
        if (answer.user.toString() === voterId.toString()) {
            return res.status(403).json({ error: 'You cannot vote on your own answer' });
        }

        let upvoteReceivedChange = 0;
        const isUpvoted = answer.votes.up.some(uid => uid.toString() === voterId.toString());
        const isDownvoted = answer.votes.down.some(uid => uid.toString() === voterId.toString());

        if (voteType === 'up') {
            if (isUpvoted) {
                answer.votes.up = answer.votes.up.filter(uid => uid.toString() !== voterId.toString());
                upvoteReceivedChange = -1;
            } else {
                answer.votes.up.push(voterId);
                if (isDownvoted) {
                    answer.votes.down = answer.votes.down.filter(uid => uid.toString() !== voterId.toString());
                }
                upvoteReceivedChange = 1;
            }
        } else if (voteType === 'down') {
            if (isDownvoted) {
                answer.votes.down = answer.votes.down.filter(uid => uid.toString() !== voterId.toString());
            } else {
                if (isUpvoted) {
                    answer.votes.up = answer.votes.up.filter(uid => uid.toString() !== voterId.toString());
                    upvoteReceivedChange = -1;
                }
                answer.votes.down.push(voterId);
            }
        } else {
            return res.status(400).json({ error: 'Invalid vote type.' });
        }

        await answer.save();
        if (upvoteReceivedChange !== 0) {
            await User.findByIdAndUpdate(answer.user, { $inc: { upvotesReceived: upvoteReceivedChange } });
        }

        return res.status(200).json({ message: 'Vote recorded.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error recording vote.' });
    }
};

const getEditAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate('question');
        if (!answer) {
            return res.status(404).json({ error: 'Answer not found.' });
        }
        if (answer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this answer' });
        }
        if (answer.question.locked) {
            return res.status(403).json({ error: 'This question is locked; answers cannot be edited.' });
        }
        return res.status(200).json({ answer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error loading edit form' });
    }
};

const updateAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate('question');
        if (!answer) {
            return res.status(404).json({ error: 'Answer not found.' });
        }
        if (answer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this answer' });
        }
        answer.body = req.body.body;
        await answer.save();
        return res.status(200).json({ message: 'Answer updated successfully.', answer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating answer.' });
    }
};

const deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate('question');
        if (!answer) {
            return res.status(404).json({ error: 'Answer not found.' });
        }
        if (answer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this answer' });
        }
        const question = await Question.findById(answer.question._id);
        question.answers = question.answers.filter(
            ansId => ansId.toString() !== answer._id.toString()
        );
        await question.save();

        const anotherAnswer = await Answer.findOne({
            question: answer.question._id,
            user: answer.user,
            _id: { $ne: answer._id }
        });
        const answeredCountDecrement = anotherAnswer ? 0 : -1;

        await User.findByIdAndUpdate(answer.user, {
            $inc: {
                upvotesReceived: -answer.votes.up.length,
                questionsAnsweredCount: answeredCountDecrement
            }
        });

        await Notification.deleteMany({ answer: answer._id });
        await Answer.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Answer deleted successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting answer.' });
    }
};

const getAnswersForQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const answers = await Answer.find({ question: questionId }).populate('user');
        return res.status(200).json(answers);
    } catch (err) {
        console.error('Error fetching answers:', err);
        return res.status(500).json({ error: 'Error fetching answers.' });
    }
};

module.exports = {
    postAnswer,
    voteAnswer,
    getEditAnswer,
    updateAnswer,
    deleteAnswer,
    getAnswersForQuestion, // export the new handler
};

