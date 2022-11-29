const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized Access');
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  });
}

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

    app.get('/orders', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'Forbidden Access' });
      }

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

    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put('/users/admin/:id', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'Forbidden Access' });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin',
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
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
