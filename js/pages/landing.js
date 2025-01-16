
var User;
var Messages;
var Toasts;
var UserDomInject;


class PagesLanding {
    constructor() {
 
    }
}

//     _initForm() {
        
//                 import('../helpers/routes.js')
//                 .then((module) => {
//                     console.log('routes import at pagesLanding - OK');
//                     this._routes = new module.default();
//                     this._setEventHandlers();
//                 })
//                 .catch((err) => {
//                     console.log(err.message);
//                 });
 
//     }

//     _setEventHandlers() {
//        const routeNodes = document.querySelectorAll('.route');

//         routeNodes.forEach(r => {
//             r.addEventListener('click', event => {
//                 event.preventDefault();
//                 event.stopPropagation();
//                 this._routeThisItem(event.target.closest("a"));
//             });
//         });        
//     }

//     _routeThisItem(el) {
//         if(el.dataset.route?1:0) {
//             let path = this._routes.getTarget(el.dataset.route)
//             if (path?1:0)
//                 document.location = path;
//         }
//     }

// }

// let pagesLanding  = new PagesLanding();
// pagesLanding = null;


//main closure
const main = function() {

    modulepool.preload([
        // './user.js',
        // './helpers/messages.js',
        // './helpers/toasts.js',
        './user.DomInject.js'
    ], (modules) => {
        modules.forEach((elem) => {
            switch (elem.name) {
                // case 'Messages':
                //     Messages = elem;
                //     break;
                // case 'Toasts':
                //     Toasts = elem;
                    // break;
                case 'UserDomInject':
                    UserDomInject = elem;
                    break;
                // case 'User':
                //     User = elem;
            }
        })

        const r = new PagesLanding()
        //r.init()
    })
}();