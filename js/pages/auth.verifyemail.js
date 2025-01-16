/**
 *
 * AuthVerifyEmailForm
 *
 * Pages.Authentication.Register page content scripts. Initialized from scripts.js file.
 *
 *
 */
var Messages;
var Toasts;
var AuthApi;


class AuthVerifyEmailForm {
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
                registerName: {
                    required: "Please enter your name!",
                },
            },
        };
        jQuery(form).validate(validateOptions);


        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let uid = "";
        
        if (queryString.indexOf("uid")>0)
            uid = urlParams.get("uid");
        else 
            if (queryString.indexOf("id")>0)
                uid = urlParams.get("uid");
            else 
                if (queryString.indexOf("u")>0)
                    uid = urlParams.get("u");

        if (uid.length > 0) {
            
            this._authApi.Request_VerifyInfo(uid,
                (t) => {
                    let data = JSON.parse(t);
                    form.querySelector('[name="registerEmail"]').value = data.Email;
                    form.querySelector('[name="registerName"]').value = data.UserName;
                },
                (h) => {
                    let msg = this._messages.AuthenticationFatalError;
                    if (h.responseText ? true : false)
                        msg = JSON.parse(h.responseText).Message;
                    else if (h.responseText)
                        msg = h.responseText;

                    //let toast = new ComponentsToasts();
                    const toasts = new this._Toasts()
                    toasts.Toast(msg, "bg-danger");                   
                }
                );
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (jQuery(form).valid()) {
                const formValues = {
                    email: form.querySelector('[name="registerEmail"]').value,
                    password: form.querySelector('[name="registerPassword"]').value,
                    username: form.querySelector('[name="registerName"]').value,
                };
                console.log(formValues);
                //return;
                //let api = new AuthApi();
                document.querySelectorAll('button[type="submit"]')[0].disabled = true;
                //const authApi = new AuthApi()
                this._authApi.Request_VerifyEmail(
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
    const r = new AuthVerifyEmailForm()
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

            const r = new AuthVerifyEmailForm()
            r.init()
        })
}();
//export default AuthVerifyEmailForm;
*/