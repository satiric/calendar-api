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
        FileManager.uploadFileToS3(req.file('file'), function(err, uploadedFiles) {
                if (err) return res.serverError(err);
                return res.json({
                    message: uploadedFiles.length + ' file(s) uploaded successfully!',
                    files: uploadedFiles
                });
        } );
        // return req.file('file').upload({
        //
        //     dirname: '/uploads/'
        // },);

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

