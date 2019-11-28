var fs = require('fs');

module.exports = function(app){

    app.post('/upload/imagem', function(req, res){

        //## curl -X POST http://localhost:3000/upload/imagem --data-binary @files/Capturar.PNG -H "Content-type: application/octet-stream" -v -H "filename: imagem.jpg" ##
        console.log('Recebendo imagem');
        
        var filename = req.headers.filename;
        req.pipe(fs.createWriteStream('files/' + filename))
        .on('finish', function(){
            console.log('Arquivo escrito');
            res.status(201).send('OK');
            
        })


    });
}