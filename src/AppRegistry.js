
class AppRegistry {
    constructor() {
        this.components = [];
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

export default new AppRegistry();
