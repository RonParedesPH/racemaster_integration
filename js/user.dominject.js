var User;
var Messages;
var Toasts;
var Routes;

var geta;


class UserDomInject {
    constructor() {

    }

    //public
    init() {
        const user = new User()
        user.readFromStorage();
        if (user.token ? 1 : 0) {
            /* hide common elements
            */
            let itemsToHide = [
                '[href="#apps"]',
                '[href="#pages"]',
                '[href="#blocks"]',
                '[href="#interface"]'
            ];
            itemsToHide.forEach( item => {
                let it = document.querySelector(item);
                if (it?1:0)
                    it.closest('li').classList.add('d-none');
            });

            let hideIt = document.querySelector('.language-button');
            if (hideIt ? 1 : 0)
                hideIt.classList.add('d-none');
            hideIt = document.querySelector('#settingsButton');
            if (hideIt ? 1 : 0)
                hideIt.classList.add('d-none');
            hideIt = document.querySelector('#nichesButton');
            if (hideIt ? 1 : 0)
                hideIt.classList.add('d-none');

            /* alter common elements
            */
            let alterIt = document.querySelector(".logo > a");
            if (alterIt ? 1 : 0)
                alterIt.setAttribute("href", "index.html");


            /* install handlers 
            */

            const profileElement = document.getElementsByClassName("profile");
            if (profileElement.length > 0) {

                const nameElement = document.querySelector('.user>.name');
                nameElement.innerHTML = user.fullName();
                if (user.profile.profilepic ? 1 : 0) {
                    const profilePic = document.querySelector('.user>img.profile');
                    profilePic.setAttribute('src', `img/profile/${user.profile.profilepic}`)
                }
            }

            //ToDO: document.querySelector('.align-middle[data-bs-target="#settings"]')
            let them = document.querySelectorAll(".align-middle");
            them.forEach((el) => {
                if (el.innerText === "Logout" && document.querySelectorAll(".logout").length==0) {
                    el.addEventListener("click", (event) => {
                        const messages = new Messages();
                        const toast = new Toasts()
                        toast.Toast(messages.AuthAreYouSureToLogout, "bg-transparent", true, () => {
                            const toast = new Toasts()
                            toast.Toast(messages.AuthUserLogout, "bg-warning");
                            setTimeout(() => {
                                user.removeFromStorage();
                                window.location = "Pages.Authentication.Login.html";
                            }, 1000);
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
                        const messages = new Messages()
                        const toast = new Toasts()

                        toast.Toast(messages.AuthAreYouSureToLogout, "bg-transparent", true, () => {
                            toast.Toast(messages.AuthUserLogout, "bg-warning");
                            setTimeout(() => {
                                user.removeFromStorage();
                                window.location = "pages.authentication.login.html";
                            }, 1000);
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

            them = document.querySelectorAll(".card .h-100");
            if (them.length) {
                them[0].innerHTML =
                    "Welcome " +
                    user.nickName().bold() +
                    ".<br/>" +
                    (user.rolesList.length
                        ? "The system recognizes you to have been granted the role(s) of : " +
                        user.roles().bold()
                        : "Your account has not been granted yet with any role, please contact support.");
            }

            them = document.querySelector("#menu");
            if (them ? 1 : 0) {
                let i = 0;
                let headr = '';
                let templat = '';
                let items = [];
                user.routeList.forEach((r) => {
                    let item = `item${i}`
                    if (headr !== r.Name.split('/')[0]) {
                        if (headr.length) {
                            items.push(templat.replace('^', ''));
                            templat = '';
                        }
                        headr = r.Name.split('/')[0]
                        templat = `
                        <a class="" href="#${item}" data-href="${item}.html" data-bs-toggle="collapse" data-role="button"
                            aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-menu-dropdown icon ">
                                <path d="M5.5 17C4.09554 17 3.39331 17 2.88886 16.6629C2.67048 16.517 2.48298 16.3295 2.33706 16.1111C2 15.6067 2 14.9045 2 13.5L2 6.5C2 5.09554 2 4.39331 2.33706 3.88886C2.48298 3.67048 2.67048 3.48298 2.88886 3.33706C3.39331 3 4.09554 3 5.5 3L14.5 3C15.9045 3 16.6067 3 17.1111 3.33706C17.3295 3.48298 17.517 3.67048 17.6629 3.88886C18 4.39331 18 5.09554 18 6.5L18 13.5C18 14.9045 18 15.6067 17.6629 16.1111C17.517 16.3295 17.3295 16.517 17.1111 16.6629C16.6067 17 15.9045 17 14.5 17L5.5 17Z"></path><path d="M6.75 14C6.04777 14 5.69665 14 5.44443 13.8315C5.33524 13.7585 5.24149 13.6648 5.16853 13.5556C5 13.3033 5 12.9522 5 12.25L5 7.75C5 7.04777 5 6.69665 5.16853 6.44443C5.24149 6.33524 5.33524 6.24149 5.44443 6.16853C5.69665 6 6.04777 6 6.75 6L7.25 6C7.95223 6 8.30335 6 8.55557 6.16853C8.66476 6.24149 8.75851 6.33524 8.83147 6.44443C9 6.69665 9 7.04777 9 7.75L9 12.25C9 12.9522 9 13.3033 8.83147 13.5556C8.75851 13.6648 8.66476 13.7585 8.55557 13.8315C8.30335 14 7.95223 14 7.25 14L6.75 14Z"></path><path d="M12 7H15M12 10H15M12 13H15"></path>
                            </svg>
                            <span class="label">${headr}</span>
                        </a>
                        <ul id="${item}" class="collapse">
                            ^
                        </ul>
                    `;
                    }
                    let titl = r.Name.split('/')[1];
                    // let item_target = '#';
                    // if (routes ? 1 : 0)
                    //     item_target = routes.getTarget(r.Name)

                    let tmp = templat.split('^')[0] +
                        `<li>
                            <a href="#" class="route" data-route="${r.Name}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-accordion icon ">
                                <path d="M14.5 6C15.9045 6 16.6067 6 17.1111 6.33706C17.3295 6.48298 17.517 6.67048 17.6629 6.88886C18 7.39331 18 8.09554 18 9.5L18 10.5C18 11.9045 18 12.6067 17.6629 13.1111C17.517 13.3295 17.3295 13.517 17.1111 13.6629C16.6067 14 15.9045 14 14.5 14L5.5 14C4.09554 14 3.39331 14 2.88886 13.6629C2.67048 13.517 2.48298 13.3295 2.33706 13.1111C2 12.6067 2 11.9045 2 10.5L2 9.5C2 8.09554 2 7.39331 2.33706 6.88886C2.48298 6.67048 2.67048 6.48298 2.88886 6.33706C3.39331 6 4.09554 6 5.5 6L14.5 6Z"></path>
                                <path d="M15 9 13.3536 10.6464C13.1583 10.8417 12.8417 10.8417 12.6464 10.6464L11 9M2 18 18 18M2 2 18 2"></path>
                            </svg>
                                <span class="label">${titl}</span>
                            </a>
                    </li>`                + '^' +
                        templat.split('^')[1];
                    templat = tmp;

                    i++;
                });
                if (templat.length)
                    items.push(templat.replace('^', ''));

                if (items.length) {
                    items.forEach((t) => {
                        let e = document.createElement('li');
                        //e.classList.add("dropdown");
                        e.innerHTML = t.replace('^', '').trim();
                        them.appendChild(e);

                    });
                    //const n = new Nav(document.getElementById("nav"));
                    //n._addListeners();
                }
                console.log('user menu at userDomInject - Ok')


            }
        }

        const root = document.querySelector('#root');
        if (root ? 1 : 0) {
            root.classList.add('userDomInjectDone');
        }

    }

    //public
    setEventHandlers() {
        const routeNodes = document.querySelectorAll('.route');

        const routes = new Routes()
        routeNodes.forEach(r => {
            let path = routes.getTarget(r.dataset.route)
            if (path ? 1 : 0)
                r.setAttribute('href',path)
        });
    }
}

const main = function() {
    modulepool.preload([
        './user.js',
        './helpers/messages.js',
        './helpers/toasts.js',
        './helpers/routes.js'
    ], (modules) => {
        modules.forEach((elem) => {
            switch (elem.name) {
                case 'Messages':
                    Messages = elem;
                    break;
                case 'Toasts':
                    Toasts = elem;
                    break;
                case 'Routes':
                    Routes = elem;
                    break;
                case 'User':
                    User = elem;
            }
        })

        const u = new UserDomInject()
        u.init()
        u.setEventHandlers()
    })
}()

export default UserDomInject