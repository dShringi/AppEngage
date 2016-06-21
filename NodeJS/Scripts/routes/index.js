exports.init = function(server, producer) {
  require('./events')(server, producer);
};
