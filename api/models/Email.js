/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    attributes: {
        email: {
            type: "email",
            size: 254,
            required: true,
            unique: true,
            primaryKey: true
        },
        //owner
        user_id: {
            type: "integer",
            unique: true,
            model: "User"
        }
        // subscribers: {
        //     collection: 'EmailContacts',
        //     via: 'email'
        // }
    },

    validationMessages: { //hand for i18n & l10n
        email: {
            required: 'Email is required',
            email: 'Email is not a valid email',
            unique: 'This email is already registered to a vlife account'
        },
        user_id: {
            type: "integer",
            unique: true
        }
    }
};


