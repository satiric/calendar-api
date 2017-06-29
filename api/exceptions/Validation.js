/**
 * Created by decadal on 28.06.17.
 */
var BaseException = require('./BaseException');
/**
 * 
 * @param err
 * @constructor
 */
function Validation(err) {

    BaseException.call(this, _.values(err.Errors)[0][0].message);
    
    this.name = "ValidationError";
   // this.property = property;
}

Validation.prototype = Object.create(BaseException.prototype);
Validation.prototype.constructor = Validation;
module.exports = Validation;