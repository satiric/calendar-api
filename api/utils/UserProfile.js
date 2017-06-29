/**
 * Created by decadal on 27.06.17.
 */
module.exports = {
    getProfile: function(user, cb) {

        return File.find({'id' : user.avatar }, function(err, file) {
            if(err) {
                return cb( err );
            }
            result.avatar_url = file[0].url;
            return res.ok({user: result, "status" : "success" });
        });
    },
    getAvatar: function(user, cb) {
        if(! user.avatar_id) {
            return cb();
        }
        return File.find({'id' : user.avatar_id }, function(err, file){
            if(!err && (!file || !file.length)) {
                err = new Error("file is not found");
            }
            if(err) {
                return cb(err);
            }
            return cb(null, file[0]);
        });
    }
};