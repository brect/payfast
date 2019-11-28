var memcached = require('memcached');

module.exports = function (app) {
    return createMencachedCliente;
}

function createMencachedCliente() {
    var cliente = memcached('localhost:11211', {
        maxKeySize: 2592000,
        retries: 10,
        retry: 10000,
        remove: true
        // maxKeySize: 250
    });
    return cliente;
}




