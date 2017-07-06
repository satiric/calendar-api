/**
 * Created by decadal on 27.06.17.
 */
module.exports = {
    getFullUser: function(id, cb) {
        return User.find({"id":id}).populate('avatar').exec(cb);
    },
    getFullUserByEmail: function(email, cb) {
        return User.find({"email":email}).populate('avatar').exec(cb);
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