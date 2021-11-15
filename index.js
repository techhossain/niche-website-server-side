const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Middleware End


// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i0vmz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
// MongoDB connection

async function run() {

  try {
    await client.connect();

    const database = client.db("kitchenware");
    const productsPackage = database.collection("products");
    const reviewPackage = database.collection("review");
    const contactPackage = database.collection("contacts");
    const ordersPackage = database.collection("orders");
    const usersPackage = database.collection("users");

    // POST API - Add product from dashboard
    app.post('/add-new', async (req, res) => {
      const productInfo = req.body;
      const result = await productsPackage.insertOne(productInfo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // GET API - Display All product from the db
    app.get('/products', async (req, res) => {
      const cursor = productsPackage.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // GET SINGLE - Display Single Product by ID
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsPackage.findOne(query);
      res.json(product);

    });

    // DELETE API
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsPackage.deleteOne(query);
      res.json(product);

    });

    // POST API - Add review 
    app.post('/review', async (req, res) => {
      const productInfo = req.body;
      const result = await reviewPackage.insertOne(productInfo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });
    // GET API - Display All review
    app.get('/reviews', async (req, res) => {
      const cursor = reviewPackage.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // POST API - Add contact request
    app.post('/contact', async (req, res) => {
      const contactInfo = req.body;
      const result = await contactPackage.insertOne(contactInfo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // POST API - Order Product
    app.post('/orders', async (req, res) => {
      const orderInfo = req.body;
      const result = await ordersPackage.insertOne(orderInfo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // GET API - Display All Orders
    app.get('/orders', async (req, res) => {
      const cursor = ordersPackage.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // DELETE API - DELETE order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await ordersPackage.deleteOne(query);
      res.json(order);
    });

    // UPDATE API  - ORDERS SINGLE
    app.put('/orders/:id', async (req, res) => {

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };

      const updateDoc = {
        $set: {
          status: 'Approved'
        },
      };

      const result = await ordersPackage.updateOne(filter, updateDoc);
      res.json(result);
    });

    // POST API - user
    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      userInfo.role = 'User';
      console.log(userInfo);
      const result = await usersPackage.insertOne(userInfo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // UPDATE API - user
    app.put('/users', async (req, res) => {
      const userInfo = req.body;
      userInfo.role = 'User';
      const filter = { email: userInfo.email };
      const options = { upsert: true };
      const updateDoc = { $set: userInfo };
      const result = await usersPackage.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // UPDATE API - Admin user
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'Admin' } };
      const result = await usersPackage.updateOne(filter, updateDoc);
      res.json(result);
    })


    // GET SINGLE - Display Single user by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersPackage.findOne(query);
      let isAdmin = false;
      if (user?.role === 'Admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });

    });


  }
  finally {
    // await client.close();
  }

}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at :${port}`)
})