const Card = require('../models/Card');
const Board = require('../models/Board');
const ApiError = require('../utils/ApiError');

const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ data: { results: [], total: 0 } });
    }

    const term = q.trim();

    // Find boards the user has access to
    const userBoards = await Board.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).select('_id title');

    const boardIds = userBoards.map((b) => b._id);

    if (boardIds.length === 0) {
      return res.json({ data: { results: [], total: 0 } });
    }

    // Search cards by title and description using case-insensitive regex
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const cards = await Card.find({
      board: { $in: boardIds },
      $or: [{ title: regex }, { description: regex }],
    })
      .populate('list', 'title')
      .select('title description board list labels')
      .limit(20)
      .lean();

    // Group results by board
    const boardMap = {};
    userBoards.forEach((b) => {
      boardMap[b._id.toString()] = { _id: b._id, title: b.title };
    });

    const grouped = {};
    cards.forEach((card) => {
      const boardId = card.board.toString();
      if (!grouped[boardId]) {
        grouped[boardId] = {
          board: boardMap[boardId],
          cards: [],
        };
      }
      grouped[boardId].cards.push({
        _id: card._id,
        title: card.title,
        list: card.list,
        labels: card.labels,
      });
    });

    const results = Object.values(grouped);

    res.json({
      data: {
        results,
        total: cards.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
