"use strict";

const ObjectID = require("mongodb").ObjectID;

module.exports = function(ctx) {
  // extract context from passed in object
  const db = ctx.db.db("tliqun-dev-db");
  const server = ctx.server;

  // assign collection to variable for further use
  const collection = db.collection("todos");

  // create
  // next seems like a callback
  server.post("/todos", (req, res, next) => {
    // extract data from body and add timestamps
    const data = Object.assign({}, req.body, {
      created: new Date(),
      updated: new Date()
    });

    // insert one object into the todos collections
    collection
      .insertOne(data)
      .then(doc => res.send(200, doc.ops[0]))
      .catch(err => res.send(500, err));

    next();
  });

  // read
  server.get("/todos", (req, res, next) => {
    // by default get limit of 10 stuff
    let limit = parseInt(req.query.limit, 10) || 10;
    // by default, skip 0 documents
    let skip = parseInt(req.query.skip);
    let query = req.query || {};

    // remove skip and limit from query to avoid false querying
    delete query.skip;
    delete query.limit;

    // find todos and convert to array (with optional query, skip and limit)
    // stacking functions like skip and limit works like this???
    collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray()
      .then(docs => res.send(200, docs))
      .catch(err => res.send(500, err));

    next();
  });

  // update
  server.put("/todos/:id", (req, res, next) => {
    // extract data from body and add timestamps
    const data = Object.assign({}, req.body, {
      updated: new Date()
    });

    // build out findOneAndUpdate variables to organize things
    let query = { _id: ObjectID(req.params.id) };
    let body = { $set: data };
    let opts = {
      returnNewDocument: true,
      upsert: true
    };

    // find and update document based on passed id (via route)
    collection
      .findOneAndUpdate(query, body, opts)
      .then(doc => res.send(200, doc))
      .catch(err => res.send(500, err));

    next();
  });

  // delete
  server.del("/todos/:id", (req, res, next) => {
    // remove one document based on passed in id
    collection
      .findOneAndDelete({ _id: ObjectID(req.params.id) })
      .then(doc => res.send(204))
      .catch(err => res.send(500, err));

    next();
  });
};
