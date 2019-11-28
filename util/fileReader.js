var fs = require('fs');

fs.readFile('capturar.png', function(error, buffer){
    console.log('Arquivo Lido');
    fs.writeFile('imagem2.jpg', buffer, function(){
        console.log('Arquivo escrito');
    });

});

