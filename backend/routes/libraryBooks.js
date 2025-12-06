const express = require('express');
const auth = require('../middleware/auth');
const LibraryBook = require('../models/LibraryBook');
const LibraryCategory = require('../models/LibraryCategory');

const router = express.Router();

// Helper to resolve category from slug or id
async function resolveCategory(categorySlugOrId) {
  if (!categorySlugOrId) return null;
  let category = null;
  if (categorySlugOrId.match(/^[0-9a-fA-F]{24}$/)) {
    category = await LibraryCategory.findById(categorySlugOrId);
  } else {
    category = await LibraryCategory.findOne({ slug: categorySlugOrId });
  }
  return category;
}

// GET /api/library/books - list books, optionally filtered by category (slug or id)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      const cat = await resolveCategory(category);
      if (!cat) {
        return res.json({ success: true, books: [] });
      }
      filter.category = cat._id;
    }

    const books = await LibraryBook.find(filter).populate('category', 'name slug').sort({ id: 1 });
    res.json({ success: true, books });
  } catch (error) {
    console.error('Get library books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/library/books/:id - get single book by numeric id
router.get('/:id', async (req, res) => {
  try {
    const book = await LibraryBook.findOne({ id: req.params.id }).populate('category', 'name slug');
    if (!book) {
      return res.status(404).json({ message: 'Library book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    console.error('Get library book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/library/books - create book (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { id, title, description, price, src, author, categorySlugOrId } = req.body;

    const existing = await LibraryBook.findOne({ id });
    if (existing) {
      return res.status(400).json({ message: 'Book with this ID already exists' });
    }

    const category = await resolveCategory(categorySlugOrId);
    if (!category) {
      return res.status(400).json({ message: 'Valid library category is required' });
    }

    const book = new LibraryBook({
      id,
      title,
      description,
      price,
      src,
      author,
      category: category._id,
    });

    await book.save();

    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error('Create library book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/library/books/:id - update book (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, price, src, author, categorySlugOrId } = req.body;

    const update = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (price) update.price = price;
    if (src) update.src = src;
    if (typeof author !== 'undefined') update.author = author;

    if (categorySlugOrId) {
      const category = await resolveCategory(categorySlugOrId);
      if (!category) {
        return res.status(400).json({ message: 'Valid library category is required' });
      }
      update.category = category._id;
    }

    const book = await LibraryBook.findOneAndUpdate(
      { id: req.params.id },
      update,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!book) {
      return res.status(404).json({ message: 'Library book not found' });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error('Update library book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/library/books/:id - delete book (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await LibraryBook.findOneAndDelete({ id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Library book not found' });
    }

    res.json({ success: true, message: 'Library book deleted successfully' });
  } catch (error) {
    console.error('Delete library book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
