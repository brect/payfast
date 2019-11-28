module.exports = function (app) {
    app.get('/pagamentos', function (req, res) {
        console.log('Recebida requisicao de teste na porta 3000.')
        res.send('OK.');
    });

    app.get('/pagamentos/pagamento/:id', function (req, res) {

        //curl -X GET http://localhost:3000/pagamentos/pagamento/3 -v
        var id = req.params.id;
        console.log('Consultando pagamento: ' + id);

        var memcachedClient = app.servicos.memcachedClient();

        memcachedClient.get('pagamento-' + id, function (retorno) {
            if (erro || !retorno) {
                console.log('MISS - Chave nao encontrada');
            } else {
                console.log('HIT - valor: ' + retorno);
            }
        })
        //realiza conexao no bd
        var connection = app.persistencia.connectionFactory();
        var pagamentoDAO = new app.persistencia.PagamentoDao(connection);

        pagamentoDAO.buscaPorId(id, (erro, resultado) => {
            if (erro) {
                console.log('Erro ao consultar no banco: ' + erro);
                res.status(500).send(erro);
                return;
            }
            console.log('Pagamento encontrato: ' + JSON.stringify(resultado));
            res.json(resultado);
            return;
        });
    });

    app.delete('/pagamentos/pagamento/:id', function (req, res) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        //realiza conexao no bd
        var connection = app.persistencia.connectionFactory();
        var pagamentoDAO = new app.persistencia.PagamentoDao(connection);

        pagamentoDAO.atualiza(pagamento, function (erro) {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            console.log('---pagamento cancelado---');
            res.status(204).send(pagamento);
        });

    });

    app.put('/pagamentos/pagamento/:id', function (req, res) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CONFIRMADO';

        var connection = app.persistencia.connectionFactory();
        var pagamentoDAO = new app.persistencia.PagamentoDao(connection);

        pagamentoDAO.atualiza(pagamento, function (erro) {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            console.log('---pagamento confirmado---');
            res.send(pagamento);
        });

    });

    app.post('/pagamentos/pagamento', function (req, res) {

        //gera pagamento atraves do terminal
        //## curl http://localhost:3000/pagamentos/pagamento -X POST -v -H "Content-type: application/json" -d @files/pagamento.json ##

        //validador do post pagamento
        req.assert("pagamento.forma_de_pagamento", "Forma de pagamento é obrigatória.").notEmpty();
        req.assert("pagamento.valor", "Valor é obrigatório e deve ser um decimal.").notEmpty().isFloat();
        req.assert("pagamento.moeda", "Moeda é obrigatória e deve ter 3 caracteres").notEmpty().len(3, 3);

        var errors = req.validationErrors();

        if (errors) {
            console.log("Erros de validação encontrados");
            res.status(400).send(errors);
            return;
        }

        var pagamento = req.body["pagamento"];
        console.log('processando uma requisicao de um novo pagamento');

        pagamento.status = 'CRIADO';
        pagamento.data = new Date;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDAO = new app.persistencia.PagamentoDao(connection);

        pagamentoDAO.salva(pagamento, function (erro, resultado) {
            if (erro) {
                console.log('Erro ao inserir no banco:' + erro);
                res.status(500).send(erro);
            } else {

                pagamento.id = resultado.insertId;
                console.log('pagamento criado: ' + resultado);

                var memcachedClient = app.servicos.memcachedClient();
                memcachedClient.set('pagamento-' + pagamento.id, pagamento, 60000, function (erro) {
                    console.log('Nova chave adicionada ao cache: pagamento -' + pagamento.id);
                });

                if (pagamento.forma_de_pagamento == 'cartao') {
                    var cartao = req.body["cartao"];
                    console.log(cartao);

                    var clienteCartoes = new app.servicos.clienteCartoes();

                    clienteCartoes.autoriza(cartao, function (exception, request, response, retorno) {

                        if (exception) {
                            console.log(exception);
                            res.status(400).send(exception);
                            return;
                        }

                        console.log(retorno);

                        res.location('/pagamentos/pagamento/' + resultado.insertId);

                        var response = {
                            dados_do_pagamento: pagamento,
                            cartao: retorno,
                            links: [{
                                    href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                    rel: "confirmar",
                                    method: "PUT"
                                },
                                {
                                    href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                    rel: "cancelar",
                                    method: "DELETE"
                                }
                            ]
                        }

                        res.status(201).json(retorno);
                        return;

                    });

                } else {

                    res.location('/pagamentos/pagamento/' + resultado.insertId);

                    var response = {
                        dados_do_pagamento: pagamento,
                        links: [{
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "confirmar",
                                method: "PUT"
                            },
                            {
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "cancelar",
                                method: "DELETE"
                            }
                        ]
                    }
                    res.status(201).json(response);
                }
            }
        });
    });
}