const { getDatabase } = require('../database/database');

class Book {
  static async create(bookData) {
    const db = getDatabase();
    const { title, author, isbn, publication_year, publisher, description, status, category_id, user_id } = bookData;
    
    const result = await db.run(
      `INSERT INTO books (title, author, isbn, publication_year, publisher, description, status, category_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, publication_year, publisher, description, status || 'available', category_id, user_id]
    );
    
    return this.findById(result.lastID, user_id);
  }

  static async findById(id, userId) {
    const db = getDatabase();
    return await db.get(
      `SELECT b.*, c.name as category_name 
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
      [id, userId]
    );
  }

  static async findAll(userId, filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (filters.status) {
      query += ` AND b.status = ?`;
      params.push(filters.status);
    }

    if (filters.category_id) {
      query += ` AND b.category_id = ?`;
      params.push(filters.category_id);
    }

    if (filters.search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY b.created_at DESC`;

    return await db.all(query, params);
  }

  static async update(id, userId, bookData) {
    const db = getDatabase();
    const { title, author, isbn, publication_year, publisher, description, status, category_id } = bookData;
    
    await db.run(
      `UPDATE books 
       SET title = ?, author = ?, isbn = ?, publication_year = ?, 
           publisher = ?, description = ?, status = ?, category_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, author, isbn, publication_year, publisher, description, status, category_id, id, userId]
    );
    
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM books WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }

  static async count(userId) {
    const db = getDatabase();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM books WHERE user_id = ?',
      [userId]
    );
    return result.count;
  }
}

module.exports = Book;
