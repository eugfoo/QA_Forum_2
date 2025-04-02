const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const {
    postAnswer,
    voteAnswer,
    getEditAnswer,
    updateAnswer,
    deleteAnswer,
    getAnswersForQuestion  // import the new handler
} = require('../controllers/answersController');


// Submit an answer
router.post('/:questionId', isLoggedIn, postAnswer);

// Vote for an answer
router.post('/:answerId/vote', isLoggedIn, voteAnswer);

// Render edit form for an answer
router.get('/:id/edit', isLoggedIn, getEditAnswer);

// Update an answer
router.post('/:id/update', isLoggedIn, updateAnswer);

// Delete an answer
router.get('/:id/delete', isLoggedIn, deleteAnswer);

module.exports = router;
