function PagamentoDAO(connection) {
    this._connection = connection;
  }

  PagamentoDAO.prototype.salva = function(pagamento,callback) {
      this._connection.query('INSERT INTO PAGAMENTOS SET ?', pagamento, callback);
  }

  PagamentoDAO.prototype.atualiza = function(pagamento,callback) {
    this._connection.query('UPDATE PAGAMENTOS SET status = ? WHERE id = ?', [pagamento.status, pagamento.id], callback);
}

  PagamentoDAO.prototype.lista = function(callback) {
      this._connection.query('SELECT * FROM PAGAMENTOS',callback);
  }

  PagamentoDAO.prototype.buscaPorId = function (id,callback) {
      this._connection.query("SELECT * FROM PAGAMENTOS WHERE ID = ?",[id],callback);
  }

  module.exports = function(){
      return PagamentoDAO;
  };