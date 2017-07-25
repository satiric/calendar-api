var LogicE = require('../exceptions/Logic');


function checkMime(filePath, cb) {
    var mmm = require('mmmagic'),
        Magic = mmm.Magic;
    var magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detectFile(filePath, function(err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}



module.exports = {
    uploadFile: function(fileInfo, cb) {
        checkMime(fileInfo.fd, function(err, mimeType){
            var allowedTypes = ['image/jpeg', 'image/png'];
            if(allowedTypes.indexOf(mimeType) === -1) {
                return cb(new LogicE("wrong type file"));
            }
            var fileName = fileInfo.fd.split("/");
            var splittedFile = fileName[fileName.length-1].split(".");
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
                        return cb(err);
                    }
                    return cb(null, created);
                });

            });

        });
    }
};