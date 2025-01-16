/**
 *
 * Toasts
 *
 * Interface.Components.Toasts page content scripts. Initialized from scripts.js file.
 *
 *
 * Dependency List: 
 *      - HtmlLoader.js
 *      - Toast_partial.html
 */


class Toasts {
    constructor() {
        // References to page items that might require an update
        this._live = null;
        this._liveToast = null;
        this._ConfirmAction = null;

        // Initialization of the page plugins
        this._initLiveToast();
        //this._initToastPlacement();
    }

    _initLiveToast() {
        const liveToastEl = document.getElementById("liveToast");
        if (liveToastEl ? true : false) {
            this.set_liveToast()
        }
        else {
            import('./htmlLoader.js')
                .then((module) => {
                    console.log('htmlLoader import at Toasts - OK');
                    const htmlLoader = new module.default();
                    htmlLoader.Load('partial/toast_partial.html', null,
                        (resp) => {
                            this.set_liveToast()
                        },
                        (status) => { console.log(status) }
                    );
                })
                .catch((err) => {
                    console.log(`htmlLoader import at Toasts - ${err.message}`);
                });


            
        }
        /*
        let liveToastBtnEl = document.getElementById("liveToastBtn");

        if (liveToastEl && liveToastBtnEl) {
            this._liveToast = new bootstrap.Toast(
                document.getElementById("liveToast")
            );

            liveToastBtnEl.addEventListener("click", (event) => {
                this._liveToast && this._liveToast.show();
            });
        }
        */
    }

    set_liveToast(e) {
        let el = document.querySelector('#live')
        const clon = el.cloneNode(true);
        const newId = 'live___' + (Math.floor(Math.random() * (9999 - 1111 + 1) + 1111))
        clon.setAttribute('id', newId)
        el.parentElement.appendChild(clon)

        el = document.getElementById(newId)
        this._live = el;


        // this._liveToast = new bootstrap.Toast(document.getElementById("liveToast"))
        // const el_action = document.getElementsByClassName("toast-action-button")
        this._liveToast = new bootstrap.Toast(el.getElementsByClassName("toast")[0])
        const el_action = el.getElementsByClassName("toast-action-button")
        if (el_action.length) {
            // el_action[0].removeEventListener("click",
            //     () => {
            //         this._liveToast.hide();
            //         action();
            //     }
            // );
            el_action[0].addEventListener("click",
                () => {
                    this._liveToast.hide();
                    if (typeof (this._ConfirmAction) === 'function')
                        this._ConfirmAction()
                    // action();
                }
            );
        }
        this._live.addEventListener(
            "hide.bs.toast",
            () => {
                this._live.children[0].classList.add("d-none")
                this._live.remove()
                //this._live.children[0].classList.add("d-none");
                // if (backgroundColor ? true : false) {
                //     liveToastElem.classList.remove(backgroundColor);
                // }
            },
            { once: true }
        );
    }

    _initToastPlacement() {
        const selectToastPlacementEl = document.getElementById(
            "selectToastPlacement"
        );
        const toastPlacementEl = document.getElementById("toastPlacement");

        if (selectToastPlacementEl && toastPlacementEl) {
            selectToastPlacementEl.addEventListener("change", (event) => {
                toastPlacementEl.className = `toast-container position-absolute p-3 ${selectToastPlacementEl.value}`;
            });
        }
    }

    Toast(message, backgroundColor, confirm_mode, action ) {
        if (this._liveToast ? true : false) {
            // const live = document.getElementById("live");
            //  const liveToastElem = document.getElementById("liveToast");
            const live = this._live;
            const liveToastElem = this._liveToast;

            if (live ? true : false) {
                live.children[0].classList.remove("d-none");

                // if (backgroundColor ? true : false) {
                //     liveToastElem._element.classList.add(backgroundColor);
                // }
                const el_buttons = live.getElementsByClassName("toast-buttons")
                if (el_buttons.length) {
                    el_buttons[0].classList.add("d-none");
                    if (confirm_mode && action) {
                        // show the buttons
                        el_buttons[0].classList.remove("d-none");
                        this._ConfirmAction = action;
                        // install the eventlistener for the action button
                        // const el_action = document.getElementsByClassName("toast-action-button");
                        // if (el_action.length) {
                            // el_action[0].removeEventListener("click", 
                            //     () => {
                            //         this._liveToast.hide();
                            //         action();
                            //     }
                            // );
                            // el_action[0].addEventListener("click", 
                            //     () => {
                            //         this._liveToast.hide();
                            //         action();
                            //     }
                            // );
                            // //this._liveToast._element.dataset.autohide=false;
                            // this._ConfirmAction = action;
                        // }
                    }
                }
            }
            const toastMessageText = live.getElementsByClassName("toast-message");
            if (toastMessageText.length) {
                toastMessageText[0].innerText = message;
            }

            this._liveToast.show();
        }
    }
}

new Toasts();

export default Toasts;