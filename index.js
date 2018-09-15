"use strict";

const config = require("./config");
const restify = require("restify");
const MongoClient = require("mongodb").MongoClient;

// init server
const server = restify.createServer({
  name: config.name,
  version: config.version
});

// add plugins
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());

// lift server, connect to DB and require route file
server.listen(config.port, () => {
  // connect to mongodb atlas and listen
  MongoClient.connect(
    config.db.uri,
    { useNewUrlParser: true },
    (err, client) => {
      if (err) {
        console.log(
          "local connector has an error while attempting to connect to MongoDB\n",
          "first check if your MongoDB has whitelisted this current IP address (it changes everytime you connect online)\n",
          "below is the error:\n",
          err
        );
        process.exit(1);
      }

      console.log(
        "%s v%s ready to accept connections on port %s in %s environment.",
        server.name,
        config.version,
        config.port,
        config.env
      );

      const db = client;

      require("./routes")({ db, server });
    }
  );
});
