// Import the required packages
const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();
const cors = require('cors');


// Global variables for MongoDB connection and the lessons collection
let db;
let lessons;
const uri = "mongodb+srv://Wambe88:jiggamynigga@cluster0.g6nehgw.mongodb.net/test";

// Use cors middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  next();
});


app.use('/images', express.static(path.join(__dirname, '/images')))

app.use((req, res, next) =>{
    res.status(404).send('Image not found.')
})

// Connect to the MongoDB server
MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log('Error connecting to MongoDB: ', err);
        return;
    }

    console.log('Connected to MongoDB');

    // Get the "lessons" database and assign it to the global variable "db"
    db = client.db('webstore');

    // Get the "lessons" collection and assign it to the global variable "lessons"
    lessons = db.collection('lessons');

    // Get the "orders" collection and assign it to the global variable "orders"
    orders = db.collection("orders");
});

// Route to retrieve all lessons from the database
app.get('/lessons', (req, res) => {
    lessons.find().toArray((err, result) => {
        if (err) {
            console.log('Error getting lessons: ', err);
            res.status(500).send('Error getting lessons');
            return;
        }
        res.send(JSON.stringify(result));
    });
});

// Route to add a new order to the "orders" collection
app.post('/orders', (req, res) => {
    const order = {
        name: req.body.name,
        phone: req.body.phone,
        lessons: req.body.lessons
    };
    console.log('Order received: ', order);
    orders.insertOne(order, (err, result) => {
        if (err) {
            console.log('Error inserting order: ', err);
            res.status(500).send('Error inserting order');
            return;
        }
        console.log('Order inserted: ', result);
        res.send('Order received');
    });
});



app.put("/lessons/:id", (req, res, next) => {
lessons.updateOne(
    {
    _id: new ObjectID(req.params.id),
    },
    { $set: req.body },
    { safe: true, multi: false },
    (error, result) => {
    if (error) {
        return res.status(500).send(error);
    }
    res.send(result);
    });
});
  
app.get("/lessons/search/:query", (req, res) => {
    const query = req.params.query;
    lessons.find({ $or: [{ topic: { $regex: query, $options: 'i' } }, { location: { $regex: query, $options: 'i' } }] }).toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });

  



// Start the Express app
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
