'use strict';

var Q = require('bluebird'),
    _ = require('lodash'),
    configurator = require('./configurator');

var isConfigured = function(status) {
  var members = status.members;
  var count = members.length;
  var states = _.pluck(members, 'stateStr');
  var primaryCount = _.filter(states, function(state) {
    return state === 'PRIMARY';
  }).length;
  var secondaryCount = _.filter(states, function(state) {
    return state === 'SECONDARY';
  }).length;
  var arbiterCount = _.filter(states, function(state) {
    return state === 'ARBITER';
  }).length;
  return primaryCount === 1 && secondaryCount + arbiterCount === count - 1;
};

var summarize = function(status) {
  return {
    ok: status.ok,
    set: status.set,
    date: status.date,
    members: _.map(status.members, function(member) {
      return {
        name: member.name,
        state: member.stateStr
      };
    })
  };
};

var check = exports.check = function(db, delay) {
  return Q.delay(delay)
    .then(function() {
      return configurator.getStatus(db);
    })
    .then(function(status) {
      console.log('Current status:', summarize(status));
      if (!isConfigured(status)) {
        return check(db, 2000);
      }
    });
};
