/**
 * Created by decadal on 22.06.17.
 */


module.exports = {
    "uploadFileToS3": function (file, cb) {
        'use strict';
        let s3secret = sails.config.constants.s3secret;
        let s3id = sails.config.constants.s3id;
        return file.upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000,
            adapter: require('skipper-s3'),
            key: s3id,
            secret: s3secret,
            bucket: 'vlife11092017',
            headers: {
                'x-amz-acl': 'public-read'
            }
        }, cb);
    }
};