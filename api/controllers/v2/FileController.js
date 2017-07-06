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
        req.file('file').upload({}, function(err, uploadedFiles) {
            if (err) {
                return res.serverError({"data":err});
            }
            if(!uploadedFiles || !uploadedFiles.length) {
                return res.json({"message": "file isn't uploaded"});
            }
            var allowedTypes = ['image/jpeg', 'image/png'];
            var fileInfo = uploadedFiles[0];
            var fileName = fileInfo.fd.split("/");
            var splittedFile = fileName[fileName.length-1].split(".");
            if(allowedTypes.indexOf(fileInfo.type) === -1) {
                return res.badRequest({"message": "wrong file type."});
            }
            var Upload = require('s3-uploader');
            var client = new Upload('vlife11092017', {
                aws: {
                    acl: 'public-read',
                    accessKeyId: sails.config.constants.s3id,
                    secretAccessKey: sails.config.constants.s3secret
                },
                versions: [{
                    maxHeight: 500,
                    maxWidth: 500,
                    aspect: '1:1',
                    suffix: '-small'
                }, {
                    quality: 80
                }]
            });

            client.upload(fileInfo.fd, {}, function(err, versions, meta) {
                if (err) { console.log(err); }
                var firstUrl = '';
                var secondUrl = '';
                for(var i = 0, size = versions.length; i < size; i++) {
                    if(versions[i].quality === 80) {
                        firstUrl = versions[i].url;
                    }
                    else {
                        secondUrl = versions[i].url;
                    }
                }
                File.create({
                    "size" : fileInfo.size,
                    "caption" : fileInfo.filename,
                    "name" : splittedFile[0],
                    "ext" : splittedFile[1],
                    "url" : firstUrl,
                    "mini_url" : secondUrl
                }).exec(function (err, created){
                    if (err) {
                        return res.serverError({"data":err});
                    }
                    return res.ok({"data": created});
                });

            });
            } );
    },
    destroy: function (req, res) {
    }
};

