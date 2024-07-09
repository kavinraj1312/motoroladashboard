const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(express.static('public'));

app.set('views', './views'); // Set the views directory
app.set('view engine', 'ejs'); // Set the view engine to EJS



const dbName = 'First';
const collectionName = 'example';
const uri = 'mongodb://localhost:27017';

app.get('/', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.findOne();
    const title={topic:"home"};
    client.close();
   
    res.render('page', { result ,title}); // Render the page.ejs view with the result object
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data from MongoDB');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});