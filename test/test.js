import {AppRegistry}  from "../build/SmartComponentJS";
import TestManager from "./TestManager";
import TestComponent from "./testComponents/TestComponent";
AppRegistry.registerComponents({TestComponent});

let testComponent=null;
let testComponent2=null;
let testComponent3=null;

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
        testComponent2=loadedComponents.filter((component)=>{
            return component.componentReferenceName=="TestComponent2";
        })[0];
        assert.equal(testComponent2.parentComponent.componentReferenceName, "TestComponent1");
    });
});

describe('TestComponent2 component-click - click on TestComponent2 child with component-click attribute', function() {
    it('TestComponent2 - clickEventsNumber must be increase of one', async function() {
        let clickEventsNumberBefore=TestManager.getClickEvents("TestComponent2");
        document.querySelector(`[component-reference-name="TestComponent2"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager.getClickEvents("TestComponent2"), (clickEventsNumberBefore + 1));
    });
});


describe('TestComponent3 added dinamically - add dinamically TestComponent3 like child of TestComponent2', function() {
    it('TestComponent3 - should be present like child of TestComponent2', async function() {
        let testComponent2DomEl= document.querySelector(`[component-reference-name="TestComponent2"]`);
        var node=document.createElement('div');
        node.innerHTML=`<div component="TestComponent"  component-reference-name="TestComponent3">
            <button component-click="clickHandler()">TestComponent3 Click Handler</button>
        </div>`;
        testComponent2DomEl.appendChild(node.childNodes[0]);
        testComponent2.loadChildComponents();
        await setTimeout(()=>{},500);
        testComponent3=testComponent2.components["TestComponent3"];
        assert.equal(testComponent2.components["TestComponent3"].componentReferenceName, "TestComponent3");
    });
});


describe('TestComponent3 component-click - click on TestComponent child with component-click attribute', function() {
    it('TestComponent3 - clickEventsNumber must be increase of one', async function() {
        let clickEventsNumberBefore=TestManager.getClickEvents("TestComponent3");
        document.querySelector(`[component-reference-name="TestComponent3"] [component-click="clickHandler()"]`).click();
        await setTimeout(()=>{},500);
        assert.equal(TestManager.getClickEvents("TestComponent3"), (clickEventsNumberBefore + 1));
    });
});

//Destroy con detach listener
//Init
//BeforComponetClick
//Lanciare eccezione se vengono trovate componentReferenceName registrate o se il componentReferenceName coincide con quella del padre




