const express = require('express');
const http = require("https");
const qs = require('qs');
const app = express();
const mongo = require('mongodb').MongoClient;
const fb = require('fb');
const secret = "R4HKjRnDg3uiTD67qDGZHRFBr2cxDOcgzM2FcpbzGqaqhUa7G7cFzTgSppbPW0W7";
const client_id = "omnNEDgvztg3Pa0M6qtIGQ";
const url = "https://api.yelp.com/oauth2/token";
let collectNight;

//DB functions
mongo.connect('mongodb://gunnja:gunnja@ds131854.mlab.com:31854/fccdb',(err, db) => {
  if (err) throw err
  else console.log("db connection successful")
  collectNight = db.collection("nightlife");
  //database = db;
// db.close();
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// yelp api req
function searchYelp(loc) {
  return new Promise(function(resolve,reject) {
    let locStr = encodeURI(loc);
    let options = {
      "method": "GET",
      "hostname": "api.yelp.com",
      "port": null,
      "path": `/v3/businesses/search?location=${locStr}&categories=nightlife%2C%20All`,
     "headers": {
        "authorization": "Bearer FavcJmxh6-z54yUIkjsl2E7T68mLxVvID6u2S_9009BV-KyFz9KlYOXbdkwkv7YNl7_gsDMjf8X4f2ZfUZLiwNuc_EyyJ6aYNRiNZFEJPEWs3efyanc5ExeIPdATWnYx"
     }
    };
    
    let req = http.request(options, function (res) {
      let chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function () {
        let body = Buffer.concat(chunks);
        let bodyStr = (body.toString());
        let newJSON = JSON.parse(bodyStr);
        let newArr = dbExists(collectNight,newJSON);
        resolve(newArr);
      });
    });
    req.end();
  });
}

function dbExists(collection, obj) {
  return new Promise(function(resolve, reject) {
    let busArr = obj.businesses;
    let newArr = [];
    for(i = 0; i < busArr.length; i += 1) {
      let item = busArr[i];
      dbProc(collection,item).then(function(updatedObj) {
        newArr.push(updatedObj)
        if (newArr.length === busArr.length) {
          //console.log(newArr);
          resolve(newArr);
        }
      });
    }
  });
}

function dbProc(collection, item) {
  return new Promise(function(resolve, reject) {
    let updatedObj = item;
    let qObj = { "ID" : item.id};
    collection.findOne(qObj, function(err, result) {
      //console.log(result);
      if (err) {
        reject(err);
      } else if (result === null) {
        //doesnt exist
        dbInsert(collection,{ "ID" : item.id, "attending" : [] });
        updatedObj["attending"] = 0;
        resolve(updatedObj);
      } else {
        //exists
        let attending = result.attending;
        updatedObj["attending"] = attending.length;
        resolve(updatedObj);
      }
    });
  });
}

function dbInsert(collection,obj) {
  collection.insert(obj, function(err, data) {
    if (err) throw err
  })
}

function dbAttend(collection,id,user) {
  return new Promise(function(resolve, reject) {
    let qObj = { "ID" : id };
    collection.findOne(qObj, function(err, result) {    
      if (err) {
        throw err
      } else {
        let currAttending = result.attending;
        if (currAttending.includes(user)) {
          let newAttending = currAttending.filter( item => item != user);
          dbUpdate(collection,qObj,newAttending).then(function(attObj) {
            resolve(attObj);
          });
        } else {
          let newAttending = currAttending.concat(user);
          dbUpdate(collection,qObj,newAttending).then(function(attObj) {
            resolve(attObj);
          });
        }
      } 
    });
  });
}

function dbUpdate(collection,obj,arr) {
	return new Promise(function(resolve,reject) {
		let newObj =Object.assign({}, obj);
		newObj["attending"] = arr;
		collection.update(obj, newObj, function(err, data) {
      if (err) {
        throw err
      } else {
  			let attObj = {};
  			attObj["total"] = arr.length;
  			attObj["attending"] = arr;
  			resolve(attObj);
      }
		});
	});
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// vote routing
app.get("/search", function (req, res) {
  let city = req.query.city;
  console.log("trigger",city);
  searchYelp(city).then(function(obj) {
    res.send(obj);
  });
});

// attending routing
app.get("/attending", function (req, res) {
  let id = req.query.id;
  let user = req.query.user;
  dbAttend(collectNight,id,user).then(function(attObj) {
    res.send(attObj);
  });
});