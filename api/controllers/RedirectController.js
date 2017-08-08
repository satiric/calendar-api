/**
 * Created by decadal on 21.06.17.
 */


module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    /**
     * for resetPassword email. Link from action resetPassword linked to this action
     * @param req
     * @param res
     */
    deepLink: function(req, res) {
        res.redirect("vlife://reset?token=" + req.param('token'));
    }
};




