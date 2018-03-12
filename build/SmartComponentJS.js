class ComponentManager {
    constructor() {
        this.components = [];
        this.componentsInstance={};
    }

    configure(params){
        this.params = params || {garbageCollector:true,garbageCollectorRootElement:null};
        this.garbageCollectorRootElement=this.params.garbageCollectorRootElement || document.getElementsByTagName("BODY")[0];
        if(this.params.garbageCollector){
            this.mutationObserver= new MutationObserver(this.mutationHandler.bind(this));
            this.mutationObserver.observe(this.garbageCollectorRootElement.parentNode,{attributes: false, childList: true, characterData: false, subtree: true});
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
                               componentInstance.destroy();
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

var ComponentManager$1 = new ComponentManager();

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

        ComponentManager$1.registerComponentInstance(this._componentId,this);


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
            this[functionName].apply(this, eval("extractParams("+functionCode.split("(")[1]));
        }
    }

    loadChildComponents(parentComponent) {
        let componentsLoaded=[];
        var componentsEls = this.garbageCollectorRootElement.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = ComponentManager$1.getComponent(component);
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
                this.clickHandler(e);
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
        ComponentManager$1.removeComponentInstance(this._componentId);
        if(this.garbageCollectorRootElement.isConnected){
            this.garbageCollectorRootElement.remove();
        }

        // for all properties
        for (const prop of Object.getOwnPropertyNames(this)) {
            delete this[prop];
        }


    }

}

