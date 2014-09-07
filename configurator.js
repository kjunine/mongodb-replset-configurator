'use strict';

var Q = require('bluebird');

var getConfig = exports.getConfig = function(id, db) {
  var deferred = Q.defer();

  var collection = db.collection('system.replset');

  collection.findOne({ _id: id }, function(err, config) {
    if (err) return deferred.reject(err);
    deferred.resolve(config);
  });

  return deferred.promise;
};

var initiate = exports.initiate = function(db, config) {
  var deferred = Q.defer();

  db.admin().command({ replSetInitiate: config }, function(err, info) {
    if (err) return deferred.reject(err);
    deferred.resolve(info);
  });

  return deferred.promise;
};

var reconfig = exports.reconfig = function(db, config, force) {
  var deferred = Q.defer();

  db.admin().command({ replSetReconfig: config, force: force }, function(err, info) {
    if (err) return deferred.reject(err);
    deferred.resolve(info);
  });

  return deferred.promise;
};

exports.configure = function(id, db, config, forceReconfig) {
  return getConfig(id, db)
    .then(function(currentConfig) {
      if (currentConfig) {
        if (forceReconfig) {
          config.version = currentConfig.version + 1;
          console.log('Reconfiguring.. config:', config);
          return reconfig(db, config);
        } else {
          console.log('Already configured.. current config:', currentConfig);
        }
      } else {
        console.log('Initializing.. config:', config);
        return initiate(db, config);
      }
    });
};

exports.getStatus = function(db) {
  var deferred = Q.defer();

  db.admin().replSetGetStatus(function(err, status) {
    if (err) return deferred.reject(err);
    deferred.resolve(status);
  });

  return deferred.promise;
};
