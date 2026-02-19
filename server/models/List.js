const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }],
  position: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

listSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);
