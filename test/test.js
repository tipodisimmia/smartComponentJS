import {AppRegistry}  from "../src/index";
var assert = require('assert');
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            console.log(AppRegistry);
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});