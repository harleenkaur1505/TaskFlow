const Card = require('../models/Card');
const List = require('../models/List');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');

const createCard = async (req, res, next) => {
  try {
    const { title, listId } = req.body;
    const { boardId } = req.params;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Card title is required', 'TITLE_REQUIRED');
    }

    if (!listId) {
      throw new ApiError(400, 'List ID is required', 'LIST_ID_REQUIRED');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw new ApiError(404, 'List not found', 'LIST_NOT_FOUND');
    }

    if (list.board.toString() !== boardId) {
      throw new ApiError(400, 'List does not belong to this board', 'LIST_BOARD_MISMATCH');
    }

    const position = list.cards.length;

    const card = await Card.create({
      title: title.trim(),
      list: listId,
      board: boardId,
      position,
    });

    // Add card to list's cards array
    list.cards.push(card._id);
    await list.save();

    // Log activity
    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:created',
      data: { title: card.title },
    });

    res.status(201).json({ data: card });
  } catch (error) {
    next(error);
  }
};

const getCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId)
      .populate('members', 'name email avatar');

    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    res.json({ data: card });
  } catch (error) {
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;
    const updates = {};
    const allowedFields = [
      'title', 'description', 'labels', 'dueDate',
      'dueComplete', 'coverColor',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid fields to update', 'NO_UPDATES');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    // Log specific activity based on what changed
    if (updates.title && updates.title !== card.title) {
      await Activity.create({
        user: req.user.id,
        board: boardId,
        card: card._id,
        type: 'card:title_changed',
        data: { oldTitle: card.title, newTitle: updates.title },
      });
    }

    if (updates.description !== undefined && updates.description !== card.description) {
      await Activity.create({
        user: req.user.id,
        board: boardId,
        card: card._id,
        type: 'card:description_changed',
        data: {},
      });
    }

    if (updates.dueDate !== undefined) {
      if (updates.dueDate === null && card.dueDate) {
        await Activity.create({
          user: req.user.id,
          board: boardId,
          card: card._id,
          type: 'card:due_date_removed',
          data: {},
        });
      } else if (updates.dueDate && !card.dueDate) {
        await Activity.create({
          user: req.user.id,
          board: boardId,
          card: card._id,
          type: 'card:due_date_set',
          data: { dueDate: updates.dueDate },
        });
      } else if (updates.dueDate && card.dueDate) {
        await Activity.create({
          user: req.user.id,
          board: boardId,
          card: card._id,
          type: 'card:due_date_changed',
          data: { dueDate: updates.dueDate },
        });
      }
    }

    if (updates.dueComplete !== undefined && updates.dueComplete !== card.dueComplete) {
      await Activity.create({
        user: req.user.id,
        board: boardId,
        card: card._id,
        type: updates.dueComplete ? 'card:due_complete' : 'card:due_incomplete',
        data: {},
      });
    }

    Object.assign(card, updates);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    // Remove card from list's cards array
    await List.findByIdAndUpdate(card.list, {
      $pull: { cards: card._id },
    });

    // Reposition remaining cards in the list
    const list = await List.findById(card.list).populate({
      path: 'cards',
      options: { sort: { position: 1 } },
    });

    if (list && list.cards.length > 0) {
      const bulkOps = list.cards.map((c, i) => ({
        updateOne: {
          filter: { _id: c._id },
          update: { position: i },
        },
      }));
      await Card.bulkWrite(bulkOps);
    }

    // Log activity
    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:deleted',
      data: { title: card.title },
    });

    // Delete card and its activities
    await Activity.deleteMany({ card: card._id });
    await Card.findByIdAndDelete(cardId);

    res.json({ data: { message: 'Card deleted' } });
  } catch (error) {
    next(error);
  }
};

const moveCard = async (req, res, next) => {
  try {
    const { cardId, sourceListId, destinationListId, newPosition } = req.body;
    const { boardId } = req.params;

    if (!cardId || !sourceListId || !destinationListId || newPosition === undefined) {
      throw new ApiError(400, 'Missing required fields', 'MISSING_FIELDS');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const sourceList = await List.findById(sourceListId);
    const destList = await List.findById(destinationListId);

    if (!sourceList || !destList) {
      throw new ApiError(404, 'List not found', 'LIST_NOT_FOUND');
    }

    // Remove card from source list
    sourceList.cards = sourceList.cards.filter(
      (id) => id.toString() !== cardId,
    );
    await sourceList.save();

    // Insert card into destination list at position
    destList.cards.splice(newPosition, 0, card._id);
    await destList.save();

    // Update card's list reference
    card.list = destinationListId;
    card.position = newPosition;
    await card.save();

    // Reposition all cards in source list
    const sourceCards = await Card.find({
      _id: { $in: sourceList.cards },
    }).sort({ position: 1 });
    if (sourceCards.length > 0) {
      const sourceBulkOps = sourceList.cards.map((id, i) => ({
        updateOne: {
          filter: { _id: id },
          update: { position: i },
        },
      }));
      await Card.bulkWrite(sourceBulkOps);
    }

    // Reposition all cards in destination list
    const destBulkOps = destList.cards.map((id, i) => ({
      updateOne: {
        filter: { _id: id },
        update: { position: i },
      },
    }));
    await Card.bulkWrite(destBulkOps);

    // Log activity
    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:moved',
      data: {
        fromList: { id: sourceListId, title: sourceList.title },
        toList: { id: destinationListId, title: destList.title },
      },
    });

    res.json({ data: { message: 'Card moved' } });
  } catch (error) {
    next(error);
  }
};

