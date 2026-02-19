const List = require('../models/List');
const Card = require('../models/Card');
const Board = require('../models/Board');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../services/activityService');

const createList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { boardId } = req.params;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'List title is required', 'TITLE_REQUIRED');
    }

    const listCount = await List.countDocuments({ board: boardId });

    const list = await List.create({
      title: title.trim(),
      board: boardId,
      position: listCount,
    });

    logActivity(req.user.id, boardId, null, 'list:created', {
      title: list.title,
    });

    res.status(201).json({ data: list });
  } catch (error) {
    next(error);
  }
};

const updateList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { listId, boardId } = req.params;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'List title is required', 'TITLE_REQUIRED');
    }

    const list = await List.findById(listId);

    if (!list) {
      throw new ApiError(404, 'List not found', 'LIST_NOT_FOUND');
    }

    const oldTitle = list.title;
    list.title = title.trim();
    await list.save();

    if (oldTitle !== list.title) {
      logActivity(req.user.id, boardId, null, 'list:renamed', {
        oldTitle,
        newTitle: list.title,
      });
    }

    res.json({ data: list });
  } catch (error) {
    next(error);
  }
};

const deleteList = async (req, res, next) => {
  try {
    const { listId, boardId } = req.params;

    const list = await List.findById(listId);

    if (!list) {
      throw new ApiError(404, 'List not found', 'LIST_NOT_FOUND');
    }

    const listTitle = list.title;

    // Delete all cards in the list
    await Card.deleteMany({ list: listId });

    // Delete the list
    await List.findByIdAndDelete(listId);

    // Reposition remaining lists
    const remaining = await List.find({ board: boardId }).sort({ position: 1 });
    const bulkOps = remaining.map((l, i) => ({
      updateOne: {
        filter: { _id: l._id },
        update: { position: i },
      },
    }));
    if (bulkOps.length > 0) {
      await List.bulkWrite(bulkOps);
    }

    logActivity(req.user.id, boardId, null, 'list:deleted', {
      title: listTitle,
    });

    res.json({ data: { message: 'List deleted' } });
  } catch (error) {
    next(error);
  }
};

const reorderLists = async (req, res, next) => {
  try {
    const { lists } = req.body;
    const { boardId } = req.params;

    if (!Array.isArray(lists) || lists.length === 0) {
      throw new ApiError(400, 'Lists array is required', 'LISTS_REQUIRED');
    }

    const bulkOps = lists.map(({ listId, position }) => ({
      updateOne: {
        filter: { _id: listId },
        update: { position },
      },
    }));

    await List.bulkWrite(bulkOps);

    logActivity(req.user.id, boardId, null, 'list:reordered', {});

    res.json({ data: { message: 'Lists reordered' } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createList,
  updateList,
  deleteList,
  reorderLists,
};
