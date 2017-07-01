/**
 * Created by decadal on 01.07.17.
 */
module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        phone: {
            required: true,
            type: 'string',
            unique: true,
            regex: /\+([0-9]){9,13}/
        },
        subscribers: {
            collection: 'User',
            via: 'phoneContacts'
        }
    },

    validationMessages: { //hand for i18n & l10n
        phone: {
            required: "Phone is required",
            regex: "Phone must be valid phone like +12341231451"
        },

    },
};

