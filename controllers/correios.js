module.exports = function(app){


    app.post('/correios/calcula-prazo', function(req, res){

            //calcula o prazo atraves do terminal
    //## curl http://localhost:3000/correios/calcula-prazo -X POST -v -H "Content-type: application/json" -d @files/dados-entrega.json ##

        var dadosDaEntrega = req.body;

        var correiosSOAPCliente = new app.servicos.correiosSOAPClient();

        correiosSOAPCliente.calculaPrazo(dadosDaEntrega,
            function (erro, resultado) {
                if(erro){
                    res.status.send(erro);
                    return;
                }
                console.log('...Prazo calculado...');
                res.json(resultado);
            });
    });
}