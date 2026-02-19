const Activity = require('../models/Activity');

/**
 * Log an activity entry for a board/card mutation.
 * Fire-and-forget — errors are logged but never thrown.
 */
const logActivity = async (userId, boardId, cardId, type, data = {}) => {
  try {
    await Activity.create({
      user: userId,
      board: boardId,
      card: cardId || null,
      type,
      data,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = { logActivity };
