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
            if (err) {
                return res.serverError({"details":err, "status":"error"});
            }
            if(!uploadedFiles || !uploadedFiles.length) {
                return res.json({
                    "status": "error",
                    "message": "file isn't uploaded"
                });
            }
            var files = [];
            var allowedTypes = ['image/jpeg', 'image/png'];
            for( let i = 0, size = uploadedFiles.length; i < size; i++ ) {
                let fileInfo = uploadedFiles[i];
                //todo make this before upload
                if(allowedTypes.indexOf(fileInfo.type) === -1) {
                    return res.badRequest({"status":"error", "message": "wrong file type."});
                }
                let splittedFile = fileInfo.fd.split(".");
                files.push({
                    "size" : fileInfo.size,
                    "caption" : fileInfo.filename,
                    "name" : splittedFile[0],
                    "ext" : splittedFile[1],
                    "url" : fileInfo.extra.Location
                });
            }
            File.create(files).exec(function (err, created){
                if (err) {
                    return res.serverError({"details":err, "status":"error"});
                }//todo not 0
                return res.ok({"status":"success", "files": created[0]});
            });
            // return res.json({
            //     message: uploadedFiles.length + ' file(s) uploaded successfully!',
            //     files: uploadedFiles
            // });
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

