import toast from './../helpers/toast.js';

$(document).ready(function () {
    const form = document.getElementById("loginForm");
    if (form) {
        const validateOptions = {
            rules: {
                email: {
                    required: true,
                    email: true,
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
            toast.Toast_Initialize();
            event.preventDefault();
            event.stopPropagation();
            if (jQuery(form).valid()) {
                const formValues = {
                    Email: form.querySelector('[name="email"]').value,
                    Password: form.querySelector('[name="password"]').value,
                };
                let api = new AuthApi();
                api.Request_Login(formValues,
                    (t) => {
                        let token = t.token;
                        api.Request_Profile(t.token,
                            (p) => {
                                let user = new User();
                                user.profile.firstname = p.firstname;
                                user.profile.lastname = p.lastname;
                                user.token = token;
                                user.writeToStorage();

                                window.location = "index.html";
                            }
                        );
                    },
                    (h) => {
                        console.log(h);
                        let msg = 'Toast message';
                        if (h.responseJSON.errors.length)
                            msg = h.responseJSON.errors[0];

                        //let toast = new ComponentsToasts();
                        toast.Toast(msg);
                    });
            }

        });
    }
}