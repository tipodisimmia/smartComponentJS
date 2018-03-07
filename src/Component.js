import AppRegistry from './AppRegistry';

class Component {

    constructor(element, parentComponent, params) {

        this.element = element;
        this.bindedElements = {"click":[]};
        this._componentId =  this.generateUid();
        this.parentComponent = parentComponent || this;
        this.componentReferenceName = null;
        this.params = params || {};

        this.mutationObserver= new MutationObserver(this.mutationHandler.bind(this));
        this.mutationObserver.observe(element,{attributes: false, childList: true, characterData: false, subtree: true});


        if(!this.parentComponent.components){
            this.parentComponent.components={};
        }

        //Serve per recuperare il componente  tramite un nome di fantasia contenuto nell'attributo component-reference-name
        let componentReferenceName = this.params.componentReferenceName ? this.params.componentReferenceName : this.element.getAttribute("component-reference-name");
        componentReferenceName=componentReferenceName || this._componentId;

        this.parentComponent.components[componentReferenceName] = this;
        this.componentReferenceName = componentReferenceName;
        if (!element.getAttribute("component-reference-name")) {
            element.setAttribute("component-reference-name", componentReferenceName);
        }

        this.element.setAttribute("component-id",this._componentId);

        if(!this.element.getAttribute("component")){
            this.element.setAttribute("component",this.constructor.name);
        }


        if(this.element.getAttribute("component-click")){
            this.bindComponentClick(this.element);
        }

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
        var componentsEls = this.element.querySelectorAll('[component]');
        for (var i = 0; i < componentsEls.length; i++) {
            var componentId = componentsEls[i].getAttribute('component-id');

            if (!componentId) {
                var component = componentsEls[i].getAttribute('component');
                var Clazz = AppRegistry.getComponent(component);
                new Clazz(componentsEls[i],parentComponent || this);
            }
        }
    }

    bindComponentClick(node){
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

    mutationHandler(mutationsList){
            let mutationElements= mutationsList.filter((m) => {
                return m.addedNodes.length > 0;
            }).reduce((prev, current) => {
                let nodes=current.addedNodes;
                nodes.forEach((node)=>{
                    if(node.querySelectorAll){

                        let componentClickElements =node.querySelectorAll('[component-click]');
                        if(node.getAttribute("component-click")){
                            prev.push(node);
                        }

                        if (componentClickElements.length > 0) {
                            for (let i = 0; i < componentClickElements.length; i++) {
                                prev.push(componentClickElements[i]);
                            }
                        }
                    }
                })
                return prev;
            }, []);

            mutationElements.forEach((element)=>{
                this.bindComponentClick(element);
            })
    }
}

export default  Component;