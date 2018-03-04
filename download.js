var ftpClient = require('ftp-client'),
    config = require('./conf/secure'),
    client = new ftpClient(config, {
        logging: 'basic'
    });

client.connect(function () {
    client.download('/pub', './import', {
       overwrite: 'all'
   }, function (result) {
       console.log(result);
       process.exit(0);
   });
})
