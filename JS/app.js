// const ObjectID = require("bson");
const ObjectID = require("mongodb").ObjectId;
const express = require("express");
const app = express();

const path = require('path')
const fs = require('fs');

const donenv = require("dotenv").config();

app.use(express.json());

// port = process.env.PORT || 3000;


app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// Logger
app.use(function(request, response, next) {
    console.log("In comes a " + request.method + " to: " + request.url);
    next();
});
app.use((express.static("public")));


const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb+srv://umairdada:mcJVnWcY0jQ7TM8H@cluster0.0synoa4.mongodb.net',(err, client)=> {
    db = client.db('webstore')
})


app.get('/', (req,res,next) => {
    res.send('Select a collection, e.g, /collection/messages')
})

app.param('collectionName', (req,res,next,collectionName) =>{
    req.collection = db.collection(collectionName)
    return next()
})

// Get collection
app.get('/collection/:collectionName', (req,res,next) => {
    req.collection.find({}).toArray((e,results) => {
        if(e) return next(e)
        res.send(results)
    })
})

// Add object
app.post('/collection/:collectionName', (req,res,next) => {
    req.collection.insertOne(req.body, (e,results) => {
        if(e) return next(e)
        res.send(results.ops)
    })
})

// Get Object
app.get('/collection/:collectionName/:id', (req,res,next)=>{
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e,results) => {
        if (e) return next(e)
        res.send(results)
    })
})

// Update Object
app.put('/collection/:collectionName/:id', (req,res,next)=>{
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e,results) => {
        if (e) return next(e)
        res.send(results ? {msg: 'sucess'} : {msg: 'error'})
    })
})


// Delete object
app.delete('/collection/:collectionName/:id', (req,res,next)=>{
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e,results) => {
        if (e) return next(e)
        res.send(results ? {msg: 'sucess'} : {msg: 'error'})
    })
})

// Search object
app.get("/collection/:collectionName/:search",  (req, res, next) => {
    var search = req.params.search;
    req.collection.find({"subject": {"$regex": search, "$options": "i"}}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});
  
  

// File middleware
app.use(function(req,res,next) {
    var filePath = path.join(__dirname, "images", req.url);
    fs.stat(filePath, function(err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        }
        else {
            next();
        }
    });
});

app.use(function(req,res, next) {
    res.status(404);
    res.send("File not found");
});


const port = process.env.PORT || 3000;
app.listen(port, function() {
console.log("App started on port: " + port);
});
