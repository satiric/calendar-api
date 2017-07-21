/**
 * Created by decadal on 20.07.17.
 */




var assert = require('assert');
var Sails = require('sails');
describe('SailsMochaTest',function() {

    before(function(done) {
        this.timeout(50000);

        Sails.lift({},
            function(err,server) {
                if(err) {
                    done(err);
                } else {
                    done(err,sails);
                }
            });
    });

    it('testmethod',function(done) {
        Sails.models.user.getFullUser(4, function(err, results) {
            console.log(results);
            done(err);
        });
    });

    after(function(done) {
        Sails.lower(done);
    });
});