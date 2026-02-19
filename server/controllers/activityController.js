const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');

const getBoardActivity = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ board: boardId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar'),
      Activity.countDocuments({ board: boardId }),
    ]);

    res.json({
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCardActivity = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const activities = await Activity.find({ card: cardId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email avatar')
      .limit(50);

    res.json({ data: activities });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoardActivity,
  getCardActivity,
};
