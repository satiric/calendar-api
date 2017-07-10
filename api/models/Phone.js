/**
 * Created by decadal on 01.07.17.
 */

module.exports = {
    connection: 'localMysqlServer',
    attributes: {
        id: {
            type: "string",
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
};


