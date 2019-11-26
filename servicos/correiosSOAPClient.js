var soap = require('soap');


function CorreiosSOAPCliente(){
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}
module.exports = function(){
    return CorreiosSOAPCliente;
}

CorreiosSOAPCliente.prototype.calculaPrazo = function(args, callback){
    soap.createClient(this._url, function (erro, cliente) {
            console.log('...Cliente SOAP criado...');
            cliente.CalcPrazo(args, callback)
        });
}

