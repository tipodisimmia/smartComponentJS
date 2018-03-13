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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU21hcnRDb21wb25lbnRKUy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL1NtYXJ0Q29tcG9uZW50TWFuYWdlci5qcyIsIi4uL3NyYy9TbWFydENvbXBvbmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIFNtYXJ0Q29tcG9uZW50TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZT17fTtcbiAgICB9XG5cbiAgICBjb25maWd1cmUocGFyYW1zKXtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge2dhcmJhZ2VDb2xsZWN0b3I6ZmFsc2UsZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50Om51bGx9O1xuXG4gICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQ9dGhpcy5wYXJhbXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50IHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQk9EWVwiKVswXTtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5tdXRhdGlvbkhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgICAgIGlmKG11dGF0aW9uc0xpc3QgJiYgbXV0YXRpb25zTGlzdC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRFbGVtZW50cz0gbXV0YXRpb25zTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdChjdXJyZW50LnJlbW92ZWROb2Rlcyk7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgaWYocmVtb3ZlZEVsZW1lbnRzLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKHJlbW92ZWRFbGVtZW50cyxbXSkuZm9yRWFjaCgobm9kZSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudEluc3RhbmNlPXRoaXMuZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBvbmVudEluc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5zbWFydF9kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50U3ViTm9kZXMocmVtb3ZlZEVsZW1lbnRzLHByZXZOb2Rlcyl7XG4gICAgICAgIHByZXZOb2RlcyA9cHJldk5vZGVzIHx8IFtdO1xuICAgICAgICBsZXQgcm1FbGVtZW50cz1yZW1vdmVkRWxlbWVudHMubGVuZ3RoPjAgPyByZW1vdmVkRWxlbWVudHM6W3JlbW92ZWRFbGVtZW50c107XG4gICAgICAgIHJtRWxlbWVudHMuZm9yRWFjaCgocmVtb3ZlZE5vZGUpPT57XG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGU9cmVtb3ZlZE5vZGU7XG4gICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZSkscHJldk5vZGVzKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUgJiYgY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5jaGlsZHJlbiAmJiBjdXJyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZS5jaGlsZHJlbikscHJldk5vZGVzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBwcmV2Tm9kZXM7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudHNDbGFzc2VzKXtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9uZW50c0NsYXNzZXMpLmZvckVhY2goKGNvbXBvbmVudENsYXNzTmFtZSk9PntcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldENvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudENsYXNzTmFtZSxjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWUsY2xhenopIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGNsYXp6OiBjbGF6elxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2UoaWQsaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdPWluc3RhbmNlO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbXBvbmVudEluc3RhbmNlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF07XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKGlkKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9uZW50QnlOYW1lKGVsZW1lbnQsY29tcG9uZW50TmFtZSl7XG4gICAgICAgIGxldCBpbnN0YW5jZT1udWxsO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgY2xhenogPSB0aGlzLmdldENvbXBvbmVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIGluc3RhbmNlPW5ldyBjbGF6eihlbGVtZW50KTsgLy9TdGFydCBVcCBDb21wb25lbnRcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoZW4gdHJ5aW5nIHRvIGluc3RhbmNlIENvbXBvbmVudCBcIiArIGNvbXBvbmVudE5hbWUgK1wiOiBcIisgZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lKSB7XG4gICAgICAgIHZhciBjb21wID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcihjID0+IGMubmFtZSA9PSBuYW1lKS5tYXAoYyA9PiBjLmNsYXp6KVswXTtcbiAgICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU21hcnRDb21wb25lbnRNYW5hZ2VyKCk7XG4iLCJpbXBvcnQgU21hcnRDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4vU21hcnRDb21wb25lbnRNYW5hZ2VyJztcblxuY2xhc3MgU21hcnRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyl7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSB7XCJjbGlja1wiOltdfTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50SWQgPSAgdGhpcy5fZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpO1xuICAgICAgICBjb21wb25lbnRSZWZlcmVuY2VOYW1lPWNvbXBvbmVudFJlZmVyZW5jZU5hbWUgfHwgdGhpcy5fY29tcG9uZW50SWQ7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gY29tcG9uZW50UmVmZXJlbmNlTmFtZTtcbiAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIiwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGhpcy52ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpKXtcbiAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBpcyBhbHJlYWR5IHVzZWQgaW4gXCIrdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgaHllcmFyY2h5XCI7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCx0aGlzKTtcblxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIix0aGlzLl9jb21wb25lbnRJZCk7XG5cbiAgICAgICAgaWYoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIikpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiLHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtY2xpY2tcIikpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2Rlc1RvQmluZCA9dGhpcy5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgaWYobm9kZXNUb0JpbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZXNUb0JpbmRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgbXV0YXRpb25PYnNlcnZlciBpcyB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCBoYW5kbGluZyBjb21wb25lbnQtXCJldmVudFwiXG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fbXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcblxuICAgIH1cblxuICAgIF9tdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgIHRoaXMuX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpO1xuICAgIH1cblxuXG4gICAgdmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHkoKXtcbiAgICAgICAgcmV0dXJuICAhdGhpcy5wYXJlbnRDb21wb25lbnQgfHwgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMgIHx8ICAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1t0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZVVpZCgpIHtcbiAgICAgICAgcmV0dXJuICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrXCJfXCIrJ3h4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc21hcnRfY2xpY2tIYW5kbGVyKGV2KSB7XG4gICAgICAgIGxldCBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoLi4ucGFyYW1zKSB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbWV0ZXJzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgaWYocGFyYW09PVwidGhpc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXNbZnVuY3Rpb25OYW1lXSl7XG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIrZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVsxXSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudF0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c0Vsc1tpXS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgX2JpbmRDb21wb25lbnRDbGljayhub2RlKSB7XG5cbiAgICAgICAgbGV0IGlzQWxyZWFkeUJpbmRlZD10aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50Tm9kZSk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciB8fCBjdXJyZW50Tm9kZS5pc0VxdWFsTm9kZShub2RlKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgaWYoIWlzQWxyZWFkeUJpbmRlZCl7XG4gICAgICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucHVzaChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zbWFydF9jbGlja0hhbmRsZXIoZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpe1xuICAgICAgICBsZXQgcGFyZW50c0NvbXBvbmVudD0gdGhpcy5fZ2V0RG9tRWxlbWVudFBhcmVudHMoIG5vZGUsICdbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXScpO1xuICAgICAgICBpZihwYXJlbnRzQ29tcG9uZW50Lmxlbmd0aD4wICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpPT10aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICAgICAgdGhpcy5fYmluZENvbXBvbmVudENsaWNrKG5vZGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXREb21FbGVtZW50UGFyZW50cyhlbGVtLCBzZWxlY3Rvcil7XG4gICAgICAgIC8vIEVsZW1lbnQubWF0Y2hlcygpIHBvbHlmaWxsXG4gICAgICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaSA+IC0xO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgICAgICAvLyBTZXR1cCBwYXJlbnRzIGFycmF5XG4gICAgICAgIHZhciBwYXJlbnRzID0gW107XG4gICAgICAgIC8vIEdldCBtYXRjaGluZyBwYXJlbnQgZWxlbWVudHNcbiAgICAgICAgZm9yICggOyBlbGVtICYmIGVsZW0gIT09IGRvY3VtZW50OyBlbGVtID0gZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gQWRkIG1hdGNoaW5nIHBhcmVudHMgdG8gYXJyYXlcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyZW50cztcbiAgICB9XG5cblxuICAgIF9ldmVudE11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgaWYobXV0YXRpb25zTGlzdCAmJiBtdXRhdGlvbnNMaXN0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbkVsZW1lbnRzPSBtdXRhdGlvbnNMaXN0LmZpbHRlcigobSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0pLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdCh0aGlzLl9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQoY3VycmVudC5hZGRlZE5vZGVzKSk7XG4gICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIGlmKG11dGF0aW9uRWxlbWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobXV0YXRpb25FbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cblxuICAgIF9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQobW9kZXNUb0NoZWNrKXtcbiAgICAgICAgbGV0IG5vZGVzVG9CaW5kPVtdO1xuICAgICAgICBpZihtb2Rlc1RvQ2hlY2subGVuZ3RoKXtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZXNUb0NoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGU9bW9kZXNUb0NoZWNrW2ldO1xuICAgICAgICAgICAgICAgIGlmKG5vZGUucXVlcnlTZWxlY3RvckFsbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRDbGlja0VsZW1lbnRzID1ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnQtY2xpY2tdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtY2xpY2snKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvQmluZC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9CaW5kLnB1c2goY29tcG9uZW50Q2xpY2tFbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGVzVG9CaW5kO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJ5IENvbXBvbmVudE1hbmFnZXIgIHdoZW4gZG9tIGNvbXBvbmVudCBpcyByZW1vdmVkLCBvdGhlcndpc2UgeW91IGNhbiBhbHNvIGNhbGwgaXQgZGlyZWN0bHkgaWYgeW91IG5lZWQgb3Igb3ZlcnJpZGUgaXRcbiAgICAgKi9cblxuICAgIHNtYXJ0X2Rlc3Ryb3koKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICsgXCIgZGVzdHJveWVkXCIpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVtb3ZlQ29tcG9uZW50SW5zdGFuY2UodGhpcy5fY29tcG9uZW50SWQpO1xuICAgICAgICBpZih0aGlzLmVsZW1lbnQuaXNDb25uZWN0ZWQpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcF07XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0ICBTbWFydENvbXBvbmVudDsiXSwibmFtZXMiOlsiU21hcnRDb21wb25lbnRNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLHFCQUFxQixDQUFDO0lBQ3hCLFdBQVcsR0FBRztRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7S0FDOUI7O0lBRUQsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDOztRQUVsRixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFDNUIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLElBQUksUUFBUSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JILEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDeEo7U0FDSjtLQUNKOztJQUVELGVBQWUsQ0FBQyxhQUFhLENBQUM7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
