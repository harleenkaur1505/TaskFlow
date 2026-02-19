const express = require('express');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const {
  createList,
  updateList,
  deleteList,
  reorderLists,
} = require('../controllers/listController');

// mergeParams gives us access to :boardId from the parent router
const router = express.Router({ mergeParams: true });

// All routes require auth + board access
router.use(auth, boardAccess);

// List CRUD
router.post('/', createList);
router.put('/reorder', reorderLists);
router.put('/:listId', updateList);
router.delete('/:listId', deleteList);

module.exports = router;
