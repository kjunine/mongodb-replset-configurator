'use strict';

var connector = require('./connector'),
    checker = require('./checker'),
    configurator = require('./configurator');

var id = process.env.MRSC_ID;
var servers = process.env.MRSC_SERVERS && process.env.MRSC_SERVERS.split(',');
var reconfig = process.env.MRSC_RECONFIG && process.env.MRSC_RECONFIG.toLowerCase() === 'true';

if (!id) return console.log('The environment variable MRSC_ID is required.');
if (!servers) return console.log('The environment variable MRSC_SERVERS is required.');

connector.open(id, servers)
  .spread(function(db, config) {
    return configurator.configure(id, db, config, reconfig)
      .then(function() {
        return checker.check(db);
      })
      .finally(function() {
        db.close();
      });
  });
