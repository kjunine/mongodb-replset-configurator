'use strict';

var connector = require('./connector'),
    checker = require('./checker'),
    configurator = require('./configurator');

var id = 'v4d';
var master = '192.168.8.10:27017';
var slaves = ['192.168.8.11:27017'];
var forceReconfig = true;

connector.open(id, master, slaves)
  .spread(function(db, config) {
    return configurator.configure(id, db, config, forceReconfig)
      .then(function() {
        return checker.check(db);
      })
      .finally(function() {
        db.close();
      });
  });
