// routes/questions.js
const express = require('express');
const router = express.Router();
const {
    fetchAllQuestions,
    searchQuestions,
    createQuestion,
    getQuestionDetails,
    updateQuestion,
    deleteQuestion,
    voteForQuestion,
    lockQuestion,
    unlockQuestion
} = require('../controllers/questionsController');
const { auth } = require('../middleware/auth');

router.get('/search', searchQuestions);

// Get all questions (for API use)
router.get('/', fetchAllQuestions);

// Create a question
router.post('/', auth, createQuestion);

// Get question details by ID
router.get('/:id', getQuestionDetails);

// Update a question
router.put('/:id', auth, updateQuestion);

// Delete a question
router.delete('/:id', auth, deleteQuestion);

// Vote for a question
router.post('/:id/vote', auth, voteForQuestion);

// Lock a question
router.post('/:id/lock', auth, lockQuestion);

// Unlock a question
router.post('/:id/unlock', auth, unlockQuestion);

const Answer = require('../models/Answer');
router.get('/:id/answers', async (req, res) => {
    try {
        const answers = await Answer.find({ question: req.params.id }).populate('user');
        return res.status(200).json(answers);
    } catch (err) {
        console.error('Error retrieving answers:', err);
        return res.status(500).json({ error: 'Error retrieving answers.' });
    }
});

module.exports = router;
