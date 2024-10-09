const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Import Axios for HTTP requests


// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully!" });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Use JSON.stringify to format the output
    res.send(JSON.stringify(books, null, 2)); // null for replacer, 2 for pretty printing
});

const fetchBooks = async () => {
    try {
        const response = await axios.get('http://localhost:5000'); // Ensure this endpoint works
        console.log('Response from fetchBooks:', response.data); // Log the response

        // Assuming response.data is an object
        if (Array.isArray(response.data)) {
            return response.data.reduce((acc, book) => {
                acc[book.isbn] = book;
                return acc;
            }, {});
        } else if (typeof response.data === 'object') {
            return response.data; // Already in expected format
        } else {
            throw new Error('Unexpected data format from the API');
        }
    } catch (error) {
        throw new Error('Error fetching books: ' + error.message);
    }
};

// Get the book list available in the shop
public_users.get('/books', async (req, res) => {
    try {
        const bookList = await fetchBooks();
        res.status(200).json(bookList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters
    const book = books[isbn]; // Get the book from the books object using the ISBN
  
    if (book) {
        // If the book exists, send it as a response
        res.status(200).json(book);
    } else {
        // If the book does not exist, send a 404 error
        res.status(404).json({ message: "Book not found" });
    }
  });





// Function to fetch book details by ISBN
const fetchBookByISBN = async (isbn) => {
    try {
        const booksList = await fetchBooks(); // Fetch all books
        const book = booksList[isbn]; // Find the book by ISBN
        if (!book) {
            throw new Error('Book not found');
        }
        return book; // Return the found book
    } catch (error) {
        throw new Error('Error fetching book details');
    }
};

// Get book details based on ISBN using async-await
public_users.get('/books/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters
    try {
        const book = await fetchBookByISBN(isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
});




  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author from the request parameters
  const foundBooks = []; // Array to hold books by the author

  // Iterate through the books object to find matches
  for (let isbn in books) {
      if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          foundBooks.push({ isbn, ...books[isbn] }); // Push matching book to foundBooks array
      }
  }

  // Check if any books were found and respond accordingly
  if (foundBooks.length > 0) {
      res.status(200).json(foundBooks); // Send found books as a response
  } else {
      res.status(404).json({ message: "No books found for this author" }); // No matches found
  }
});


public_users.get('/books/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        // Convert the books object into an array
        const bookArray = Object.values(books); // This gives you an array of book objects

        // Filter the books based on the author
        const foundBooks = bookArray.filter(book => book.author.toLowerCase() === author.toLowerCase());

        // Check if any books were found and respond accordingly
        if (foundBooks.length > 0) {
            res.status(200).json(foundBooks);
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});







// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title; // Retrieve the title from the request parameters
    const foundBooks = []; // Array to hold books with the specified title
  
    // Iterate through the books object to find matches
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            foundBooks.push({ isbn, ...books[isbn] }); // Push matching book to foundBooks array
        }
    }
  
    // Check if any books were found and respond accordingly
    if (foundBooks.length > 0) {
        res.status(200).json(foundBooks); // Send found books as a response
    } else {
        res.status(404).json({ message: "No books found with this title" }); // No matches found
    }
  });


  public_users.get('/books/title/:title', async (req, res) => {
    const title = req.params.title;
    console.log(`Searching for title: ${title}`); // Log the incoming title

    try {
        const booksList = await fetchBooks(); // Fetch books
        console.log('Fetched Books List:', booksList); // Log the fetched book list

        // Normalize the title for comparison
        const foundBooks = Object.values(booksList).filter(book =>
            book.title.toLowerCase() === title.toLowerCase()
        );

        // Log the found books or lack thereof
        if (foundBooks.length > 0) {
            res.status(200).json(foundBooks);
        } else {
            console.log(`No books found for title: ${title}`); // Log if no books found
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error('Error fetching books:', error); // Log errors
        res.status(500).json({ message: error.message });
    }
});



 





// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  
  // Check if the book exists in the books object
  if (books[isbn]) {
      const reviews = books[isbn].reviews; // Get the reviews for the book
      res.status(200).json({ isbn, reviews }); // Send the reviews as a response
  } else {
      res.status(404).json({ message: "No reviews found for this ISBN" }); // No reviews found
  }
});


module.exports.general = public_users;
