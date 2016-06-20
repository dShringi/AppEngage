exports.init = function(server, producer) {
  require('./events_producer')(server, producer);
};
