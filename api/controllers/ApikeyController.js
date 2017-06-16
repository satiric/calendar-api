/**
 * ApikeyController
 *
 * @description :: Server-side logic for managing apikeys
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    _config: {
        actions: true,
        shortcuts: false,
        rest: false
    },
    red: function(req, res) {
        res.redirect("vlife://reset?token=" + req.param('token'));
    }
};

