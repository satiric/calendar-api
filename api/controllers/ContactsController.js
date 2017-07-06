/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var LogicE = require('../exceptions/Logic');
var ValidationE = require('../exceptions/Validation');
var UserAuth = require('../utils/UserAuth');
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
        Phone.find([{id:"678921291"}, {id:"12432143323"}]).exec(function(err, result){
            return res.ok({"err":err, "res": result});
        });
        //User.findOne({"id": req.param('id')}, function (err, user) {
     //       return (user) ? res.ok({"status": "success", "user": user})
       //         : res.badRequest({"message": "User not found."});
       // });
    },

    /**
     *
     * @param req
     * @param res
     */
    create: function (req, res) {
        var contacts = req.param('contacts');
        var token = Auth.extractAuthKey(req);
        UserAuth.getUserByAuthToken(token, function(err, user) {
            if(err) {
                return res.serverError({"data": err});
            }
            if(!user) {
                return res.badRequest({"message": "User not found"});
            }
            require('../utils/Contacts').create(user.id, contacts, function(err, result) {
                if(err) {
                    return res.serverError({"details":err});
                }
                return res.ok({"data": result});
            });
        });
    }
};