/**
 * Created by decadal on 15.06.17.
 */
'use strict';

/**
 * This is a temp fix while one sails 11.x
 * @see https://github.com/tjwebb/sails-swagger/issues/3
 */
var _ = require('lodash');
var _super = require('sails-swagger/dist/api/controllers/SwaggerController');

_.merge(exports, _super);
_.merge(exports, {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    doc: function doc(req, res) {
        var YAML = require('yamljs');
        var nativeObject = YAML.load('./api/swagger/swagger.yaml');
        res.status(200).jsonx(nativeObject);
    }
});