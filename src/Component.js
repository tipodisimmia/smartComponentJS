import ComponentManager from './ComponentManager';

class Component {
    constructor(element, parentComponent, params) {
        this.init(element, parentComponent, params);
    }

    init(element, parentComponent, params){
        this.garbageCollectorRootElement = element;
        this.bindedElements = {"click":[]};
        this._componentId =  this.generateUid();
        this.parentComponent = parentComponent;
        this.componentReferenceName = null;
        this.params = params || {};



        //Serve per recuperare il componente  tramite un nome di fantasia contenuto nell'attributo component-reference-name
        let componentReferenceName = this.params.componentReferenceName ? this.params.componentReferenceName : this.garbageCollectorRootElement.getAttribute("component-reference-name");
        componentReferenceName=componentReferenceName || this._componentId;

        this.componentReferenceName = componentReferenceName;
        if (!element.getAttribute("component-reference-name")) {
            element.setAttribute("component-reference-name", componentReferenceName);
        }

        if(!this.verifyComponentReferenceNameUnicity()){
            throw this.componentReferenceName +" componentReferenceName is already used in "+this.parentComponent.componentReferenceName +" hyerarchy";
            return false;
        }

        ComponentManager.registerComponentInstance(this._componentId,this);


        this.garbageCollectorRootElement.setAttribute("component-id",this._componentId);

        if(!this.garbageCollectorRootElement.getAttribute("component")){
            this.garbageCollectorRootElement.setAttribute("component",this.constructor.name);
        }


        if(this.parentComponent && !this.parentComponent.components){
            this.parentComponent.components={};
        }



        if(this.parentComponent){
            this.parentComponent.components[componentReferenceName] = this;
        }


        if(this.garbageCollectorRootElement.getAttribute("component-click")){
            this.bindComponentClick(this.garbageCollectorRootElement);
        }

        let nodesToBind =this.getComponentClickNodeToBind([this.garbageCollectorRootElement]);
        if(nodesToBind.length) {
            for (var i = 0; i < nodesToBind.length; i++) {
                this.checkComponentsHierarchyAndBindClick(nodesToBind[i]);
            }
        }

        //The mutationObserver is used in order to retrieve and handling component-"event"
        this.mutationObserver= new MutationObserver(this.mutationHandler.bind(this));
        this.mutationObserver.observe(this.garbageCollectorRootElement.parentNode,{attributes: false, childList: true, characterData: false, subtree: true});

    }

    mutationHandler(mutationsList){
        this.eventMutationHandler(mutationsList);
       this.destroyMutationHandler(mutationsList);
    }



    verifyComponentReferenceNameUnicity(){
        return  !this.parentComponent || !this.parentComponent.components  ||  !this.parentComponent.components[this.componentReferenceName];
    }

    generateUid() {
        return  this.constructor.name+"_"+'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    clickHandler(ev) {
        let functionCode = ev.currentTarget.getAttribute('component-click');
        let functionName = functionCode.split("(")[0];

        function extractParams(...params) {

            let parameters=[].slice.call(arguments);
            return parameters.map((param)=>{
                if(param=="this"){
                    return ev;
                }else{
                    return param;
                }
            })
        }

        if(this[functionName]){
            this[functionName].apply(this, eval("extractParams("+functionCode.split("(")[1]))
        }
    }

    loadChildComponents(parentComponent) {
        let componentsLoaded=[];
        var componentsEls = this.garbageCollectorRootElement.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = ComponentManager.getComponent(component);
                componentsLoaded.push( new Clazz(componentsEls[i],parentComponent || this));
            }
        }
        return componentsLoaded;
    }

    bindComponentClick(node) {

        let isAlreadyBinded=this.bindedElements["click"].reduce((accumulator,currentNode)=>{
            return accumulator || currentNode.isEqualNode(node);
        },false);

        if(!isAlreadyBinded){
            this.bindedElements["click"].push(node);
            node.addEventListener('click', (e)=> {
                this.clickHandler(e)
            });
        }
    }

    checkComponentsHierarchyAndBindClick(node){
        let parentsComponent= this.getDomElementParents( node, '[component-reference-name]');
        if(parentsComponent.length>0 && parentsComponent[0].getAttribute("component-reference-name")==this.componentReferenceName){
            this.bindComponentClick(node);
        }else{
            return;
        }
    }

    getDomElementParents(elem, selector){
        // Setup parents array
        var parents = [];
        // Get matching parent elements
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            // Add matching parents to array
            if (selector) {
                if (elem.matches(selector)) {
                    parents.push(elem);
                }
            } else {
                parents.push(elem);
            }
        }
        return parents;
    }


    eventMutationHandler(mutationsList){
        if(mutationsList && mutationsList.length>0){
            let mutationElements= mutationsList.filter((m) => {
                return m.addedNodes.length > 0;
            }).reduce((prev, current) => {
                return prev.concat(this.getComponentClickNodeToBind(current.addedNodes));
            }, []);

            if(mutationElements.length){
                for (var i = 0; i < mutationElements.length; i++) {
                    this.checkComponentsHierarchyAndBindClick(mutationElements[i]);
                }
            }
        }
    }

    destroyMutationHandler(mutationsList){
      //console.log(this.componentReferenceName +" -" +mutationsList);
    }


    getComponentClickNodeToBind(modesToCheck){
        let nodesToBind=[];
        if(modesToCheck.length){
            for (var i = 0; i < modesToCheck.length; i++) {
                let node=modesToCheck[i];
                if(node.querySelectorAll){
                    let componentClickElements =node.querySelectorAll('[component-click]');
                    if (componentClickElements.length > 0) {
                        for (let i = 0; i < componentClickElements.length; i++) {
                            nodesToBind.push(componentClickElements[i]);
                        }
                    }
                }
            }
        }
        return nodesToBind;
    }


    /**
     * Called by ComponentManager  when dom component is removed, otherwise you can also call it directly if you need or override it
     */

    destroy(){
        console.log(this.componentReferenceName + " destroyed");
        this.mutationObserver.disconnect();
        ComponentManager.removeComponentInstance(this._componentId);
        if(this.garbageCollectorRootElement.isConnected){
            this.garbageCollectorRootElement.remove();
        }

        // for all properties
        for (const prop of Object.getOwnPropertyNames(this)) {
            delete this[prop];
        }


    }

}

export default  Component;