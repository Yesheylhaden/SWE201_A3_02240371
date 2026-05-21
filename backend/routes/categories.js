const express = require('express');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll(req.userId);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(parseInt(req.params.id), req.userId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
});

router.post('/', categoryValidation, async (req, res) => {
  try {
    const categoryData = { ...req.body, user_id: req.userId };
    const category = await Category.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
});

router.put('/:id', categoryValidation, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    const existingCategory = await Category.findById(categoryId, req.userId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const category = await Category.update(categoryId, req.userId, req.body);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    const existingCategory = await Category.findById(categoryId, req.userId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await Category.delete(categoryId, req.userId);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Cannot delete category with existing books') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

module.exports = router;
