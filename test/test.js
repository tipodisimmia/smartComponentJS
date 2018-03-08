import {AppRegistry}  from "../build/SmartComponentJS";
import TestComponent from "./testComponents/TestComponent";
AppRegistry.registerComponents({TestComponent});


describe('TestComponent1 - Instance by name', function() {

    let testComponent = AppRegistry.initComponentByName(document.querySelector(`[component-reference-name="TestComponent1"]`),"TestComponent");
    it('TestComponent1 - should be instanced', function() {
        assert.equal(testComponent.constructor.name, "TestComponent");
    });
    it('TestComponent1 - should be retrieved in components object by reference name ', function() {
        assert.equal(testComponent.components["TestComponent1"].componentReferenceName, "TestComponent1");
    });


});


