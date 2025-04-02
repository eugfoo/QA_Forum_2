const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Answer = require('../models/Answer');

const fetchAllQuestions = async (req, res, next) => {
    try {
        const filter = (req.query.filter || 'latest');
        const view = req.query.view || 'general';
        const search = req.query.search || '';
        console.log(`Fetching questions with filter=${filter}, view=${view}, search=${search}`);

        let query = {};
        if (view === 'myProfile' && req.user) {
            query.user = req.user._id;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } },
                { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        let questions = await Question.find(query)
            .populate('user')
            .populate({ path: 'answers', populate: { path: 'user' } });

        const sortingMethods = {
            popular: (a, b) => b.votes.up.length - a.votes.up.length,
            unpopular: (a, b) => b.votes.down.length - a.votes.down.length,
            oldest: (a, b) => a.createdAt - b.createdAt,
            trending: (a, b) => b.answers.length - a.answers.length,
            latest: (a, b) => b.createdAt - a.createdAt,
        };

        const sortFn = sortingMethods[filter] || sortingMethods['latest'];
        questions = questions.sort(sortFn);

        res.status(200).json({ questions });
    } catch (err) {
        console.error('❌ Error in fetchAllQuestions:', err);
        next(err);
    }
};

// POST /api/questions
const createQuestion = async (req, res) => {
    try {
        let { title, body, tags } = req.body;

        if (!req.user) {
            console.log('Unauthorized: No user in request for createQuestion');
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        const userId = req.user._id;
        console.log(`Creating question for user ID: ${userId}`);

        tags = typeof tags === 'string'
            ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [];

        const question = new Question({ title, body, tags, user: userId });
        await question.save();

        await User.findByIdAndUpdate(userId, { $inc: { questionsPostedCount: 1 } });
        console.log(`Question created with ID: ${question._id}`);

        res.status(201).json({
            message: 'Question posted successfully!',
            question,
        });
    } catch (err) {
        console.error('Error in createQuestion:', err);
        res.status(500).json({ error: 'An error occurred while posting the question.' });
    }
};


const searchQuestions = async (req, res) => {
    const searchTerm = req.query.q?.trim();
    if (!searchTerm)
        return res.render('searchResults', { questions: [], query: '' });

    try {
        const questions = await Question.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { body: { $regex: searchTerm, $options: 'i' } },
                { tags: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
            ]
        }).populate('user');
        res.render('searchResults', { questions, query: searchTerm });
    } catch (err) {
        req.flash('error_msg', 'Error searching questions.');
        res.redirect('/');
    }
};

const getQuestionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching question with id:', id); // Debug log

        const sortOption = req.query.sort || 'latest';

        const question = await Question.findById(id)
            .populate('user')
            .populate({ path: 'answers', populate: { path: 'user' } });

        if (!question) {
            console.log('No question found for id:', id); // Debug log
            return res.status(404).json({ error: 'Question not found.' });
        }

        const sortingMethods = {
            oldest: (a, b) => a.createdAt - b.createdAt,
            popular: (a, b) => b.votes.up.length - a.votes.up.length,
            unpopular: (a, b) => b.votes.down.length - a.votes.down.length,
            latest: (a, b) => b.createdAt - a.createdAt,
        };

        question.answers.sort(sortingMethods[sortOption]);

        return res.status(200).json(question);
    } catch (err) {
        console.error('Error in getQuestionDetails:', err);
        return res.status(500).json({ error: 'Error loading question details.' });
    }
};





const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, tags } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        if (question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this question.' });
        }

        if (question.locked) {
            return res.status(403).json({ error: 'This question is locked and cannot be edited.' });
        }

        question.title = title;
        question.body = body;
        question.tags = typeof tags === 'string'
            ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : tags;

        await question.save();

        res.status(200).json({
            message: 'Question updated successfully.',
            question
        });
    } catch (err) {
        console.error('Error updating question:', err);
        res.status(500).json({ error: 'Error updating question.' });
    }
};


const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        if (question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this question.' });
        }

        const answers = await Answer.find({ question: question._id });
        const answerIds = answers.map(ans => ans._id);

        await Notification.deleteMany({
            $or: [
                { question: question._id },
                { answer: { $in: answerIds } }
            ]
        });

        await Answer.deleteMany({ question: question._id });

        const upvoteCount = question.votes.up.length;
        await Question.findByIdAndDelete(req.params.id);
        await User.findByIdAndUpdate(question.user, {
            $inc: {
                upvotesReceived: -upvoteCount,
                questionsPostedCount: -1
            }
        });

        res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (err) {
        console.error('Error deleting question:', err);
        res.status(500).json({ error: 'Error deleting question.' });
    }
};


const voteForQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // Expected values: 'up' or 'down'
        
        if (!req.user) {
            return res.status(401).json({ error: 'User not logged in.' });
        }
        
        const userId = req.user._id;

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }
        // Ensure votes structure is defined properly
        if (!question.votes || !Array.isArray(question.votes.up) || !Array.isArray(question.votes.down)) {
            return res.status(500).json({ error: 'Votes structure is missing or invalid.' });
        }

        const isUpvoted = question.votes.up.some(uid => uid.toString() === userId.toString());
        const isDownvoted = question.votes.down.some(uid => uid.toString() === userId.toString());

        let voteChange = 0;
        let upvoteReceivedChange = 0;

        if (voteType === 'up') {
            if (isUpvoted) {
                question.votes.up.pull(userId);
                voteChange = -1;
                upvoteReceivedChange = -1;
            } else {
                if (isDownvoted) question.votes.down.pull(userId);
                question.votes.up.push(userId);
                voteChange = isDownvoted ? 0 : 1;
                upvoteReceivedChange = 1;
            }
        } else if (voteType === 'down') {
            if (isDownvoted) {
                question.votes.down.pull(userId);
                voteChange = -1;
            } else {
                if (isUpvoted) question.votes.up.pull(userId);
                question.votes.down.push(userId);
                voteChange = isUpvoted ? 0 : 1;
                upvoteReceivedChange = -1;
            }
        } else {
            return res.status(400).json({ error: 'Invalid vote type.' });
        }

        await question.save();

        await Promise.all([
            User.findByIdAndUpdate(userId, { $inc: { votesGivenCount: voteChange } }),
            User.findByIdAndUpdate(question.user, { $inc: { upvotesReceived: upvoteReceivedChange } }),
        ]);

        return res.status(200).json({ message: 'Vote recorded.' });
    } catch (err) {
        console.error('Error recording vote:', err);
        return res.status(500).json({ error: 'Error recording vote.' });
    }
};



const lockQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.user) {
            console.log('Unauthorized: No user in request for lockQuestion');
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        
        console.log(`Attempting to lock question ${id} by user ${req.user._id}`);
        
        const question = await Question.findById(id);
        if (!question) {
            console.log(`Question not found with ID: ${id}`);
            return res.status(404).json({ error: 'Question not found.' });
        }
        
        if (question.user.toString() !== req.user._id.toString()) {
            console.log(`Unauthorized: User ${req.user._id} attempted to lock question owned by ${question.user}`);
            return res.status(403).json({ error: 'Not authorized to lock this question.' });
        }
        
        question.locked = true;
        await question.save();
        console.log(`Question ${id} successfully locked`);
        res.status(200).json({ message: 'Question locked successfully.' });
    } catch (err) {
        console.error('Error in lockQuestion:', err);
        res.status(500).json({ error: 'Error locking the question.' });
    }
};

const unlockQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.user) {
            console.log('Unauthorized: No user in request for unlockQuestion');
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        
        console.log(`Attempting to unlock question ${id} by user ${req.user._id}`);
        
        const question = await Question.findById(id);
        if (!question) {
            console.log(`Question not found with ID: ${id}`);
            return res.status(404).json({ error: 'Question not found.' });
        }
        
        if (question.user.toString() !== req.user._id.toString()) {
            console.log(`Unauthorized: User ${req.user._id} attempted to unlock question owned by ${question.user}`);
            return res.status(403).json({ error: 'Not authorized to unlock this question.' });
        }
        
        question.locked = false;
        await question.save();
        console.log(`Question ${id} successfully unlocked`);
        res.status(200).json({ message: 'Question unlocked successfully.' });
    } catch (err) {
        console.error('Error in unlockQuestion:', err);
        res.status(500).json({ error: 'Error unlocking the question.' });
    }
};

module.exports = {
    fetchAllQuestions,
    createQuestion,
    searchQuestions,
    getQuestionDetails,
    updateQuestion,
    deleteQuestion,
    voteForQuestion,
    lockQuestion,
    unlockQuestion
};