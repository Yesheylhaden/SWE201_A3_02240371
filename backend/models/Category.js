const { getDatabase } = require('../database/database');

class Category {
  static async create(categoryData) {
    const db = getDatabase();
    const { name, description, user_id } = categoryData;
    
    const result = await db.run(
      `INSERT INTO categories (name, description, user_id)
       VALUES (?, ?, ?)`,
      [name, description, user_id]
    );
    
    return this.findById(result.lastID, user_id);
  }

  static async findById(id, userId) {
    const db = getDatabase();
    return await db.get(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  static async findAll(userId) {
    const db = getDatabase();
    return await db.all(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );
  }

  static async update(id, userId, categoryData) {
    const db = getDatabase();
    const { name, description } = categoryData;
    
    await db.run(
      `UPDATE categories 
       SET name = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [name, description, id, userId]
    );
    
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    const db = getDatabase();
    
    const bookCount = await db.get(
      'SELECT COUNT(*) as count FROM books WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (bookCount.count > 0) {
      throw new Error('Cannot delete category with existing books');
    }
    
    const result = await db.run(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }
}

module.exports = Category;
