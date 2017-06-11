/**
 * Created by decadal on 09.06.17.
 */

module.exports.email = {
    service: 'Gmail',
    auth: {
        user: "catomik.test.mail@gmail.com",
        pass: "catomik-test"
    },
    templateDir: "api/emailTemplates",
    from: "info@mycompany.com",
    testMode: false,
    ssl: true
}