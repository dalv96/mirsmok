'use strict'

const crypto = require('crypto');
const secret = 'kraKAaZ206yaBRa232SbYvv';

module.exports = {
    createHash: function (pass) {
        return crypto.createHmac('sha256', secret)
            .update(pass)
            .digest('hex');
    }
}
