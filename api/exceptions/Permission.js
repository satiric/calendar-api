/**
 * Created by decadal on 28.06.17.
 */
var BaseException = require('./BaseException');
/**
 * 
 * @param message
 * @constructor
 */
function Permission(message) {
    BaseException.call(this, message);
    this.name = "PermissionError";
}

Permission.prototype = Object.create(BaseException.prototype);
Permission.prototype.constructor = Permission;
module.exports = Permission;