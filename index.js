const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

const uri =
  'mongodb+srv://<username>:<password>@cluster0.pt0wvrl.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db('test').collection('devices');
  // perform actions on the collection object
  client.close();
});

app.get('/', async (req, res) => {
  res.send('SellPhone Server is Running');
});

app.listen(port, () => console.log(`SellPhone Server Running on ${port}`));
