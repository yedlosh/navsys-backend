import MongoClient from 'mongodb';
import assert from 'assert';
import * as constants from "../constants";

// Use connect method to connect to the Server
MongoClient.connect(constants.MONGODB_URL, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.close();
});
