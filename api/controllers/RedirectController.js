/**
 * Created by decadal on 21.06.17.
 */


module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    deepLink: function(req, res) {
        res.redirect("vlife://reset?token=" + req.param('token'));
    }
};




