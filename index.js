const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { query } = require('express');
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
  } finally {
  }
}

run().catch(console.log);

app.get('/', async (req, res) => {
  res.send('SellPhone Server is Running');
});

app.listen(port, () => console.log(`SellPhone Server Running on ${port}`));
