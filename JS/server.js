// const { ObjectID } = require("bson");
const ObjectID = require("mongodb").ObjectId;
const express = require("express");
const app = express();

const path = require('path')
const fs = require('fs');

const donenv = require("dotenv").config();

app.use(express.json());

port = process.env.PORT || 3000;

app.use((req, res, next) => {
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
        return res.status(200).json({});
    }
    next();
    });

app.use((req, res, next) => {
    console.log("Request Made => " + `${req.method} ${req.url}`);
    next();
});

// connect to MongoDB

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect(process.env.CONNECTION_URL, { useUnifiedTopology: true }, (err, client) => {
    db = client.db("webstore");}
);

app.get("/", (req, res, next) => {
    res.send("Select a collection, e.g., /collection/messages");
});

app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

//collection Insert is deprecated

app.post("/collection/:collectionName", (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

app.get("/collection/:collectionName/:search", (req, res, next) => {
    var search = req.params.search;
    req.collection.find({"subject": {"$regex": search, "$options": "i"}}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.use('/images',express.static(path.join(__dirname,'../img')));
app.use((req,res, next) => {
    res.status(404).send('Image not found.');
});

// app.get("/collection/:collectionName/:id", (req, res, next) => {
//     req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
//         if (e) return next(e);
//         res.send(result);
//     });
// });

app.get("/collection/:collectionName/:id", (req, res) => {
    req.collection.findOne({_id: ObjectID(req.params.id)}, (e,results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e);
            res.send(result);
        }
    );
});

app.listen(port, () => {
    console.log(`API running on port ${port}`);
});