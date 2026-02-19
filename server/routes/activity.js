const express = require('express');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const { getBoardActivity } = require('../controllers/activityController');

const router = express.Router({ mergeParams: true });

// All routes require auth + board access
router.use(auth, boardAccess);

// GET /api/boards/:boardId/activity?page=1&limit=20
router.get('/', getBoardActivity);

module.exports = router;
