var GlobalPool = (typeof GlobalPool == "undefined")? [] : GlobalPool;

class ModulePool {
    constructor() {
        this._pool = GlobalPool;
        this._singletons = []

        this._init();
    }

// externals ----------------------------------------------
preload(moduleNames, bExecuteWhenComplete) {
    const moduleList = []
    const teta = this._dynamicLoading(moduleNames, 0, bExecuteWhenComplete, moduleList)
    return teta
}

loadOnDemand(moduleName, bExecuteOnLoad) {
    const moduleList = []
    const exist = this._find(moduleName)
    if (exist==null) {
        const a=[moduleName]
        this._dynamicLoading(a, 0, (l)=>this._asSingle(bExecuteOnLoad), moduleList)
    }
    else 
        if (typeof(bExecuteOnLoad)=="function") {
            bExecuteOnLoad(exist.module)
        }
}

depends(moduleNames, bExecuteWhenComplete) {
    const moduleList = []
    const teta = this._dynamicLoading(moduleNames, 0, bExecuteWhenComplete, moduleList, true)
    return teta
}

    Singleton(classname, instance) {
        const exist = null
        if (instance == 'undefined') {
            exist = _find(classname, this._singletons)
            if (exist == null) 
                return null 
            else 
                return exist.instance
        }
        else {
            exist = _find(classname, this._singletons)
            if (exist == null) {
                this._singletons.push({ name: classname, instance: instance })
                return instance
            }
            else {
                console.log("<<ModulePool: attempt to add a second instance of ${classname} to singletons list.>>")
                return exist.instance
            }
        }
    }


// internals ----------------------------------------------
_init() {
}

_asSingle(bExecute, moduleList) {
    if(typeof(bExecute)=="function")
        bExecute(moduleList[0])
}

_find(moduleName, arr) {
    let ret = null
    arr.forEach((el)=> {
        if (el.path ===moduleName)
            ret = el
    } )
    return ret
}

    _dynamicLoading(moduleNames, index, bExecuteWhenComplete, moduleList, spread) {
        let ret = null;

        if (index < moduleNames.length) {
            const exist = this._find(moduleNames[index], this._pool)
            if (exist == null) {
                ret = import(moduleNames[index]).then((dyn) => {
                    this._pool.push({ path: moduleNames[index], name: dyn.default.name, module: dyn.default })
                    moduleList.push(dyn.default)

                    window[dyn.default.name] = dyn.default;

                    console.log(`ModulePool: ${moduleNames[index]} imported dynamically first time.`)
                    index++
                    this._dynamicLoading(moduleNames, index, bExecuteWhenComplete, moduleList, spread)

                })
                    .catch((err) => {
                        console.log(`<<ModulePool: error in dynamic loading ${moduleNames[index]} - ${err.message}.>>`)
                        //throw('dynamic loading failed')
                    })
            }
            else {
                moduleList.push(exist.module)

                console.log(`ModulePool: ${moduleNames[index]} was not imported this time, using previously loaded instance from pool instead.`)
                index++
                this._dynamicLoading(moduleNames, index, bExecuteWhenComplete, moduleList, spread)
            }
        }
        else {
            if (typeof (bExecuteWhenComplete) === 'function')
                if (spread)
                    bExecuteWhenComplete(...moduleList)
                else
                    bExecuteWhenComplete(moduleList)
        }

        return ret
    }


}

var mudPool;
if (window.modulePool === undefined) {
    window.modulePool = new ModulePool();
    mudPool = window.modulePool;
}
