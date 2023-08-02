const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.92d2eha.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allDataCollection = client.db("data").collection("alldata");

    // Get Data From Server
    app.get("/alldata", async (req, res) => {
      const data = await allDataCollection.find().toArray();
      res.send(data);
    });

    // Update Data
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedData = req.body;
      console.log(updatedData, id);
      const updateData = {
        $set: {
          title: updatedData.title,
          description: updatedData.description,
          status: updatedData.status,
        },
      };
      const result = await allDataCollection.updateOne(
        filter,
        updateData,
        options
      );
      res.send(result);
    });

    // Add A Data
    app.post("/alldata", async (req, res) => {
      const allData = req.body;
      const result = await allDataCollection.insertOne(allData);
      res.send(result);
    });

    // Delete Data
    app.delete("/alldata/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = await allDataCollection.deleteOne(query);
      res.send(data);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});