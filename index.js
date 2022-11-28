const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { query } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pt0wvrl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const brandsCollection = client.db('sellPhone').collection('brands');
    const phoneCollection = client.db('sellPhone').collection('allPhones');
    const ordersCollection = client.db('sellPhone').collection('orders');
    const usersCollection = client.db('sellPhone').collection('users');

    app.get('/brands', async (req, res) => {
      const query = {};
      const brands = await brandsCollection.find(query).toArray();
      res.send(brands);
    });

    app.get('/brands/:brand', async (req, res) => {
      const query = req.params.brand;

      const filter = {
        brand: query,
      };
      const result = await phoneCollection.find(filter).toArray();
      res.send(result);
    });

    app.get('/orders', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);
    });

    app.post('/orders', async (req, res) => {
      const orders = req.body;

      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: '1h',
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: '' });
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.findOne(user);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.log);

app.get('/', async (req, res) => {
  res.send('SellPhone Server is Running');
});

app.listen(port, () => console.log(`SellPhone Server Running on ${port}`));
