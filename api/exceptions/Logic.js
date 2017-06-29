/**
 * Created by decadal on 28.06.17.
 */
var BaseException = require('./BaseException');
/**
 * 
 * @param message
 * @constructor
 */
function Logic(message) {
    BaseException.call(this, message);
    this.name = "LogicError";
}

Logic.prototype = Object.create(BaseException.prototype);
Logic.prototype.constructor = Logic;
module.exports = Logic;