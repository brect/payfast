var fs = require('fs');

fs.createReadStream('capturar.png')
    .pipe(fs.createWriteStream('imagem-com-stream.jpg'))
    .on('finish', function () {
        console.log('Arquivo escrito com Stream')
    });