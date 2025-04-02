const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    postAnswer,
    voteAnswer,
    getEditAnswer,
    updateAnswer,
    deleteAnswer,
    getAnswersForQuestion  // import the new handler
} = require('../controllers/answersController');


// Submit an answer
router.post('/:questionId', auth, postAnswer);

// Vote for an answer
router.post('/:answerId/vote', auth, voteAnswer);

// Render edit form for an answer
router.get('/:id/edit', auth, getEditAnswer);

// Update an answer
router.post('/:id/update', auth, updateAnswer);

// Delete an answer
router.get('/:id/delete', auth, deleteAnswer);

module.exports = router;
