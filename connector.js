'use strict';

var Q = require('bluebird'),
    _ = require('lodash'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var getServer = function(host) {
  var tokens = host.split(':');
  return new Server(tokens[0], tokens[1] || 27017);
};

var getConfig = function(id, servers) {
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

  return config;
};

exports.open = function(id, servers) {
  var db = new Db('local', getServer(servers[0]), { w: 1 });
  var config = getConfig(id, servers);

  var deferred = Q.defer();

  db.open(function(err, db) {
    if (err) return deferred.reject(err);
    deferred.resolve([db, config]);
  });

  return deferred.promise;
};
