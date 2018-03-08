import {AppRegistry}  from "../build/SmartComponentJS";
import TestManager from "./TestManager";
import TestComponent from "./testComponents/TestComponent";
AppRegistry.registerComponents({TestComponent});

let testComponent=null;

describe('TestComponent1 - Instance by name', function() {
    testComponent = AppRegistry.initComponentByName(document.querySelector(`[component-reference-name="TestComponent1"]`),"TestComponent");
    it('TestComponent1 - should be instanced', function() {
        assert.equal(testComponent.constructor.name, "TestComponent");
    });
    it('TestComponent1 - should be retrieved in components object by reference name ', function() {
        assert.equal(testComponent.components["TestComponent1"].componentReferenceName, "TestComponent1");
    });
});


describe('TestComponent1 - load child components passing like parent TestComponent1', function() {
    it('TestComponent2 - TestComponent1 should be present like TestComponent2 parent', function() {
        let loadedComponents = testComponent.loadChildComponents(testComponent);
        let testComponent2=loadedComponents.filter((component)=>{
            return component.componentReferenceName=="TestComponent2";
        })[0];
        assert.equal(testComponent2.parentComponent.componentReferenceName, "TestComponent1");
    });
});

describe('TestComponent2 component-click - click on TestComponent2 child with component-click attribute', function() {
    let clickEventsNumberBefore=TestManager.getClickEvents("TestComponent2");
    document.querySelector(`[component-reference-name="TestComponent2"] [component-click="clickHandler()"]`).click();
        it('TestComponent2 - clickEventsNumber must be increase of one', function(done) {
            return new Promise(function (resolve) {
                setTimeout(()=>{
                    assert.equal(TestManager.getClickEvents("TestComponent2"), (clickEventsNumberBefore+1));
                    resolve();
                },1000)
            }).then(done);
        });
});


