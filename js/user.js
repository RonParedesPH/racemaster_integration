class User {
    constructor() {
        // Initialization of the page plugins
        this.token = null;
        this.profile = { firstname: "", lastname: "", profilepic: "", username: "" };
        this.rolesList = [];
        this.routeList = [];
        this.lastStamp = new Date().toISOString();
        this._init();
    }

    readFromStorage = function () {
        let data = localStorage.getItem("acorn-user");
        if (data) {
            let obj = JSON.parse(data);
            if (obj) {
                this.lastStamp = obj.lastStamp;
                this.profile = obj.profile;
                this.token = obj.token;
                this.rolesList = obj.rolesList;
                this.routeList = obj.routeList;
                this.routeList.sort((a, b) => {
                    return a.Name == b.Name ? 0 :
                        a.Name > b.Name ? 1 : -1;
                })
            }
        }
    }

    writeToStorage = function () {
        let obj = {
            lastStamp: this.lastStamp,
            token: this.token,
            profile: this.profile,
            rolesList: this.rolesList,
            routeList: this.routeList,
        };
        localStorage.setItem("acorn-user", JSON.stringify(obj));
    }

    removeFromStorage = function () {
        localStorage.removeItem("acorn-user");
    }

    fullName = function() {
        return this.profile.firstname;
        // return this.profile.firstname[0].toUpperCase()+
        //         this.profile.firstname.substring(1)+
        //         ' ' +
        //         this.profile.lastname[0].toUpperCase()+
        //         this.profile.lastname.substring(1);
    }

    nickName = function() {
       return this.profile.firstname;
        // return this.profile.firstname[0].toUpperCase() + 
        //         this.profile.firstname.substring(1);
        //return 'nickName'
    }

    roles = function() {
        let tmp = ''
        this.rolesList.forEach( (r) => (tmp += (tmp !== "" ? ", " : "") + r.Name));
        return tmp;
    }

    routes  = function() {

        let tmp = []
        this.routeList.forEach( (r) => (tmp.push({name:r.Name, rights: r.PropsList})));
        tmp.sort((a,b)=>{
            return a.Name == b.Name ? 0 : 
                a.Name > b.Name ? 1 : -1;
        })        
        return tmp;
    }


    _init() {
        return;
    }

}
const main = function () {
    window.currentUser = new User();
    window.currentUser.readFromStorage();
    document.title = "Race App Sandbox";
}();

export default User;