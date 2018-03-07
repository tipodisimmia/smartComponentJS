import {AppRegistry}  from "../src/index";
var assert = require('assert');
import jsdomify from 'jsdomify';
jsdomify.create(
    '<!DOCTYPE html><html><head></head><body>hello</body></html>'
);
const documentRef = jsdomify.getDocument();
describe('Array', function() {
    console.log(documentRef.getElementsByTagName("body"));
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});
