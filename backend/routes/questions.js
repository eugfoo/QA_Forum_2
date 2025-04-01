// routes/questions.js
const express = require('express');
const router = express.Router();
const {
    fetchAllQuestions,  // Use the new function here
    searchQuestions,
    createQuestion, 
    getQuestionDetails,
    updateQuestion,
    deleteQuestion,
    voteForQuestion,
    lockQuestion,
    unlockQuestion
} = require('../controllers/questionsController');
const {isLoggedIn} = require('../middleware/auth')

// Route to search questions (using query parameter "q")
router.get('/search', searchQuestions);

// Get all questions (for API use)
router.get('/', fetchAllQuestions);

// (If you have a route for creating a question from your API, you could add it here as a POST route)
// For example:
router.post('/', isLoggedIn, createQuestion);

// Get question details by ID
router.get('/:id', getQuestionDetails);

// Update a question
router.put('/:id', updateQuestion);

// Delete a question
router.delete('/:id', deleteQuestion);

// Vote for a question
router.post('/:id/vote', voteForQuestion);

// Lock a question
router.post('/:id/lock', lockQuestion);

// Unlock a question
router.post('/:id/unlock', unlockQuestion);

module.exports = router;
