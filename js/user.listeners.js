class userListeners {
    constructor() {
        // Initialization of the page plugins
        this._user = null;
        this._messages = null;
        this._toast = null;
        this._routes = null;
        this._init();
    }

    _init() {
         const userDomFlag = document.querySelector('.userDomApplied');
        if (userDomFlag ? 1 : 0) {
            import('./helpers/messages.js')
                .then((module) => {
                    console.log('messages import at userListeners - OK');
                    this._messages = new module.default();

                })
                .catch((err) => {
                    console.log(`messages import at userListeners - ${err.message}`);
                });

        import('../js/helpers/routes.js')
            .then((module) => {
                console.log('routes import at userListeners - OK');
                this._routes = new module.default();

                if(window.addEventListener) {
                    window.addEventListener('load',this.installHandlers.bind(this),false); //W3C
                } else {
                    window.attachEvent('onload',this.installHandlers.bind(this)); //IE
                }
            })
            .catch((err) => {
                console.log(err.message);
            });
        }

    }

    installHandlers() {
        this._setRouteHandlers()
        this._setElementHandlers()
    }


    _setRouteHandlers() {
        const routeNodes = document.querySelectorAll('.route');


        routeNodes.forEach(r => {
            let path = this._routes.getTarget(r.dataset.route)
            if (path ? 1 : 0)
                r.setAttribute('href',path)
        });
    }

    _setElementHandlers() {
        // if (typeof User !== 'undefined')
        //     this._user = _gxUser;       // use global instance
        // else
        //     throw ('User class not instantiated properly');

        // this._user.readFromStorage();
        // if (this._user.token ? 1 : 0) {
            //ToDO: document.querySelector('.align-middle[data-bs-target="#settings"]')
            let them = document.querySelectorAll(".align-middle");
            them.forEach((el) => {
                if (el.innerText === "Logout" && document.querySelectorAll(".logout").length==0) {
                    el.addEventListener("click", (event) => {
                        const toast = new moduleToast()
                        toast.Toast(this._messages.AuthAreYouSureToLogout, "bg-transparent", true, () => {
                            const msg = this._messages.AuthUserLogout;
                            //const toast = new ComponentsToasts();
                            toast.Toast(msg, "bg-warning");
                            setTimeout(() => {
                                this._user.removeFromStorage();
                                window.location = "Pages.Authentication.Login.html";
                            }, 2000);
                        });
                    });
                }
                if (el.innerText === "Settings") {
                    el.addEventListener("click", (event) => {
                        console.log("user settings pressed");
                    });
                }
            });
            them = document.querySelectorAll(".logout"); 
            them.forEach((el) => {
                // if (el.innerText === "Logout") {
                    el.addEventListener("click", (event) => {
                        event.preventDefault;
                        event.stopPropagation();
                        const toast = new moduleToast()
                        toast.Toast(this._messages.AuthAreYouSureToLogout, "bg-transparent", true, () => {
                            const msg = this._messages.AuthUserLogout;
                            //const toast = new ComponentsToasts();
                            toast.Toast(msg, "bg-warning");
                            setTimeout(() => {
                                this._user.removeFromStorage();
                                window.location = "pages.authentication.login.html";
                            }, 500);
                        });
                    });
                // }
                // if (el.innerText === "Settings") {
                //     el.addEventListener("click", (event) => {
                //         console.log("user settings pressed");
                //     });
                // }
            });

            them = document.querySelectorAll("a");
            them.forEach((el) => {
                if (el.innerText === "User Info") {
                    el.addEventListener("click", (event) => {
                        console.log("user info pressed");
                    });
                }
            });

            them = document.querySelectorAll("a");
            them.forEach((el) => {
                if (el.innerText === "User Info") {
                    el.addEventListener("click", (event) => {
                        console.log("user info pressed");
                    });
                }
            });

            console.log('user menu at userListeners - Ok')


        const root = document.querySelector('#root');
        if (root ? 1 : 0) {
            root.classList.add('userListenersApplied');
        }

    }
}

new userListeners(); // trigger initialization
