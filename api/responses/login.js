/**
 * Created by decadal on 10.06.17.
 */
module.exports = function login(email, pass) {
    // Get access to `req` and `res`
    var req = this.req;
    var res = this.res;
    // Look up the user
    User.login(email, pass, function (err, user) {
        if (err) {
            return res.json(401, {"status": "error", "message": err.message});
        }

        if (!user) {
            return res.json(401, {"status": "error", "message": 'Invalid username/password combination.'});
        }

        return res.ok({
            "status": "success",
            "user": user
        });
    });
};
