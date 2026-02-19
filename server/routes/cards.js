const express = require('express');
const auth = require('../middleware/auth');
const boardAccess = require('../middleware/boardAccess');
const upload = require('../middleware/upload');
const {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  addMember,
  removeMember,
  addChecklist,
  updateChecklistItem,
  deleteChecklist,
  addComment,
  addAttachment,
  deleteAttachment,
} = require('../controllers/cardController');

const router = express.Router({ mergeParams: true });

// All routes require auth + board access
router.use(auth, boardAccess);

// Card CRUD
router.post('/', createCard);
router.put('/move', moveCard);
router.put('/reorder', reorderCards);
router.get('/:cardId', getCard);
router.put('/:cardId', updateCard);
router.delete('/:cardId', deleteCard);

// Card members
router.post('/:cardId/members', addMember);
router.delete('/:cardId/members/:userId', removeMember);

// Checklists
router.post('/:cardId/checklists', addChecklist);
router.put('/:cardId/checklists/:checklistId/items', updateChecklistItem);
router.delete('/:cardId/checklists/:checklistId', deleteChecklist);

// Comments
router.post('/:cardId/comments', addComment);

// Attachments
router.post('/:cardId/attachments', upload.single('file'), addAttachment);
router.delete('/:cardId/attachments/:attachmentId', deleteAttachment);

module.exports = router;
