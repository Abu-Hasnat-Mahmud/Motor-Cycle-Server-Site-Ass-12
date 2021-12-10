const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
// middleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5fzvw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5fzvw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("motor_cycle_shop");
    const packageCollection = database.collection("packages");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    //GET packages API
    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find().toArray();
      res.send(result);
    });

    // post package
    app.post("/AddPackage", async (req, res) => {
      const singlePackage = req.body;

      const result = await packageCollection.insertOne(singlePackage);
      res.send(result);
      //res.send("result");
    });

    app.get("/Package/Delete/:packageId", async (req, res) => {
      const packageId = req.params.packageId;
      const filter = { _id: ObjectId(packageId) };
      const result = await packageCollection.deleteOne(filter);
      res.send(result);
    });

    //GET all order API
    app.get("/Order", async (req, res) => {
      const query = { status: "Pending" };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    //GET packages API
    app.get("/MyOrder/:email", async (req, res) => {
      const query = { email: req.params.email, status: "Pending" };

      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // order post
    app.post("/MyOrder", async (req, res) => {
      const singleOrder = req.body;
      console.log(singleOrder);
      const result = await orderCollection.insertOne(singleOrder);
      res.send(result.acknowledged);
    });

    //  update order
    app.put("/MyOrder", async (req, res) => {
      const singleOrder = req.body;
      const filter = { _id: ObjectId(singleOrder._id) };
      // this option instructs the method to create a document if no documents match the filter
      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: {
          status: singleOrder.status,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.send(result.acknowledged);
    });

    // // Use POST to get data by keys
    // app.post("/Order", async (req, res) => {
    //   const singleOrder = req.body;
    //   const query = { key: { $in: keys } };
    //   const products = await productCollection.find(query).toArray();
    //   res.send(products);
    // });

    // Add Orders API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // user API

    app.get("/Users/:email", async (req, res) => {
      const query = { email: req.params.email };
      console.log("check admin", query);
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/makeAdmin", async (req, res) => {
      const user = req.body;

      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // review
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reiview = req.body;
      const result = await reviewsCollection.insertOne(reiview);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// app.get("/himu", (req, res) => {
//   client.connect((err) => {
//     const collection = client.db("tour").collection("package");
//     console.log("mongo connect");
//     res.send("connect");
//     client.close();
//   });
// });

app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
