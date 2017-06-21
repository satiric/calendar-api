/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
	create: function (req, res) {

        return req.file('file').upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000,
            dirname: '/uploads/'
        },function (err, uploadedFiles) {
            if (err) {
                return res.negotiate(err);
            }
            return res.ok({"file":uploadedFiles});
            //
            // // If no files were uploaded, respond with an error.
            // if (uploadedFiles.length === 0){
            //     return res.badRequest('No file was uploaded');
            // }
            //
            //
            // // Save the "fd" and the url where the avatar for a user can be accessed
            // User.update(req.session.me, {
            //
            //     // Generate a unique URL where the avatar can be downloaded.
            //     avatarUrl: require('util').format('%s/user/avatar/%s', sails.config.appUrl, req.session.me),
            //
            //     // Grab the first file and use it's `fd` (file descriptor)
            //     avatarFd: uploadedFiles[0].fd
            // }).exec(function (err){
            //         if (err) return res.negotiate(err);
            //         return res.ok();
            //     });
        });

        // return req.file('file').upload(function (err, uploadedFiles){
        //     if (err) return res.serverError(err);
        //     return res.json({
        //         message: uploadedFiles.length + ' file(s) uploaded successfully!',
        //         files: uploadedFiles
        //     });
        // });
    },
    destroy: function (req, res) {

    }
};

