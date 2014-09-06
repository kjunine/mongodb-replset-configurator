'use strict';

var Q = require('bluebird'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var MASTER_HOST = '192.168.8.10';
var MASTER_PORT = 27017;
var SLAVE_HOST = '192.168.8.11';
var SLAVE_PORT = 27017;

var config = {
  _id: 'v4d',
  members:[
    { _id : 0, host : MASTER_HOST + ':' + MASTER_PORT },
    { _id : 1, host : SLAVE_HOST + ':' + SLAVE_PORT }
  ]
};

var openDatabase = function(db) {
  var deferred = Q.defer();

  db.open(function(err, db) {
    if (err) return deferred.reject(err);
    deferred.resolve(db.admin());
  });

  return deferred.promise;
};

var replSetStatus = function(admin) {
  var deferred = Q.defer();

  admin.replSetGetStatus(function(err, info) {
    if (err) return deferred.reject(err);
    deferred.resolve(info);
  });

  return deferred.promise;
};

var replSetInitiate = function(admin, config) {
  var deferred = Q.defer();

  admin.command({ replSetInitiate: config }, function(err, info) {
    if (err) return deferred.reject(err);
    deferred.resolve(info);
  });

  return deferred.promise;
};

var db = new Db('default', new Server(MASTER_HOST, MASTER_PORT));

openDatabase(db)
  .then(function(admin) {
    return replSetStatus(admin)
      .catch(function(err) {
        if (err.ok === 0  && err.startupStatus === 3) {
          return replSetInitiate(admin, config)
            .then(function() {
              return Q.delay(1000);
            })
            .then(function() {
              return replSetStatus(admin);
            });
        }
        throw err;
      })
      .then(function(status) {
        console.log('status:', status);
      })
      .finally(function() {
        db.close();
      });
    });

// db.open(function(err, db) {
//   var admin = db.admin();

//   admin.replSetGetStatus(function(err, info) {
//     if (err) {
//       console.log('status err:', err);

//       admin.command({ replSetInitiate: config }, function(err, info) {
//         if (err) {
//           console.log('command err:', err);
//         } else {
//           console.log('command info:', info);
//         }

//         db.close();
//       });
//     } else {
//       console.log('status info:', info);

//       db.close();
//     }
//   });
// });
