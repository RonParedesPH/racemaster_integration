class Routes {
  constructor() {
    this._routeList = [];
    this._init();
  }

  _init() {
    this._addRoute('Data/Items','pages.data.items.admin.html')
    this._addRoute('Data/Items List','pages.data.items.html')
    this._addRoute('RaceMaster/Dashboard','pages.race.dashboard.html')
    this._addRoute('RaceMaster/Master Dataset','pages.race.masters.html')
  }

  _addRoute(name, target) {
    this._routeList.push({name, target})
    return true;
  }

  getTarget(name) {
    let ret = null;
    this._routeList.forEach((r) => {
        if (r.name === name)
            ret = r.target;
    })
    return ret;
  }

  getPageRights(page) {
    let ret = null
    let tar = null
    this._routeList.forEach((r) => {
        if (r.target === page)
            tar = r.name;
    })
    if (tar?true:false) {
        
    }



    return ret
  }

}



export default Routes;