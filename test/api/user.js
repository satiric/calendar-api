

/**
 * Created by decadal on 21.07.17.
 */
process.env.NODE_ENV = 'test';

var assert = require('assert');
var Sails = require('sails');

//Подключаем dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
//var server = require('../../app');
var should = chai.should();
chai.use(chaiHttp);

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


  //  it('testmethod',function(done) {


            it('it should GET info about phone number', function(done) {
                chai.request('http://localhost:1337')
                    .get('/api/v1/user/checkPhone?phone=%2B380972221135&noVerify=1')
                    .set('vlife-access-key', '059zZmWOYJU0bLf7RrjnLMPbfCYf3uve5KYGs8o3jWxYE1bBQoz5ZKKVafsn')
                    .end( function(err, res) {
                        sails.log('---------BODY---------');
                        sails.log(res.body);
                        res.should.have.status(200);
                        //                   res.body.should.be.a('array');
//                    res.body.length.should.be.eql(0);
                        done();
                    });
            });



        // Sails.models.user.login("nocturneumbra@gmail.com", "jytjaptv2222", function(err, results) {
        //     console.log(results);
        //     done(err);
        // });
 //   });

    after(function(done) {
        Sails.lower(done);
    });
});