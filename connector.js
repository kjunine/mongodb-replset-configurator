'use strict';

var Q = require('bluebird'),
    _ = require('lodash'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var getServer = function(host) {
  var tokens = host.split(':');
  return new Server(tokens[0], tokens[1] || 27017);
};

var getConfig = function(id, servers, arbiters) {
  var config = {
    _id: id,
    members:[]
  };

  _.each(servers, function(server, index) {
    config.members.push({
      _id: index,
      host: server
    });
  });

  var offset = servers.length;

  _.each(arbiters, function(arbiter, index) {
    config.members.push({
      _id: offset + index,
      host: arbiter,
      arbiterOnly: true
    });
  });

  return config;
};

exports.open = function(id, servers, arbiters) {
  var db = new Db('local', getServer(servers[0]), { w: 1 });
  var config = getConfig(id, servers, arbiters);

  var deferred = Q.defer();

  db.open(function(err, db) {
    if (err) return deferred.reject(err);
    deferred.resolve([db, config]);
  });

  return deferred.promise;
};
