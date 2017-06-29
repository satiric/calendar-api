/**
 * Created by decadal on 28.06.17.
 */

/**
 * 
 * @param message
 * @constructor
 */
function BaseException(message) {
    this.name = "BaseException";
    this.message = message;

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    } else {
        this.stack = (new Error()).stack;
    }

}
BaseException.prototype = Object.create(Error.prototype);
BaseException.prototype.constructor = BaseException;
module.exports = BaseException;