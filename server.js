const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient
const dbCollectionUser = "voteruser";
let offsetDefault = 10;
let database;
let collect;

//DB functions
mongo.connect('mongodb://gunnja:gunnja@ds131854.mlab.com:31854/fccdb',(err, db) => {
  if (err) throw err
  else console.log("db connection successful")
  collect = db.collection(dbCollectionUser);
  database = db;
// db.close();
});

function dbInsert(collection,obj) {
  collection.insert(obj, function(err, data) {
    if (err) throw err
    database.close;
  })
}

function exists(collection, obj) {
  return new Promise(function(resolve, reject) {
    collection.findOne(obj, function(err, item) {
      console.log(item);
      if (err) {
        reject(err);
      } else if (item === null) {
        //doesnt exist
        resolve(false);
      } else {
        //exists
        resolve(true);
      }
    })
  })
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// signup routing
app.get("/signup", function (req, res) {
  let user = req.query.user;
  let pass = req.query.pass;
  exists(collect,{"user":user}).then(function(bool) {
    if (bool) {
      // already exists
      res.send({"error":`user ${user} already exists`});
    } else {
      // doesn't exist
      dbInsert(collect,{"user":user,"pass":pass},res);
      res.send({"nice":`user ${user} added`});
    }
  })
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

