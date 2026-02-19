const mongoose = require('mongoose');

const ACTIVITY_TYPES = [
  'card:created',
  'card:moved',
  'card:title_changed',
  'card:description_changed',
  'card:due_date_set',
  'card:due_date_changed',
  'card:due_date_removed',
  'card:due_complete',
  'card:due_incomplete',
  'card:member_added',
  'card:member_removed',
  'card:label_added',
  'card:label_removed',
  'card:checklist_added',
  'card:checklist_completed',
  'card:checklist_deleted',
  'card:attachment_added',
  'card:attachment_removed',
  'card:comment',
  'card:deleted',
  'list:created',
  'list:renamed',
  'list:deleted',
  'list:reordered',
  'board:member_added',
  'board:member_removed',
];

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    default: null,
  },
  type: {
    type: String,
    required: true,
    enum: ACTIVITY_TYPES,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ card: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
