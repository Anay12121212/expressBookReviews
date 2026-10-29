
const express = require('express');
const axios = require('axios');
const { users } = require('./auth_users.js');
const public_users = express.Router();

const BOOKS_API_URL =
  process.env.BOOKS_API_URL || 'http://localhost:5000/books-data';

async function fetchBooks() {
  const response = await axios.get(BOOKS_API_URL);
  return response.data;
}

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Data endpoint used by Axios
public_users.get('/books-data', (req, res) => {
  const books = require('./booksdb.js');
  return res.status(200).json(books);
});

// Retrieve all books
public_users.get('/', async (req, res) => {
  try {
    const books = await fetchBooks();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve a book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve book'
    });
  }
});

// Retrieve books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const books = await fetchBooks();
    const author = req.params.author.toLowerCase();

    const results = Object.entries(books)
      .filter(([isbn, book]) =>
        book.author.toLowerCase() === author
      )
      .map(([isbn, book]) => ({ isbn, ...book }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const books = await fetchBooks();
    const title = req.params.title.toLowerCase();

    const results = Object.entries(books)
      .filter(([isbn, book]) =>
        book.title.toLowerCase() === title
      )
      .map(([isbn, book]) => ({ isbn, ...book }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews || {});
  } catch (error) {
    return res.status(502).json({
      message: 'Unable to retrieve reviews'
    });
  }
});

module.exports.general = public_users;
