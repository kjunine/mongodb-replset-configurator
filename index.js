'use strict';

var Q = require('bluebird'),
    _ = require('lodash'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var ID = 'v4d';
var MASTER = '192.168.8.10:27017';
var SLAVES = ['192.168.8.11:27017'];
var RECONFIG = false;

var getServer = function(host) {
  var tokens = host.split(':');
  return new Server(tokens[0], tokens[1] || 27017);
};

var server = getServer(MASTER);

var options = { w: 'majority' };

var config = {
  _id: ID,
  members:[
    { _id : 0, host : MASTER }
  ]
};

_.each(SLAVES, function(slave, index) {
  config.members.push({
    _id: index + 1,
    host: slave
  });
});

console.log('config:', config);

var openDatabase = function(db) {
  var deferred = Q.defer();

  db.open(function(err, db) {
    if (err) return deferred.reject(err);
    deferred.resolve([db, db.admin()]);
  });

  return deferred.promise;
};

var getConfig = function(db) {
  var deferred = Q.defer();

  var collection = db.collection('system.replset');

  collection.findOne({ _id: 'v4d' }, function(err, config) {
    if (err) return deferred.reject(err);
    deferred.resolve(config);
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

var replSetReconfig = function(admin, config, force) {
  var deferred = Q.defer();

  admin.command({ replSetReconfig: config, force: force }, function(err, info) {
    if (err) return deferred.reject(err);
    deferred.resolve(info);
  });

  return deferred.promise;
};

var configured = function(status) {
  var members = status.members;
  var count = members.length;
  var states = _.pluck(members, 'stateStr');
  var primaryCount = _.filter(states, function(state) {
    return state === 'PRIMARY';
  }).length;
  var secondaryCount = _.filter(states, function(state) {
    return state === 'SECONDARY';
  }).length;
  return primaryCount === 1 && secondaryCount === count - 1;
};

var checkStatus = function(admin) {
  return Q.delay(1000)
    .then(function() {
      return replSetStatus(admin);
    })
    .then(function(status) {
      console.log('status:', status);
      if (!configured(status)) {
        return checkStatus(admin);
      }
    });
};

openDatabase(new Db('local', server, options))
  .spread(function(db, admin) {
    return getConfig(db)
      .then(function(currentConfig) {
        console.log('currentConfig:', currentConfig);
        if (currentConfig) {
          if (RECONFIG) {
            config.version = currentConfig.version + 1;
            return replSetReconfig(admin, config);
          }
        } else {
          return replSetInitiate(admin, config);
        }
      })
      .then(function() {
        return checkStatus(admin);
      })
      .finally(function() {
        db.close();
      });
  });
