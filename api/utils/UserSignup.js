/**
 * Created by decadal on 27.06.17.
 */

module.exports = {
    signup: function(user, cb) {
        Mailer.sendWelcomeMail(user);
        return require('./UserAuth').login(user, 60 * 60 * 24 * 30 * 1000, cb);
    }
};