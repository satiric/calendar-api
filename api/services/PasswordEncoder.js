/**
 * Created by decadal on 12.06.17.
 */

module.exports = {
    "bcryptEncode": function(values, next) {
        require('bcrypt').hash(values.password, 10, function (err, encryptedPassword) {
            if (err) {
                return next(err);
            }
            sails.log(encryptedPassword);
            values.password = encryptedPassword;
            next();
        });
    },
    "bcryptCheck": function(pass, hash, cb) {
        require('bcrypt').compare(pass, hash, cb);
    }
};