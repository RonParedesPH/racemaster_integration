/**
 *
 * AuthLogin
 *
 * Pages.Authentication.Login page content scripts. Initialized from scripts.js file.
 *
 *
 */

// import Messages from '../helpers/messages.js'
// import Toasts from '../helpers/toasts.js'
// import AuthApi from '../api/auth.api.js'
// import User from '../user.js'

// var Messages = require('../helpers/messages.js')

var User;
var Messages;
var Toasts;
var AuthApi;



class AuthLoginForm {
    constructor() {

    }

    //public this
    init() {
        const form = document.getElementById("loginForm");
        if (!form) {
            return;
        }

        const validateOptions = {
            rules: {
                email: {
                    required: true,
                    email: true,
                },
                password: {
                    required: true,
                },
            },
            messages: {
                email: {
                    email: "Your email address must be in correct format!",
                },
            },
        };
        jQuery(form).validate(validateOptions);
        form.addEventListener("submit", (event) => {

            event.preventDefault();
            event.stopPropagation();
            if (jQuery(form).valid()) {
                const formValues = {
                    Email: form.querySelector('[name="email"]').value,
                    Password: form.querySelector('[name="password"]').value,
                };
                document.querySelector('button[type="submit"]').disabled = true;
                document.querySelector(".spinner-border").style.display = "block";
                const authApi = new AuthApi()
                authApi.Request_Login(
                    formValues,
                    (t) => {
                            const resp = JSON.parse(t);
                            const user = new User();

                            user.profile.username = resp.UserName;
                            user.profile.firstname = resp.UserName;
                            user.profile.lastname = ' ';
                            user.profile.profilepic = `profile-11.webp`;
                            user.token = resp.LoginSession.Id;
                            user.rolesList = resp.Roles;
                            user.routeList = resp.Routes;
                            user.writeToStorage();

                            window.location = "pages.landing.html";
                    },
                    (h) => {
                        console.log(h);
                        //let msg = 'WARNING: API backend is unreachable';
                        const messages = new Messages()
                        let msg =  messages.AuthenticationFatalError;
                         if (h.responseText? true: false)
                           msg = JSON.parse(h.responseText).Message;
                        else if (h.responseText)
                            msg = h.responseText;
                        document.querySelector('button[type="submit"]').disabled = false;
                        document.querySelector(".spinner-border").style.display = "none";

                        const toast = new Toasts();
                        toast.Toast(msg, "bg-danger");
                    }
                );
            }
        });
    }

}


//main closure
const Auth = function() {

    mudPool.preload([
        './user.js',
        './helpers/messages.js',
        './helpers/toasts.js',
        './api/auth.api.js'
    ], (modules) => {
        modules.forEach((elem) => {
            switch (elem.name) {
                case 'Messages':
                    Messages = elem;
                    break;
                case 'Toasts':
                    Toasts = elem;
                    break;
                case 'AuthApi':
                    AuthApi = elem;
                    break;
                case 'User':
                    User = elem;
            }
        })

        const r = new AuthLoginForm()
        r.init()
    })
}();

// don't export as this is not expected to be called anywhere
//export default Auth;