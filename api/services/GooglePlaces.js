/**
 * Created by decadal on 19.08.17.
 */


var http = require('https');

var options = {
    host: 'maps.googleapis.com',
    port: '443',
    method: 'GET'
};


module.exports = {
    get: function (placeId, cb) {
        options.path = '/maps/api/place/details/json?key=' + sails.config.constants.googlePlacesKey + "&placeid=" + placeId;
        sails.log(options);
        var str = "";
        http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                str += chunk;
            });
            res.on('end', function(){
                sails.log(str);
                return cb(null, JSON.parse(str));
            });
        }).end();
    }
};
