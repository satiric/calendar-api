/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseE = require('../../exceptions/BaseException');
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
            var fileInfo = uploadedFiles[0];
            require('../../utils/Files').uploadFile(fileInfo, function(err, result) {
                if(err) {
                    return (err instanceof BaseE)
                        ? res.badRequest({"message": err.message})
                        : res.serverError({"data":err});
                }
                return res.ok({"data": result});
            });
        });
    },
    destroy: function (req, res) {
    }
};

