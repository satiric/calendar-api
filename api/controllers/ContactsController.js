/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     *
     * @param req
     * @param res
     */
    find: function (req, res) {
        User.findOne({"id": req.param('id')}, function (err, user) {
            return (user) ? res.ok({"status": "success", "user": user})
                : res.badRequest({"message": "User not found."});
        });
    },

    /**
     *
     * @param req
     * @param res
     */
    create: function (req, res) {
        var contacts = req.param('contacts');
        require('../utils/Contacts').create(29, contacts, function(err, result) {
            if(err) {
                return res.serverError({"details":err});
            }
            return res.ok();
        });
    }
};