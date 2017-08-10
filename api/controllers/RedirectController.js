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

        var token = req.param('token');
        require('../utils/UserAuth').getUserByResetToken(token, function(err, result){
            if(err) {
                return res.send(err.message);
            }
            if(!result) {
                return res.send('<h1>The link has expired</h1>');
            }
            return res.redirect("vlife://reset?token=" + req.param('token'));
        });
    }
};




