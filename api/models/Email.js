/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        email: {
            type: "email",
            required: true,
            unique: true,
            primaryKey: true
        },
        subscribers: {
            collection: 'User',
            via: 'emailContacts'
        }
    },

    validationMessages: { //hand for i18n & l10n
        email: {
            required: 'Email is required',
            email: 'Email is not a valid email',
            unique: 'This email is already registered to a vlife account'
        }
    }
};


