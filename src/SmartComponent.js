import SmartComponentManager from './SmartComponentManager';

class SmartComponent {
    constructor(element, parentComponent, params) {
        this.smart_init(element, parentComponent, params);
    }

    smart_init(element, parentComponent, params){
        this.element = element;
        this.bindedElements = {"click":[]};
        this._componentId =  this._generateUid();
        this.parentComponent = parentComponent;
        this.componentReferenceName = null;
        this.params = params || {};



        //Serve per recuperare il componente  tramite un nome di fantasia contenuto nell'attributo component-reference-name
        let componentReferenceName = this.params.componentReferenceName ? this.params.componentReferenceName : this.element.getAttribute("component-reference-name");
        componentReferenceName=componentReferenceName || this._componentId;

        this.componentReferenceName = componentReferenceName;
        if (!element.getAttribute("component-reference-name")) {
            element.setAttribute("component-reference-name", componentReferenceName);
        }

        if(!this.verifyComponentReferenceNameUnicity()){
            throw this.componentReferenceName +" componentReferenceName is already used in "+this.parentComponent.componentReferenceName +" hyerarchy";
            return false;
        }

        SmartComponentManager.registerComponentInstance(this._componentId,this);


        this.element.setAttribute("component-id",this._componentId);

        if(!this.element.getAttribute("component")){
            this.element.setAttribute("component",this.constructor.name);
        }


        if(this.parentComponent && !this.parentComponent.components){
            this.parentComponent.components={};
        }



        if(this.parentComponent){
            this.parentComponent.components[componentReferenceName] = this;
        }


        if(this.element.getAttribute("component-click")){
            this.bindComponentClick(this.element);
        }

        let nodesToBind =this._getComponentClickNodeToBind([this.element]);
        if(nodesToBind.length) {
            for (var i = 0; i < nodesToBind.length; i++) {
                this.checkComponentsHierarchyAndBindClick(nodesToBind[i]);
            }
        }

        //The mutationObserver is used in order to retrieve and handling component-"event"
        this.mutationObserver= new MutationObserver(this._mutationHandler.bind(this));
        this.mutationObserver.observe(this.element.parentNode,{attributes: false, childList: true, characterData: false, subtree: true});

    }

    _mutationHandler(mutationsList){
        this._eventMutationHandler(mutationsList);
    }


    verifyComponentReferenceNameUnicity(){
        return  !this.parentComponent || !this.parentComponent.components  ||  !this.parentComponent.components[this.componentReferenceName];
    }

    _generateUid() {
        return  this.constructor.name+"_"+'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    smart_clickHandler(ev) {
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
        var componentsEls = this.element.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = SmartComponentManager.getComponent(component);
                componentsLoaded.push( new Clazz(componentsEls[i],parentComponent || this));
            }
        }
        return componentsLoaded;
    }

    _bindComponentClick(node) {

        let isAlreadyBinded=this.bindedElements["click"].reduce((accumulator,currentNode)=>{
            return accumulator || currentNode.isEqualNode(node);
        },false);

        if(!isAlreadyBinded){
            this.bindedElements["click"].push(node);
            node.addEventListener('click', (e)=> {
                this.smart_clickHandler(e)
            });
        }
    }

    checkComponentsHierarchyAndBindClick(node){
        let parentsComponent= this._getDomElementParents( node, '[component-reference-name]');
        if(parentsComponent.length>0 && parentsComponent[0].getAttribute("component-reference-name")==this.componentReferenceName){
            this._bindComponentClick(node);
        }else{
            return;
        }
    }

    _getDomElementParents(elem, selector){
        // Element.matches() polyfill
        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function (s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {
                    }
                    return i > -1;
                };

        }
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


    _eventMutationHandler(mutationsList){
        if(mutationsList && mutationsList.length>0){
            let mutationElements= mutationsList.filter((m) => {
                return m.addedNodes.length > 0;
            }).reduce((prev, current) => {
                return prev.concat(this._getComponentClickNodeToBind(current.addedNodes));
            }, []);

            if(mutationElements.length){
                for (var i = 0; i < mutationElements.length; i++) {
                    this.checkComponentsHierarchyAndBindClick(mutationElements[i]);
                }
            }
        }
    }



    _getComponentClickNodeToBind(modesToCheck){
        let nodesToBind=[];
        if(modesToCheck.length){
            for (var i = 0; i < modesToCheck.length; i++) {
                let node=modesToCheck[i];
                if(node.querySelectorAll){
                    let componentClickElements =node.querySelectorAll('[component-click]');
                    if(node.getAttribute('component-click')){
                        nodesToBind.push(node);
                    }
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

    smart_destroy(){
        console.log(this.componentReferenceName + " destroyed");
        this.mutationObserver.disconnect();
        SmartComponentManager.removeComponentInstance(this._componentId);
        if(this.element.isConnected){
            this.element.remove();
        }

        // for all properties
        for (const prop of Object.getOwnPropertyNames(this)) {
            delete this[prop];
        }


    }

}

export default  SmartComponent;