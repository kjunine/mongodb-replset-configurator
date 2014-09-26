'use strict';

var connector = require('./connector'),
    checker = require('./checker'),
    configurator = require('./configurator');

var id = process.env.MRSC_ID;
var servers = process.env.MRSC_SERVERS && process.env.MRSC_SERVERS.split(',');
var arbiters = process.env.MRSC_ARBITERS && process.env.MRSC_ARBITERS.split(',');
var reconfig = process.env.MRSC_RECONFIG && process.env.MRSC_RECONFIG.toLowerCase() === 'true';

if (!id) return console.log('The environment variable MRSC_ID is required.');
if (!servers) return console.log('The environment variable MRSC_SERVERS is required.');

connector.open(id, servers, arbiters)
  .spread(function(db, config) {
    return configurator.configure(id, db, config, reconfig)
      .then(function(configured) {
        var delay = configured ? 2000 : 0;
        return checker.check(db, delay);
      })
      .finally(function() {
        db.close();
      });
  });
