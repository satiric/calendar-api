/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../../exceptions/Logic');
var ValidationE = require('../../exceptions/Validation');
var UserAuth = require("../../utils/UserAuth");

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     * 1. save user
     * 2. send email
     * 3. login
     * @param req
     * @param res
     */
    signup: function (req, res) {
        User.create(req.body).exec(function (err, user) {
            if (err) {
                return (err.Errors)
                    //todo refactor it
                    ? res.badRequest({"message": _.values(err.Errors)[0][0].message, "status": "error"})
                    : res.serverError({"details": err, "status": "error"});
            }
            require('../utils/UserSignup').signup(user, function (err, result) {
                if (err) {
                    return res.serverError({"status": "error", "details": err});
                }
                var token = result.token;
                delete result.token;
                return res.ok({user: result, "token": token});
            });
        });
    },
    /**
     *
     * @param req
     * @param res
     * @returns {*}
     */
    login: function (req, res) {
        var email = req.param('email');
        var pass = req.param('password');

        User.login(email, pass, function (err, user) {
            if (err) {
                return res.json(401, {"status": "error", "message": err.message});
            }

            if (!user) {
                return res.json(401, {"status": "error", "message": 'Invalid username/password combination.'});
            }
            var token = user.token;
            delete user.token;
            return res.ok({user: user, "token": token});
        });
    }
};