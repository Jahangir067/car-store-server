const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



// Connect to DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d4qhn1l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // await client.connect();
    const inventoryCollection = client.db("carArchive").collection("inventory");
    //   Get all the data
    app.get("/inventory", async (req, res) => {
      const cursor = inventoryCollection.find()
      const inventoris = await cursor.toArray();
      res.send(inventoris);
      
    });
    //   Get data from specific id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const inventory = await inventoryCollection.findOne(query);
      res.send(inventory);
    });

    // Update quantity by delivery & the restock button
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      console.log(id, updateQuantity)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Add item to the DB
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      console.log(newItem)
      const result = await inventoryCollection.insertOne(newItem);
      res.send(result);
    });

    //   Delete item from the DB
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query =  { _id: new ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car store server running");
});

app.listen(port, () => {
  console.log(`Car Store on port ${port}`);
});
