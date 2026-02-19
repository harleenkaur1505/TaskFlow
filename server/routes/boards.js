const express = require('express');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
  toggleStar,
} = require('../controllers/boardController');

const router = express.Router();

// All routes require auth
router.use(auth);

// Board CRUD
router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:boardId', boardAccess, getBoard);
router.put('/:boardId', boardAccess, updateBoard);
router.delete('/:boardId', boardAccess, deleteBoard);

// Member management
router.post('/:boardId/members', boardAccess, addMember);
router.delete('/:boardId/members/:userId', boardAccess, removeMember);

// Star toggle
router.put('/:boardId/star', boardAccess, toggleStar);

module.exports = router;
