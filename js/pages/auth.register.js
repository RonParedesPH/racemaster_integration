/**
 *
 * AuthRegisterForm
 *
 * Pages.Authentication.Register page content scripts. Initialized from scripts.js file.
 *
 *
 */
var Messages;
var Toasts;
var AuthApi;


class AuthRegisterForm {
    constructor() {
        this._messages = null
        this._toasts = null
        this._authApi = null
    }

    // Public
    init(mes, toa, aut) {
        this._Messages = mes;
        this._messages = new mes();

        this._Toasts = toa;
        // do not pre-instantiate Toasts

        this._AuthApi = aut;
        this._authApi = new aut();

        const form = document.getElementById("registerForm");
        if (!form) {
            return;
        }
        const validateOptions = {
            rules: {
                registerEmail: {
                    required: true,
                    email: true,
                },
                registerPassword: {
                    required: true,
                    minlength: 6,
                    regex: /[a-z].*[0-9]|[0-9].*[a-z]/i,
                },
                registerCheck: {
                    required: true,
                },
                registerName: {
                    required: true,
                },
            },
            messages: {
                registerEmail: {
                    email: "Your email address must be in correct format!",
                },
                registerPassword: {
                    minlength: "Password must be at least {0} characters!",
                    regex: "Password must contain a letter and a number!",
                },
                registerCheck: {
                    required: "Please read and accept the terms!",
                },
                registerName: {
                    required: "Please enter your name!",
                },
            },
        };
        jQuery(form).validate(validateOptions);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (jQuery(form).valid()) {
                const formValues = {
                    email: form.querySelector('[name="registerEmail"]').value,
                    password: form.querySelector('[name="registerPassword"]').value,
                    username: form.querySelector('[name="registerName"]').value,
                    check: form.querySelector('[name="registerCheck"]').checked,
                };
                console.log(formValues);
                //return;
                //let api = new AuthApi();
                document.querySelectorAll('button[type="submit"]')[0].disabled = true;
                //const authApi = new AuthApi()
                this._authApi.Request_Register(
                    formValues,
                    (t) => {
                        console.log(t);

                        //const messages = new Messages()
                        let msg = this._messages.AuthRegistrationSuccess;

                        const toasts = new this._Toasts()
                        toasts.Toast(msg, "bg-primary");

                        setTimeout(() => {
                            window.location = "pages.authentication.login.html";
                        }, 2000);
                    },
                    (h) => {
                        console.log(h);

                        //let msg = 'WARNING: API backend is unreachable';
                        //const messages = new Messages()
                        let msg = this._messages.AuthenticationFatalError;
                        if (h.responseText ? true : false)
                            msg = JSON.parse(h.responseText).Message;
                        else if (h.responseText)
                            msg = h.responseText;

                        //let toast = new ComponentsToasts();
                        const toasts = new this._Toasts()
                        toasts.Toast(msg, "bg-danger");
                    },
                    () => {
                        document.querySelectorAll(
                            'button[type="submit"]'
                        )[0].disabled = false;
                    }
                );
            }
        });
    }


}

modulepool.depends([
    './user.js',
    './helpers/messages.js',
    './helpers/toasts.js',
    './api/auth.api.js'
], (user, messages, toasts, authApi) => {

    //const r = new RowsAjax()
    const r = new AuthRegisterForm()
    // intentionally drop user
    r.init(messages, toasts, authApi) 
})


/*
const Auth = function() {

    modulepool.preload([
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
                }
            })

            const r = new AuthRegisterForm()
            r.init()
        })
}();
//export default AuthRegisterForm;
*/