export { ComponentManager$1 as ComponentManager, Component };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU21hcnRDb21wb25lbnRKUy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbXBvbmVudE1hbmFnZXIuanMiLCIuLi9zcmMvQ29tcG9uZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQ29tcG9uZW50TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZT17fTtcbiAgICB9XG5cbiAgICBjb25maWd1cmUocGFyYW1zKXtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge2dhcmJhZ2VDb2xsZWN0b3I6dHJ1ZSxnYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQ6bnVsbH07XG4gICAgICAgIHRoaXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50PXRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIkJPRFlcIilbMF07XG4gICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLm11dGF0aW9uSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKHRoaXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50LnBhcmVudE5vZGUse2F0dHJpYnV0ZXM6IGZhbHNlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgICAgICBpZihtdXRhdGlvbnNMaXN0ICYmIG11dGF0aW9uc0xpc3QubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgIGxldCByZW1vdmVkRWxlbWVudHM9IG11dGF0aW9uc0xpc3QuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLnJlbW92ZWROb2Rlcy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgICAgIH0pLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldi5jb25jYXQoY3VycmVudC5yZW1vdmVkTm9kZXMpO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgIGlmKHJlbW92ZWRFbGVtZW50cy5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRTdWJOb2RlcyhyZW1vdmVkRWxlbWVudHMsW10pLmZvckVhY2goKG5vZGUpPT57XG4gICAgICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZ2V0QXR0cmlidXRlICYmIG5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRJbnN0YW5jZT10aGlzLmdldENvbXBvbmVudEluc3RhbmNlQnlJZChub2RlLmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1pZFwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjb21wb25lbnRJbnN0YW5jZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIGdldENvbXBvbmVudFN1Yk5vZGVzKHJlbW92ZWRFbGVtZW50cyxwcmV2Tm9kZXMpe1xuICAgICAgICBwcmV2Tm9kZXMgPXByZXZOb2RlcyB8fCBbXTtcbiAgICAgICAgbGV0IHJtRWxlbWVudHM9cmVtb3ZlZEVsZW1lbnRzLmxlbmd0aD4wID8gcmVtb3ZlZEVsZW1lbnRzOltyZW1vdmVkRWxlbWVudHNdO1xuICAgICAgICBybUVsZW1lbnRzLmZvckVhY2goKHJlbW92ZWROb2RlKT0+e1xuICAgICAgICAgICAgbGV0IGN1cnJlbnROb2RlPXJlbW92ZWROb2RlO1xuICAgICAgICAgICAgaWYoY3VycmVudE5vZGUubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBwcmV2Tm9kZXMucHVzaCh0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKFtdLnNsaWNlLmNhbGwoY3VycmVudE5vZGUpLHByZXZOb2RlcykpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYoY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlICYmIGN1cnJlbnROb2RlLmdldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiKSl7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKGN1cnJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoY3VycmVudE5vZGUuY2hpbGRyZW4gJiYgY3VycmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICBwcmV2Tm9kZXMucHVzaCh0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKFtdLnNsaWNlLmNhbGwoY3VycmVudE5vZGUuY2hpbGRyZW4pLHByZXZOb2RlcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcHJldk5vZGVzO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50cyhjb21wb25lbnRzQ2xhc3Nlcyl7XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudHNDbGFzc2VzKS5mb3JFYWNoKChjb21wb25lbnRDbGFzc05hbWUpPT57XG4gICAgICAgICAgICBpZighdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50Q2xhc3NOYW1lKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUsY29tcG9uZW50c0NsYXNzZXNbY29tcG9uZW50Q2xhc3NOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICByZWdpc3RlckNvbXBvbmVudChuYW1lLGNsYXp6KSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBjbGF6ejogY2xhenpcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICByZWdpc3RlckNvbXBvbmVudEluc3RhbmNlKGlkLGluc3RhbmNlKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXT1pbnN0YW5jZTtcbiAgICB9XG5cbiAgICByZW1vdmVDb21wb25lbnRJbnN0YW5jZShpZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudEluc3RhbmNlQnlJZChpZCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF07XG4gICAgfVxuXG4gICAgaW5pdENvbXBvbmVudEJ5TmFtZShlbGVtZW50LGNvbXBvbmVudE5hbWUpe1xuICAgICAgICBsZXQgaW5zdGFuY2U9bnVsbDtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdmFyIGNsYXp6ID0gdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50TmFtZSk7XG4gICAgICAgICAgICBpbnN0YW5jZT1uZXcgY2xhenooZWxlbWVudCk7IC8vU3RhcnQgVXAgQ29tcG9uZW50XG4gICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3aGVuIHRyeWluZyB0byBpbnN0YW5jZSBDb21wb25lbnQgXCIgKyBjb21wb25lbnROYW1lICtcIjogXCIrIGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRDb21wb25lbnQobmFtZSkge1xuICAgICAgICB2YXIgY29tcCA9IHRoaXMuY29tcG9uZW50cy5maWx0ZXIoYyA9PiBjLm5hbWUgPT0gbmFtZSkubWFwKGMgPT4gYy5jbGF6eilbMF07XG4gICAgICAgIHJldHVybiBjb21wO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IENvbXBvbmVudE1hbmFnZXIoKTtcbiIsImltcG9ydCBDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4vQ29tcG9uZW50TWFuYWdlcic7XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgcGFyZW50Q29tcG9uZW50LCBwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5pbml0KGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKXtcbiAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzID0ge1wiY2xpY2tcIjpbXX07XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudElkID0gIHRoaXMuZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIik7XG4gICAgICAgIGNvbXBvbmVudFJlZmVyZW5jZU5hbWU9Y29tcG9uZW50UmVmZXJlbmNlTmFtZSB8fCB0aGlzLl9jb21wb25lbnRJZDtcblxuICAgICAgICB0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPSBjb21wb25lbnRSZWZlcmVuY2VOYW1lO1xuICAgICAgICBpZiAoIWVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiLCBjb21wb25lbnRSZWZlcmVuY2VOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCF0aGlzLnZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5KCkpe1xuICAgICAgICAgICAgdGhyb3cgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICtcIiBjb21wb25lbnRSZWZlcmVuY2VOYW1lIGlzIGFscmVhZHkgdXNlZCBpbiBcIit0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRSZWZlcmVuY2VOYW1lICtcIiBoeWVyYXJjaHlcIjtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIENvbXBvbmVudE1hbmFnZXIucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCx0aGlzKTtcblxuXG4gICAgICAgIHRoaXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudC1pZFwiLHRoaXMuX2NvbXBvbmVudElkKTtcblxuICAgICAgICBpZighdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgIHRoaXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiLHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1jbGlja1wiKSl7XG4gICAgICAgICAgICB0aGlzLmJpbmRDb21wb25lbnRDbGljayh0aGlzLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbm9kZXNUb0JpbmQgPXRoaXMuZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudF0pO1xuICAgICAgICBpZihub2Rlc1RvQmluZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXNUb0JpbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayhub2Rlc1RvQmluZFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL1RoZSBtdXRhdGlvbk9ic2VydmVyIGlzIHVzZWQgaW4gb3JkZXIgdG8gcmV0cmlldmUgYW5kIGhhbmRsaW5nIGNvbXBvbmVudC1cImV2ZW50XCJcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLm11dGF0aW9uSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcblxuICAgIH1cblxuICAgIG11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgdGhpcy5ldmVudE11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KTtcbiAgICAgICB0aGlzLmRlc3Ryb3lNdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCk7XG4gICAgfVxuXG5cblxuICAgIHZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5KCl7XG4gICAgICAgIHJldHVybiAgIXRoaXMucGFyZW50Q29tcG9uZW50IHx8ICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzICB8fCAgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHNbdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lXTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZVVpZCgpIHtcbiAgICAgICAgcmV0dXJuICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrXCJfXCIrJ3h4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xpY2tIYW5kbGVyKGV2KSB7XG4gICAgICAgIGxldCBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoLi4ucGFyYW1zKSB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbWV0ZXJzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgaWYocGFyYW09PVwidGhpc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXNbZnVuY3Rpb25OYW1lXSl7XG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIrZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVsxXSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbY29tcG9uZW50XScpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHNFbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRJZCA9IGNvbXBvbmVudHNFbHNbaV0uZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtaWQnKTtcblxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRJZCkge1xuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgdmFyIENsYXp6ID0gQ29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgYmluZENvbXBvbmVudENsaWNrKG5vZGUpIHtcblxuICAgICAgICBsZXQgaXNBbHJlYWR5QmluZGVkPXRoaXMuYmluZGVkRWxlbWVudHNbXCJjbGlja1wiXS5yZWR1Y2UoKGFjY3VtdWxhdG9yLGN1cnJlbnROb2RlKT0+e1xuICAgICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yIHx8IGN1cnJlbnROb2RlLmlzRXF1YWxOb2RlKG5vZGUpO1xuICAgICAgICB9LGZhbHNlKTtcblxuICAgICAgICBpZighaXNBbHJlYWR5QmluZGVkKXtcbiAgICAgICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHNbXCJjbGlja1wiXS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlcihlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZSl7XG4gICAgICAgIGxldCBwYXJlbnRzQ29tcG9uZW50PSB0aGlzLmdldERvbUVsZW1lbnRQYXJlbnRzKCBub2RlLCAnW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZV0nKTtcbiAgICAgICAgaWYocGFyZW50c0NvbXBvbmVudC5sZW5ndGg+MCAmJiBwYXJlbnRzQ29tcG9uZW50WzBdLmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKT09dGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lKXtcbiAgICAgICAgICAgIHRoaXMuYmluZENvbXBvbmVudENsaWNrKG5vZGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldERvbUVsZW1lbnRQYXJlbnRzKGVsZW0sIHNlbGVjdG9yKXtcbiAgICAgICAgLy8gU2V0dXAgcGFyZW50cyBhcnJheVxuICAgICAgICB2YXIgcGFyZW50cyA9IFtdO1xuICAgICAgICAvLyBHZXQgbWF0Y2hpbmcgcGFyZW50IGVsZW1lbnRzXG4gICAgICAgIGZvciAoIDsgZWxlbSAmJiBlbGVtICE9PSBkb2N1bWVudDsgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZSApIHtcbiAgICAgICAgICAgIC8vIEFkZCBtYXRjaGluZyBwYXJlbnRzIHRvIGFycmF5XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbS5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRzLnB1c2goZWxlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRzLnB1c2goZWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcmVudHM7XG4gICAgfVxuXG5cbiAgICBldmVudE11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgaWYobXV0YXRpb25zTGlzdCAmJiBtdXRhdGlvbnNMaXN0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbkVsZW1lbnRzPSBtdXRhdGlvbnNMaXN0LmZpbHRlcigobSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0pLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdCh0aGlzLmdldENvbXBvbmVudENsaWNrTm9kZVRvQmluZChjdXJyZW50LmFkZGVkTm9kZXMpKTtcbiAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgaWYobXV0YXRpb25FbGVtZW50cy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXV0YXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayhtdXRhdGlvbkVsZW1lbnRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3Qpe1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgK1wiIC1cIiArbXV0YXRpb25zTGlzdCk7XG4gICAgfVxuXG5cbiAgICBnZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQobW9kZXNUb0NoZWNrKXtcbiAgICAgICAgbGV0IG5vZGVzVG9CaW5kPVtdO1xuICAgICAgICBpZihtb2Rlc1RvQ2hlY2subGVuZ3RoKXtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZXNUb0NoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGU9bW9kZXNUb0NoZWNrW2ldO1xuICAgICAgICAgICAgICAgIGlmKG5vZGUucXVlcnlTZWxlY3RvckFsbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRDbGlja0VsZW1lbnRzID1ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnQtY2xpY2tdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9CaW5kLnB1c2goY29tcG9uZW50Q2xpY2tFbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGVzVG9CaW5kO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJ5IENvbXBvbmVudE1hbmFnZXIgIHdoZW4gZG9tIGNvbXBvbmVudCBpcyByZW1vdmVkLCBvdGhlcndpc2UgeW91IGNhbiBhbHNvIGNhbGwgaXQgZGlyZWN0bHkgaWYgeW91IG5lZWQgb3Igb3ZlcnJpZGUgaXRcbiAgICAgKi9cblxuICAgIGRlc3Ryb3koKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICsgXCIgZGVzdHJveWVkXCIpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBDb21wb25lbnRNYW5hZ2VyLnJlbW92ZUNvbXBvbmVudEluc3RhbmNlKHRoaXMuX2NvbXBvbmVudElkKTtcbiAgICAgICAgaWYodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQuaXNDb25uZWN0ZWQpe1xuICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpc1twcm9wXTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgIENvbXBvbmVudDsiXSwibmFtZXMiOlsiQ29tcG9uZW50TWFuYWdlciJdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxnQkFBZ0IsQ0FBQztJQUNuQixXQUFXLEdBQUc7UUFDVixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO0tBQzlCOztJQUVELFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsSUFBSSxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckgsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQzVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxD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
