const express = require('express');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/auth');
const { bookValidation } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status, category_id, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (category_id) filters.category_id = parseInt(category_id);
    if (search) filters.search = search;
    
    const books = await Book.findAll(req.userId, filters);
    const total = await Book.count(req.userId);
    
    res.json({
      success: true,
      data: books,
      total,
      filters
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(parseInt(req.params.id), req.userId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book'
    });
  }
});

router.post('/', bookValidation, async (req, res) => {
  try {
    const bookData = { ...req.body, user_id: req.userId };
    const book = await Book.create(bookData);
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating book'
    });
  }
});

router.put('/:id', bookValidation, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    
    const existingBook = await Book.findById(bookId, req.userId);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const book = await Book.update(bookId, req.userId, req.body);
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating book'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    
    const existingBook = await Book.findById(bookId, req.userId);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const deleted = await Book.delete(bookId, req.userId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book'
    });
  }
});

module.exports = router;
