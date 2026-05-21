const { getDatabase } = require('../database/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const db = getDatabase();
    const { username, email, password } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      `INSERT INTO users (username, email, password)
       VALUES (?, ?, ?)`,
      [username, email, hashedPassword]
    );
    
    return this.findById(result.lastID);
  }

  static async findById(id) {
    const db = getDatabase();
    return await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  static async findByEmail(email) {
    const db = getDatabase();
    return await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  static async findByUsername(username) {
    const db = getDatabase();
    return await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  }

  static async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }
}

module.exports = User;
