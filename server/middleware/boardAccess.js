const Board = require('../models/Board');
const ApiError = require('../utils/ApiError');

const boardAccess = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(404, 'Board not found', 'BOARD_NOT_FOUND');
    }

    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId,
    );
    const isOwner = board.owner.toString() === userId;

    if (!isMember && !isOwner) {
      throw new ApiError(403, 'You are not a member of this board', 'BOARD_ACCESS_DENIED');
    }

    req.board = board;
    req.isOwner = isOwner;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'CastError') {
      return next(new ApiError(400, 'Invalid board ID', 'INVALID_BOARD_ID'));
    }
    next(error);
  }
};

module.exports = boardAccess;
