var JWT = require('jsonwebtoken')
var JWT1 = module.exports;

/**
* Will refresh the given token.  The token is expected to be decoded and valid. No checks will be
* performed on the token.  The function will copy the values of the token, give it a new
* expiry time based on the given 'expiresIn' time and will return a new signed token.
*
* @param token
* @param expiresIn
* @param secretOrPrivateKey
* @param callback
* @return New signed JWT token
*/
JWT1.refresh = function (token, expiresIn, secretOrPrivateKey, callback) {
    //TODO: check if token is not good, if so return error ie: no payload, not required fields, etc.
    token = JWT.decode(token);
    var done;
    if (callback) {
        done = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return process.nextTick(function () {
                callback.apply(null, args);
            });
        };
    }
    else {
        done = function (err, data) {
            if (err) {
                console.log('err : ' + err);
                throw err;
            }
            return data;
        };
    }
    var header;
    var payload;
    if (token.header) {
        header = token['header'];
        payload = token['payload'];
    }
    else {
        payload = token;
    }
    var optionMapping = {
        exp: 'expiresIn',
        aud: 'audience',
        nbf: 'notBefore',
        iss: 'issuer',
        sub: 'subject',
        jti: 'jwtid',
        alg: 'algorithm',
    };
    var newToken;
    var obj = {};
    var options = {};
    for (var key in payload) {
        if (Object.keys(optionMapping).indexOf(key) === -1) {
            obj[key] = payload[key];
        }
        else {
            options[optionMapping[key]] = payload[key];
        }
    }
    if (header) {
        options.headers = {};
        for (var key in header) {
            if (key !== 'typ') {    //don't care about typ -> always JWT
                if (Object.keys(optionMapping).indexOf(key) === -1) {
                    options.headers[key] = header[key];
                }
                else {
                    options[optionMapping[key]] = header[key];
                }
            }
        }
    }
    else {
        console.log('No algorithm was defined for token refresh - using default');
    }
    if (!token.iat) {
        options['noTimestamp'] = true;
    }
    obj.iat = Math.floor(Date.now()/1000);
    options['expiresIn'] = expiresIn// - token.iat;  
    console.log(options['expiresIn']);
    newToken = JWT.sign(obj, secretOrPrivateKey, options);
    return done(null, newToken);
};