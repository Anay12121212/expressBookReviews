
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

// Shared user list used by registration and login
const users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Log in a registered user
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const accessToken = jwt.sign(
    { username },
    'access',
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in',
    token: accessToken
  });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const username = req.session.authorization?.username;
  const review = req.body.review;

  if (!username) {
    return res.status(401).json({
      message: 'Please log in first'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'A non-empty review is required'
    });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: book.reviews
  });
});

  // Delete the logged-in user's review for a book
  regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    const username = req.session.authorization?.username;

    if (!username) {
      return res.status(401).json({
        message: 'Please log in first'
      });
    }

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({
        message: 'No review found for this user'
      });
    }

    delete book.reviews[username];

    return res.status(200).json({
      message: 'Review deleted successfully',
      reviews: book.reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
