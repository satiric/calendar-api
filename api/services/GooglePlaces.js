/**
 * Created by decadal on 19.08.17.
 */


var http = require('https');

var options = {
    host: 'maps.googleapis.com',
    port: '443',
    path: '/maps/api/place/details/json?key=' + sails.config.constants.googlePlacesKey + "&placeid=",
    method: 'GET'
};


module.exports = {
    get: function (placeId, cb) {
        'use strict';
        options.path += placeId;
        var str = "";
        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                str += chunk;
            });
            res.on('end', function(){
                return cb(null, JSON.parse(str));
            });
        }).end();
    }
};
