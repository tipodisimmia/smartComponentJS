
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
                   })
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

        })
        return prevNodes;
    }

    registerComponents(componentsClasses){
        Object.keys(componentsClasses).forEach((componentClassName)=>{
            if(!this.getComponent(componentClassName)){
                this.registerComponent(componentClassName,componentsClasses[componentClassName]);
            }
        })
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

export default new ComponentManager();
