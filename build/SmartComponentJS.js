class SmartComponentManager {
    constructor() {
        this.components = [];
        this.componentsInstance={};
    }

    configure(params){
        this.params = params || {garbageCollector:false,garbageCollectorRootElement:null};

        if(this.params.garbageCollector){
            this.garbageCollectorRootElement=this.params.garbageCollectorRootElement || document.getElementsByTagName("BODY")[0];
            if(this.params.garbageCollector){
                this.mutationObserver= new MutationObserver(this.mutationHandler.bind(this));
                this.mutationObserver.observe(this.garbageCollectorRootElement.parentNode,{attributes: false, childList: true, characterData: false, subtree: true});
            }
        }
    }

    mutationHandler(mutationsList){
            if(mutationsList && mutationsList.length>0){
                let removedElements= mutationsList.filter((m) => {
                    return m.removedNodes.length > 0;
                }).reduce((prev, current) => {
                    return prev.concat(current.removedNodes);
                }, []);

                if(removedElements.length>0){
                   this.getComponentSubNodes(removedElements,[]).forEach((node)=>{
                       if(node.getAttribute && node.getAttribute("component-id")){
                           let componentInstance=this.getComponentInstanceById(node.getAttribute("component-id"));
                           if(componentInstance){
                               componentInstance.smart_destroy();
                           }
                       }
                   });
                }
            }
        }

    getComponentSubNodes(removedElements,prevNodes){
        prevNodes =prevNodes || [];
        let rmElements=removedElements.length>0 ? removedElements:[removedElements];
        rmElements.forEach((removedNode)=>{
            let currentNode=removedNode;
            if(currentNode.length){
                prevNodes.push(this.getComponentSubNodes([].slice.call(currentNode),prevNodes));
            }else{
                if(currentNode.getAttribute && currentNode.getAttribute("component")){
                    prevNodes.push(currentNode);
                }
                if(currentNode.children && currentNode.children.length>0){
                    prevNodes.push(this.getComponentSubNodes([].slice.call(currentNode.children),prevNodes));
                }
            }

        });
        return prevNodes;
    }

    registerComponents(componentsClasses){
        Object.keys(componentsClasses).forEach((componentClassName)=>{
            if(!this.getComponent(componentClassName)){
                this.registerComponent(componentClassName,componentsClasses[componentClassName]);
            }
        });
    }


    registerComponent(name,clazz) {
        this.components.push({
            name: name,
            clazz: clazz
        });
    }


    registerComponentInstance(id,instance) {
        this.componentsInstance[id]=instance;
    }

    removeComponentInstance(id) {
        delete this.componentsInstance[id];
    }

    getComponentInstanceById(id){
        return this.componentsInstance[id];
    }

    initComponentByName(element,componentName){
        let instance=null;
        try{
            var clazz = this.getComponent(componentName);
            instance=new clazz(element); //Start Up Component
        }catch(e){
            console.error("Error when trying to instance Component " + componentName +": "+ e);
        }
        return instance;
    }

    getComponent(name) {
        var comp = this.components.filter(c => c.name == name).map(c => c.clazz)[0];
        return comp;
    }
}

var SmartComponentManager$1 = new SmartComponentManager();

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

        SmartComponentManager$1.registerComponentInstance(this._componentId,this);


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
            this[functionName].apply(this, eval("extractParams("+functionCode.split("(")[1]));
        }
    }

    loadChildComponents(parentComponent) {
        let componentsLoaded=[];
        var componentsEls = this.element.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = SmartComponentManager$1.getComponent(component);
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
                this.smart_clickHandler(e);
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
        SmartComponentManager$1.removeComponentInstance(this._componentId);
        if(this.element.isConnected){
            this.element.remove();
        }

        // for all properties
        for (const prop of Object.getOwnPropertyNames(this)) {
            delete this[prop];
        }


    }

}

