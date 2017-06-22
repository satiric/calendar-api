/**
 * Created by decadal on 22.06.17.
 */


module.exports = {
    extractAuthKey: function (req) {
        return req.headers['auth-token'] || req.param('auth-token') || '';
    }, 
    checkToken: function(req, cb) {
        let key = this.extractAuthKey(req);
        AuthToken.findOne({
            "value": key,
            "expire_date": {'>': new Date()}
        }).populate('owner').exec(function (err, result) {
            cb(err, result); //todo make check token expire
        });
    },
    login: function(user, timeExp, cb) {
        AuthToken.destroy({
            'owner': user.id
        }).exec(function (err) {
            if (err) {
                return cb(err);
            }
            AuthToken.create({
                'owner': user.id, 
                'is_active' : 1, 
                'expire_date': new Date(Date.now() + timeExp)
            }).exec(function (err, token) {
                if (err) {
                    return cb(err);
                }
                cb(err, token);
            });
        });
    }, 
    logout: function(token, cb) {
        AuthToken.destroy({
            'value': token
        }).exec(cb);
    }
};