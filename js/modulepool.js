class ModulePool {
    constructor() {
        this._pool = []

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



// internals ----------------------------------------------
_init() {
}

_asSingle(bExecute, moduleList) {
    if(typeof(bExecute)=="function")
        bExecute(moduleList[0])
}

_find(moduleName) {
    let ret = null
    this._pool.forEach((el)=> {
        if (el.name===moduleName)
            ret = el
    } )
    return ret
}

    _dynamicLoading(moduleNames, index, bExecuteWhenComplete, moduleList, spread) {
        let ret = null;

        if (index < moduleNames.length) {
            const exist = this._find(moduleNames[index])
            if (exist == null) {
                ret = import(moduleNames[index]).then((dyn) => {
                    this._pool.push({ name: moduleNames[index], module: dyn.default })
                    moduleList.push(dyn.default)

                    //console.log(`${moduleNames[index]} imported dynamically using ModulePool.`)
                    index++
                    this._dynamicLoading(moduleNames, index, bExecuteWhenComplete, moduleList, spread)

                })
                    .catch((err) => {
                        console.log(`error in dynamic loading ${moduleNames[index]} - ${err.message}.`)
                        //throw('dynamic loading failed')
                    })
            }
            else {
                moduleList.push(exist.module)

                console.log(`${moduleNames[index]} was not imported, using previously loaded by ModulePool.`)
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

var modulepool = new ModulePool()
