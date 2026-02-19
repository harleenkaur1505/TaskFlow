const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
    default: '',
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  labels: [{
    color: {
      type: String,
      required: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [30, 'Label text cannot exceed 30 characters'],
      default: '',
    },
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dueDate: {
    type: Date,
    default: null,
  },
  dueComplete: {
    type: Boolean,
    default: false,
  },
  checklists: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    items: [{
      text: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
  }],
  attachments: [{
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  coverColor: {
    type: String,
    default: null,
    match: [/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'],
  },
}, {
  timestamps: true,
});

cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1 });
cardSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Card', cardSchema);
