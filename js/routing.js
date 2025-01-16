class Routing {
    constructor() {
        // Initialization of the page plugins
        //this._user = null;
        this._routes = null;
        this._initForm();
    }

    _initForm() {
        import('../js/helpers/routes.js')
            .then((module) => {
                console.log('routes import at Routing - OK');
                this._routes = new module.default();
                this._setEventHandlers();
            })
            .catch((err) => {
                console.log(err.message);
            });

    }


    _setEventHandlers() {
        const routeNodes = document.querySelectorAll('.route');


        routeNodes.forEach(r => {
            let path = this._routes.getTarget(r.dataset.route)
            if (path ? 1 : 0)
                r.setAttribute('href',path)

 /*
            r.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                this._routeThisItem(event.target.closest("a"));
            });
*/

        });
    }

    _routeThisItem(el) {
        if (el.dataset.route ? 1 : 0) {
            let path = this._routes.getTarget(el.dataset.route)
            if (path ? 1 : 0)
                document.location = path;
        }
    }

}

let routing = new Routing();
routing = null;


