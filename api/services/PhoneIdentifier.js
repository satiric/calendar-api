/**
 * Created by decadal on 04.07.17.
 */

module.exports = {
    extract: function (phone, len) {
        len = len || 10;
        num = phone.replace(/\D+/g, "");
        if(num.length < len) {
            return null;
        }
        return num.substr(-len, len);
    }
};