const reorderCards = async (req, res, next) => {
  try {
    const { listId, cards } = req.body;

    if (!listId) {
      throw new ApiError(400, 'List ID is required', 'LIST_ID_REQUIRED');
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new ApiError(400, 'Cards array is required', 'CARDS_REQUIRED');
    }

    // Update positions
    const bulkOps = cards.map(({ cardId, position }) => ({
      updateOne: {
        filter: { _id: cardId },
        update: { position },
      },
    }));
    await Card.bulkWrite(bulkOps);

    // Update list's cards array to match new order
    const orderedIds = cards
      .sort((a, b) => a.position - b.position)
      .map((c) => c.cardId);

    await List.findByIdAndUpdate(listId, { cards: orderedIds });

    res.json({ data: { message: 'Cards reordered' } });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'USER_ID_REQUIRED');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    // Check user is a board member
    const board = req.board;
    const isBoardMember = board.members.some(
      (id) => id.toString() === userId,
    );
    if (!isBoardMember) {
      throw new ApiError(400, 'User is not a board member', 'NOT_BOARD_MEMBER');
    }

    const alreadyMember = card.members.some(
      (id) => id.toString() === userId,
    );
    if (alreadyMember) {
      throw new ApiError(400, 'User is already a card member', 'ALREADY_MEMBER');
    }

    card.members.push(userId);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    // Log activity
    const User = require('../models/User');
    const member = await User.findById(userId).select('name');
    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:member_added',
      data: { member: { id: userId, name: member?.name } },
    });

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { cardId, boardId, userId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const memberIndex = card.members.findIndex(
      (id) => id.toString() === userId,
    );
    if (memberIndex === -1) {
      throw new ApiError(400, 'User is not a card member', 'NOT_CARD_MEMBER');
    }

    card.members.splice(memberIndex, 1);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    // Log activity
    const User = require('../models/User');
    const member = await User.findById(userId).select('name');
    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:member_removed',
      data: { member: { id: userId, name: member?.name } },
    });

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const addChecklist = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Checklist title is required', 'TITLE_REQUIRED');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    card.checklists.push({ title: title.trim(), items: [] });
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:checklist_added',
      data: { title: title.trim() },
    });

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const updateChecklistItem = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { checklistId } = req.params;
    const { action, text, itemId } = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const checklist = card.checklists.id(checklistId);
    if (!checklist) {
      throw new ApiError(404, 'Checklist not found', 'CHECKLIST_NOT_FOUND');
    }

    switch (action) {
      case 'add': {
        if (!text || !text.trim()) {
          throw new ApiError(400, 'Item text is required', 'TEXT_REQUIRED');
        }
        checklist.items.push({ text: text.trim(), completed: false });
        break;
      }
      case 'toggle': {
        if (!itemId) {
          throw new ApiError(400, 'Item ID is required', 'ITEM_ID_REQUIRED');
        }
        const item = checklist.items.id(itemId);
        if (!item) {
          throw new ApiError(404, 'Checklist item not found', 'ITEM_NOT_FOUND');
        }
        item.completed = !item.completed;
        break;
      }
      case 'delete': {
        if (!itemId) {
          throw new ApiError(400, 'Item ID is required', 'ITEM_ID_REQUIRED');
        }
        checklist.items.pull(itemId);
        break;
      }
      default:
        throw new ApiError(400, 'Invalid action', 'INVALID_ACTION');
    }

    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteChecklist = async (req, res, next) => {
  try {
    const { cardId, boardId, checklistId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const checklist = card.checklists.id(checklistId);
    if (!checklist) {
      throw new ApiError(404, 'Checklist not found', 'CHECKLIST_NOT_FOUND');
    }

    const checklistTitle = checklist.title;
    card.checklists.pull(checklistId);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:checklist_deleted',
      data: { title: checklistTitle },
    });

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      throw new ApiError(400, 'Comment text is required', 'TEXT_REQUIRED');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const activity = await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:comment',
      data: { text: text.trim() },
    });

    const populated = await Activity.findById(activity._id)
      .populate('user', 'name email avatar');

    res.status(201).json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const addAttachment = async (req, res, next) => {
  try {
    const { cardId, boardId } = req.params;

    if (!req.file) {
      throw new ApiError(400, 'File is required', 'FILE_REQUIRED');
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const attachment = {
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    card.attachments.push(attachment);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:attachment_added',
      data: { filename: req.file.originalname },
    });

    res.status(201).json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const { cardId, boardId, attachmentId } = req.params;
    const fs = require('fs');
    const path = require('path');

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(404, 'Card not found', 'CARD_NOT_FOUND');
    }

    const attachment = card.attachments.id(attachmentId);
    if (!attachment) {
      throw new ApiError(404, 'Attachment not found', 'ATTACHMENT_NOT_FOUND');
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '..', attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const filename = attachment.filename;
    card.attachments.pull(attachmentId);
    await card.save();

    const populated = await Card.findById(card._id)
      .populate('members', 'name email avatar');

    await Activity.create({
      user: req.user.id,
      board: boardId,
      card: card._id,
      type: 'card:attachment_removed',
      data: { filename },
    });

    res.json({ data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
