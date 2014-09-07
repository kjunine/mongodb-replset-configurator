'use strict';

var Q = require('bluebird'),
    _ = require('lodash'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var getServer = function(host) {
  var tokens = host.split(':');
  return new Server(tokens[0], tokens[1] || 27017);
};

var getConfig = function(id, master, slaves) {
  var config = {
    _id: id,
    members:[
      { _id : 0, host : master }
    ]
  };

  _.each(slaves, function(slave, index) {
    config.members.push({
      _id: index + 1,
      host: slave
    });
  });

  return config;
};

exports.open = function(id, master, slaves) {
  var db = new Db('local', getServer(master), { w: 1 });
  var config = getConfig(id, master, slaves);

  var deferred = Q.defer();

  db.open(function(err, db) {
    if (err) return deferred.reject(err);
    deferred.resolve([db, config]);
  });

  return deferred.promise;
};
