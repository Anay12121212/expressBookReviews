
const express = require('express');
const books = require('./booksdb.js');
const { users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (users.some(user => user.username === username)) {
    return res.status(409).json({
      message: 'User already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Retrieve all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Retrieve a book by its ISBN/key
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book);
});

// Retrieve books by author (case-insensitive)
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const results = Object.values(books).filter(book =>
    book.author.toLowerCase() === author
  );

  return res.status(200).json(results);
});

// Retrieve books by title (case-insensitive)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const results = Object.values(books).filter(book =>
    book.title.toLowerCase() === title
  );

  return res.status(200).json(results);
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
