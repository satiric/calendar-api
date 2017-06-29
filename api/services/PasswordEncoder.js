/**
 * Created by decadal on 12.06.17.
 */

module.exports = {
    "bcryptEncode": function(values, next) {
        if(!values.password) {
            return next();
        }
        require('bcrypt-nodejs').hash(values.password, null, null, function (err, encryptedPassword) {
            if (err) {
                return next(err);
            }
            values.password = encryptedPassword;
            return next();
        });
    },
    "bcryptCheck": function(pass, hash, cb) {
        console.log('2');
        require('bcrypt-nodejs').compare(pass, hash, cb);
    },
    "bcryptEncodeValue": function (value, cb) {
        console.log('3');
        require('bcrypt-nodejs').hash(value, null, null, function (err, encryptedPassword) {
            return cb(err, encryptedPassword);
        });
    },
};