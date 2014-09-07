'use strict';

var connector = require('./connector'),
    checker = require('./checker'),
    configurator = require('./configurator');

var id = process.env.MRSC_ID;
var master = process.env.MRSC_MASTER;
var slaves = process.env.MRSC_SLAVES && process.env.MRSC_SLAVES.split(',');
var reconfig = process.env.MRSC_RECONFIG && process.env.MRSC_RECONFIG.toLowerCase() === 'true';

if (!id) return console.log('The environment variable MRSC_ID is required.');
if (!master) return console.log('The environment variable MRSC_MASTER is required.');
if (!slaves) return console.log('The environment variable MRSC_SLAVES is required.');

connector.open(id, master, slaves)
  .spread(function(db, config) {
    return configurator.configure(id, db, config, reconfig)
      .then(function() {
        return checker.check(db);
      })
      .finally(function() {
        db.close();
      });
  });