export { SmartComponentManager$1 as SmartComponentManager, SmartComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU21hcnRDb21wb25lbnRKUy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL1NtYXJ0Q29tcG9uZW50TWFuYWdlci5qcyIsIi4uL3NyYy9TbWFydENvbXBvbmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIFNtYXJ0Q29tcG9uZW50TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZT17fTtcbiAgICB9XG5cbiAgICBjb25maWd1cmUocGFyYW1zKXtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge2dhcmJhZ2VDb2xsZWN0b3I6ZmFsc2UsZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50Om51bGx9O1xuXG4gICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQ9dGhpcy5wYXJhbXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50IHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQk9EWVwiKVswXTtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5tdXRhdGlvbkhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgICAgIGlmKG11dGF0aW9uc0xpc3QgJiYgbXV0YXRpb25zTGlzdC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRFbGVtZW50cz0gbXV0YXRpb25zTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdChjdXJyZW50LnJlbW92ZWROb2Rlcyk7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgaWYocmVtb3ZlZEVsZW1lbnRzLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKHJlbW92ZWRFbGVtZW50cyxbXSkuZm9yRWFjaCgobm9kZSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudEluc3RhbmNlPXRoaXMuZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBvbmVudEluc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5zbWFydF9kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50U3ViTm9kZXMocmVtb3ZlZEVsZW1lbnRzLHByZXZOb2Rlcyl7XG4gICAgICAgIHByZXZOb2RlcyA9cHJldk5vZGVzIHx8IFtdO1xuICAgICAgICBsZXQgcm1FbGVtZW50cz1yZW1vdmVkRWxlbWVudHMubGVuZ3RoPjAgPyByZW1vdmVkRWxlbWVudHM6W3JlbW92ZWRFbGVtZW50c107XG4gICAgICAgIHJtRWxlbWVudHMuZm9yRWFjaCgocmVtb3ZlZE5vZGUpPT57XG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGU9cmVtb3ZlZE5vZGU7XG4gICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZSkscHJldk5vZGVzKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUgJiYgY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5jaGlsZHJlbiAmJiBjdXJyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZS5jaGlsZHJlbikscHJldk5vZGVzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBwcmV2Tm9kZXM7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudHNDbGFzc2VzKXtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9uZW50c0NsYXNzZXMpLmZvckVhY2goKGNvbXBvbmVudENsYXNzTmFtZSk9PntcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldENvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudENsYXNzTmFtZSxjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWUsY2xhenopIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGNsYXp6OiBjbGF6elxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2UoaWQsaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdPWluc3RhbmNlO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbXBvbmVudEluc3RhbmNlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF07XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKGlkKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9uZW50QnlOYW1lKGVsZW1lbnQsY29tcG9uZW50TmFtZSl7XG4gICAgICAgIGxldCBpbnN0YW5jZT1udWxsO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgY2xhenogPSB0aGlzLmdldENvbXBvbmVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIGluc3RhbmNlPW5ldyBjbGF6eihlbGVtZW50KTsgLy9TdGFydCBVcCBDb21wb25lbnRcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoZW4gdHJ5aW5nIHRvIGluc3RhbmNlIENvbXBvbmVudCBcIiArIGNvbXBvbmVudE5hbWUgK1wiOiBcIisgZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lKSB7XG4gICAgICAgIHZhciBjb21wID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcihjID0+IGMubmFtZSA9PSBuYW1lKS5tYXAoYyA9PiBjLmNsYXp6KVswXTtcbiAgICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU21hcnRDb21wb25lbnRNYW5hZ2VyKCk7XG4iLCJpbXBvcnQgU21hcnRDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4vU21hcnRDb21wb25lbnRNYW5hZ2VyJztcblxuY2xhc3MgU21hcnRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyl7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSB7XCJjbGlja1wiOltdfTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50SWQgPSAgdGhpcy5fZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpO1xuICAgICAgICBjb21wb25lbnRSZWZlcmVuY2VOYW1lPWNvbXBvbmVudFJlZmVyZW5jZU5hbWUgfHwgdGhpcy5fY29tcG9uZW50SWQ7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gY29tcG9uZW50UmVmZXJlbmNlTmFtZTtcbiAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIiwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGhpcy52ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpKXtcbiAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBpcyBhbHJlYWR5IHVzZWQgaW4gXCIrdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgaHllcmFyY2h5XCI7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCx0aGlzKTtcblxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIix0aGlzLl9jb21wb25lbnRJZCk7XG5cbiAgICAgICAgaWYoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIikpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiLHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtY2xpY2tcIikpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2Rlc1RvQmluZCA9dGhpcy5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgaWYobm9kZXNUb0JpbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZXNUb0JpbmRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgbXV0YXRpb25PYnNlcnZlciBpcyB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCBoYW5kbGluZyBjb21wb25lbnQtXCJldmVudFwiXG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fbXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcblxuICAgIH1cblxuICAgIF9tdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgIHRoaXMuX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpO1xuICAgIH1cblxuXG4gICAgdmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHkoKXtcbiAgICAgICAgcmV0dXJuICAhdGhpcy5wYXJlbnRDb21wb25lbnQgfHwgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMgIHx8ICAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1t0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZVVpZCgpIHtcbiAgICAgICAgcmV0dXJuICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrXCJfXCIrJ3h4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc21hcnRfY2xpY2tIYW5kbGVyKGV2KSB7XG4gICAgICAgIGxldCBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoLi4ucGFyYW1zKSB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbWV0ZXJzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgaWYocGFyYW09PVwidGhpc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXNbZnVuY3Rpb25OYW1lXSl7XG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIrZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVsxXSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudF0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c0Vsc1tpXS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgX2JpbmRDb21wb25lbnRDbGljayhub2RlKSB7XG5cbiAgICAgICAgbGV0IGlzQWxyZWFkeUJpbmRlZD10aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50Tm9kZSk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciB8fCBjdXJyZW50Tm9kZS5pc0VxdWFsTm9kZShub2RlKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgaWYoIWlzQWxyZWFkeUJpbmRlZCl7XG4gICAgICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucHVzaChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zbWFydF9jbGlja0hhbmRsZXIoZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpe1xuICAgICAgICBsZXQgcGFyZW50c0NvbXBvbmVudD0gdGhpcy5fZ2V0RG9tRWxlbWVudFBhcmVudHMoIG5vZGUsICdbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXScpO1xuICAgICAgICBpZihwYXJlbnRzQ29tcG9uZW50Lmxlbmd0aD4wICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpPT10aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICAgICAgdGhpcy5fYmluZENvbXBvbmVudENsaWNrKG5vZGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXREb21FbGVtZW50UGFyZW50cyhlbGVtLCBzZWxlY3Rvcil7XG4gICAgICAgIC8vIFNldHVwIHBhcmVudHMgYXJyYXlcbiAgICAgICAgdmFyIHBhcmVudHMgPSBbXTtcbiAgICAgICAgLy8gR2V0IG1hdGNoaW5nIHBhcmVudCBlbGVtZW50c1xuICAgICAgICBmb3IgKCA7IGVsZW0gJiYgZWxlbSAhPT0gZG9jdW1lbnQ7IGVsZW0gPSBlbGVtLnBhcmVudE5vZGUgKSB7XG4gICAgICAgICAgICAvLyBBZGQgbWF0Y2hpbmcgcGFyZW50cyB0byBhcnJheVxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGVsZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJlbnRzO1xuICAgIH1cblxuXG4gICAgX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3Qpe1xuICAgICAgICBpZihtdXRhdGlvbnNMaXN0ICYmIG11dGF0aW9uc0xpc3QubGVuZ3RoPjApe1xuICAgICAgICAgICAgbGV0IG11dGF0aW9uRWxlbWVudHM9IG11dGF0aW9uc0xpc3QuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0uYWRkZWROb2Rlcy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXYuY29uY2F0KHRoaXMuX2dldENvbXBvbmVudENsaWNrTm9kZVRvQmluZChjdXJyZW50LmFkZGVkTm9kZXMpKTtcbiAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgaWYobXV0YXRpb25FbGVtZW50cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXV0YXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayhtdXRhdGlvbkVsZW1lbnRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgX2dldENvbXBvbmVudENsaWNrTm9kZVRvQmluZChtb2Rlc1RvQ2hlY2spe1xuICAgICAgICBsZXQgbm9kZXNUb0JpbmQ9W107XG4gICAgICAgIGlmKG1vZGVzVG9DaGVjay5sZW5ndGgpe1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2Rlc1RvQ2hlY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZT1tb2Rlc1RvQ2hlY2tbaV07XG4gICAgICAgICAgICAgICAgaWYobm9kZS5xdWVyeVNlbGVjdG9yQWxsKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudENsaWNrRWxlbWVudHMgPW5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudC1jbGlja10nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudC1jbGljaycpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9CaW5kLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudENsaWNrRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0JpbmQucHVzaChjb21wb25lbnRDbGlja0VsZW1lbnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXNUb0JpbmQ7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYnkgQ29tcG9uZW50TWFuYWdlciAgd2hlbiBkb20gY29tcG9uZW50IGlzIHJlbW92ZWQsIG90aGVyd2lzZSB5b3UgY2FuIGFsc28gY2FsbCBpdCBkaXJlY3RseSBpZiB5b3UgbmVlZCBvciBvdmVycmlkZSBpdFxuICAgICAqL1xuXG4gICAgc21hcnRfZGVzdHJveSgpe1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgKyBcIiBkZXN0cm95ZWRcIik7XG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIFNtYXJ0Q29tcG9uZW50TWFuYWdlci5yZW1vdmVDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCk7XG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5pc0Nvbm5lY3RlZCl7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpc1twcm9wXTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgIFNtYXJ0Q29tcG9uZW50OyJdLCJuYW1lcyI6WyJTbWFydENvbXBvbmVudE1hbmFnZXIiXSwibWFwcGluZ3MiOiJBQUNBLE1BQU0scUJBQXFCLENBQUM7SUFDeEIsV0FBVyxHQUFHO1FBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztLQUM5Qjs7SUFFRCxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7O1FBRWxGLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUM1QixJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsSUFBSSxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckgsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUM1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUks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
