const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient
const dbCollectionUser = "voteruser";
const dbCollectionPolls = "voterpolls";
let loggedIn = false;
let offsetDefault = 10;
let database;
let collectUser;
let collectPoll;

//DB functions
mongo.connect('mongodb://gunnja:gunnja@ds131854.mlab.com:31854/fccdb',(err, db) => {
  if (err) throw err
  else console.log("db connection successful")
  collectUser = db.collection(dbCollectionUser);
  collectPoll = db.collection(dbCollectionPolls);
  database = db;
// db.close();
});

function dbInsert(collection,obj) {
  collection.insert(obj, function(err, data) {
    if (err) throw err
    database.close;
  })
}

function dbUpdate(collection,obj,name) {
  let qObj = { "name" : name };
  collection.update(qObj, obj, function(err, data) {
    if (err) throw err
    database.close;
  })
}

function dbVote(collection,name,option) {
  let qObj = { "name" : name };
  return new Promise(function(resolve,reject) {
    dbFindOne(collection,name).then(function(data) {
      let wholeObj = data;
      console.log(wholeObj, option);
      let newObj = wholeObj.options;
      newObj[option] += 1;
      wholeObj.options = newObj;
      console.log(newObj);
      collection.update(qObj, wholeObj, function(err, data) {
      if (err) throw err
      database.close;
      resolve(wholeObj);
      })
    });
  });
}

function dbFindOne(collection,pollName) {
  return new Promise(function(resolve, reject) {
    collection.findOne({"name":pollName}, function(err, data) {
      if (err) throw err
      else resolve(data);
    })
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

// user check routing
app.get("/usercheck", function (req, res) {
  let user = req.query.user;
  exists(collectUser,{"user":user}).then(function(bool) {
    console.log("bool",bool);
    if (bool) {
      // already exists
      res.send({"user": "existing"})
    } else {
      // doesn't exist
      res.send({"user": "new"})
    }
  })
});

// signup routing
app.get("/signup", function (req, res) {
  let user = req.query.user;
  let pass = req.query.pass;
  exists(collectUser,{"user":user}).then(function(bool) {
    if (bool) {
      // already exists
      res.send({"error": `user ${user} already exists`})
    } else {
      // doesn't exist
      console.log("signup bool", bool);
      dbInsert(collectUser,{"user":user,"pass":pass},res);
      res.send({"loggedIn": true});
    }
  })
});

// login routing
app.get("/login", function (req, res) {
  let user = req.query.user;
  let pass = req.query.pass;
  exists(collectUser,{"user":user, "pass":pass}).then(function(bool) {
    if (bool) {
      // password match
      res.send({"loggedIn": true});
    } else {
      // password incorrect
      res.send({"error":`password for user ${user} incorrect`});
    }
  })
});

// logout routing
app.get("/logout", function (req, res) {
    res.send({"loggedIn": false});
});

// new poll routing
app.get("/new", function (req, res) {
  let pollName = req.query.name;
  exists(collectPoll,{"name":pollName}).then(function(bool) {
    if (bool) {
      // already exists
      res.send({'existing': bool });
    } else {
      dbInsert(collectPoll,{"name":pollName});
      res.send({'existing': bool });
    }
  });
});

// add options routing
app.post("/modify", function (req, res) {
  let pollName = req.query.name;
  let option = req.query.option;
  dbFindOne(collectPoll,pollName).then(function(data) {
    let pollObj = data;
    if (pollObj.options) {
      // options exists
      if (option in pollObj.options) {
        // new option already exists
        res.send({"error": "option already exists"});
      } else {
        // new option doesnt exist
        let options = pollObj.options;
        options[option] = 0;
        let newObj = { "name" : pollName, "options" : options};
        console.log("1st",newObj);
        dbUpdate(collectPoll,newObj,pollName);
        res.send(newObj);
      }
    } else {
      // options doesnt exist
      let options = {};
      options[option] = 0;
      let newObj = { "name" : pollName, "options" : options};
      console.log("2nd",newObj);
      dbUpdate(collectPoll,newObj,pollName);
      res.send(newObj);
    }
  })
});

// vote routing
app.get("/vote", function (req, res) {
  let pollName = req.query.name;
  let optionName = req.query.option;
  dbVote(collectPoll,pollName,optionName).then(function(obj) {
    res.send(obj);
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


