const mongoose = require('mongoose');

const LibraryBookSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryCategory',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('LibraryBook', LibraryBookSchema);
