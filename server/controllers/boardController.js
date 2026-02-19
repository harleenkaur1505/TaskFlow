const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Activity = require('../models/Activity');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json({ data: boards });
  } catch (error) {
    next(error);
  }
};

const createBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    const board = await Board.create({
      title,
      description,
      background,
      owner: req.user.id,
      members: [req.user.id],
    });

    const populated = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({ data: populated });
  } catch (error) {
    next(error);
  }
};

const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!board) {
      throw new ApiError(404, 'Board not found', 'BOARD_NOT_FOUND');
    }

    const lists = await List.find({ board: board._id })
      .sort({ position: 1 })
      .populate({
        path: 'cards',
        options: { sort: { position: 1 } },
        populate: { path: 'members', select: 'name email avatar' },
      });

    const boardObj = board.toObject();
    boardObj.lists = lists;

    res.json({ data: boardObj });
  } catch (error) {
    next(error);
  }
};

const updateBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (background !== undefined) updates.background = background;

    const board = await Board.findByIdAndUpdate(
      req.params.boardId,
      updates,
      { new: true, runValidators: true },
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({ data: board });
  } catch (error) {
    next(error);
  }
};

const deleteBoard = async (req, res, next) => {
  try {
    if (!req.isOwner) {
      throw new ApiError(403, 'Only the board owner can delete a board', 'OWNER_ONLY');
    }

    const boardId = req.params.boardId;

    // Cascading delete: lists, cards, activities
    await Card.deleteMany({ board: boardId });
    await List.deleteMany({ board: boardId });
    await Activity.deleteMany({ board: boardId });
    await Board.findByIdAndDelete(boardId);

    res.json({ data: { message: 'Board deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    if (!req.isOwner) {
      throw new ApiError(403, 'Only the board owner can add members', 'OWNER_ONLY');
    }

    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required', 'EMAIL_REQUIRED');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new ApiError(404, 'User not found with that email', 'USER_NOT_FOUND');
    }

    const board = req.board;
    const alreadyMember = board.members.some(
      (memberId) => memberId.toString() === user._id.toString(),
    );

    if (alreadyMember) {
      throw new ApiError(400, 'User is already a board member', 'ALREADY_MEMBER');
    }

    board.members.push(user._id);
    await board.save();

    const updated = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    if (!req.isOwner) {
      throw new ApiError(403, 'Only the board owner can remove members', 'OWNER_ONLY');
    }

    const { userId } = req.params;

    if (userId === req.user.id) {
      throw new ApiError(400, 'Owner cannot remove themselves', 'CANNOT_REMOVE_OWNER');
    }

    const board = req.board;
    const memberIndex = board.members.findIndex(
      (memberId) => memberId.toString() === userId,
    );

    if (memberIndex === -1) {
      throw new ApiError(400, 'User is not a board member', 'NOT_A_MEMBER');
    }

    board.members.splice(memberIndex, 1);
    await board.save();

    const updated = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const toggleStar = async (req, res, next) => {
  try {
    const board = req.board;
    const userId = req.user.id;

    const starIndex = board.starred.findIndex(
      (id) => id.toString() === userId,
    );

    if (starIndex === -1) {
      board.starred.push(userId);
    } else {
      board.starred.splice(starIndex, 1);
    }

    await board.save();

    const updated = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
  toggleStar,
};
