var SalesReportsApi;
var StubApi;

class PagesReportSales {
    constructor() {
        this._salesReportsApi; 
        this._stubApi;

        this._loopInterval;
        this._loopIteration=0;
        this._loopIterationMax=20;
        this._loopLastProgress=0;
        this._stubId='';
    }

    // _init() {
    //             // Initialization of the page plugins
    //     import('../api/stub.api.js')
    //         .then((module) => {
    //             console.log('stubApi import at reports.sales - OK')
    //             StubApi = module.default;
    //             this._stubApi = new module.default();

    //             import('../api/sales.reports.api.js')
    //                 .then((module) => {
    //                     console.log('salesReportsApi import at reports.sales - OK')
    //             SalesReportsApi = module.default;
    //             this._salesReportsApi = new module.default();

    //             this._initForm()

    //         })
    //         .catch((err) => {
    //             console.log(`salesReportsApi import at reports.sales - ${err.message}`)
    //         });
    //                     })
    //         .catch((err) => {
    //             console.log(`studApi import at reports.sales - ${err.message}`)
    //         });
    // }

    init() {
        this._stubApi = new StubApi()
        this._salesReportsApi = new SalesReportsApi()

        if (jQuery().datepicker) {
            const datepickers = document.querySelectorAll(".datepicker")
            datepickers.forEach(el => {
                jQuery(el).datepicker({
                    orientation: 'bottom',
                });
            });

            // jQuery('#modalForm [name="BeginDate"]').datepicker({
            //     orientation: 'bottom',
            // });

            // jQuery('#modalForm [name="EndDate"]').datepicker({
            //     orientation: 'bottom',
            // });

        }

        const form = document.getElementById("modalForm");
        jQuery.validator.addMethod("validDateString", function (value, element, params) {
            let dt = new Date(value);
            return dt > new Date('01/01/2020');
        }, 'Must be a valid date.');
        const validateOptions = {
            rules: {
                BeginDate: {
                    required: true,
                   validDateString: true,
                },
                EndDate: {
                     required: true,
                   validDateString: true,
                },
            },
            messages: {

            },
        };
        jQuery(form).validate(validateOptions);
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();
                document.querySelectorAll("#modalForm .btn-primary")[0].classList.add('disabled')
                
                if (jQuery(form).valid()) {

                    this._salesReportsApi.Submit_PayoutReport(
                        this._getModalFormData(), 
                        (d) => {
                            const data = JSON.parse(d)
                            this._stubId = data.Id;
                            this._startModalForm();
                            this._loopInterval = setInterval( () => {
                                this._stubApi.Submit_StubRefresh(
                                    this._stubId,
                                    (d1) => {
                                        const data1 = JSON.parse(d1)
                                        //this._stubId = data1.id;
                                        if (data1.Stage !== 'Complete') {
                                            if (this._loopLastProgress != data1.Progress) {
                                                this._loopLastProgress == data1.Progress;
                                                this._loopIteration = 0;
                                            }
                                            else {
                                                this._loopIteration ++;
                                            }
                                            if (this._loopIteration < this._loopIterationMax)
                                                this._updateModalForm(`${data1.Stage} ...${data1.Progress}%`)
                                            else {
                                                clearInterval(this._loopInterval)
                                                this._resultModalForm(false, "The process have most likely hanged up, please give it sometime and try again  later")                                                
                                            }
                                         }
                                        else {
                                            clearInterval(this._loopInterval)
                                            this._resultModalForm(true, data1.Output)
                                        }
                                    },
                                    (err1) => {
                                        clearInterval(this._loopInterval)
                                        this._resultModalForm(false,"An error occurred during the process");

                                    }
                                )

                            }, 5000 ); // 1000 = 1 secs
                        },
                        (err) => {
                            this._resultModalForm("An error occurred during the process");                          
                        }
                    )
                }
            });
            document.getElementsByClassName("modal-form-download")[0].addEventListener('click', this._onModalFormDownloadClick.bind(this))
        }
        
    }

    _onModalFormDownloadClick() {
        document.querySelectorAll(".modal-form-result")[0].classList.add('d-none')
        document.querySelectorAll(".modal-form-previous")[0].classList.remove('d-none')

        document.querySelectorAll("#modalForm .btn-primary")[0].classList.remove('disabled')
        document.querySelectorAll(".modal-form-entry")[0].classList.remove('d-none')
    }

    _getModalFormData() {
        return {
            BeginDate: document.querySelector('#modalForm [name="BeginDate"]').value,
            EndDate: document.querySelector('#modalForm [name="EndDate"]').value,
            Outlet: document.querySelector('#modalForm [name="Outlet"]').value,
            UserName: document.querySelector('#modalForm [name="Username"]').value,
        }
    }

    _startModalForm() {
        document.querySelectorAll(".modal-form-entry")[0].classList.add('d-none')
        document.querySelectorAll(".modal-form-process")[0].classList.remove('d-none')
    }

    _updateModalForm(message, count) {
        document.querySelectorAll(".modal-form-previous")[0].classList.add('d-none')
        document.querySelectorAll(".modal-form-process")[0].innerHTML = `<span class="text-primary">${message}</span>`;
    }

    _resultModalForm(success, message) {
        document.querySelectorAll(".modal-form-entry")[0].classList.add('d-none')
        document.querySelectorAll(".modal-form-process")[0].classList.add('d-none')

        document.querySelectorAll(".modal-form-result")[0].classList.remove('d-none')
        if (!success)
            document.querySelectorAll(".modal-form-result")[0].innerHTML = `<span class="text-danger">${message}</span>`;
        else {
            let el = document.getElementsByClassName("modal-form-download")[0];
            el.setAttribute('href', `${this._salesReportsApi._reports_path}${message}`)
            el.setAttribute('target', 'downloadIframe')

            el = document.getElementsByClassName("modal-form-download-previous")[0];
            el.setAttribute('href', `${this._salesReportsApi._reports_path}${message}`)
            el.setAttribute('target', 'downloadIframe')
        }
    }

}


const main = function() {

    modulepool.preload([
        './user.js',
        './helpers/messages.js',
        './helpers/toasts.js',
        './user.DomInject.js',
        './api/stub.api.js',
        './api/sales.reports.api.js'
    ], (modules) => {
        modules.forEach((elem) => {
            switch (elem.name) {
                case 'Messages':
                    Messages = elem;
                    break;
                case 'Toasts':
                    Toasts = elem;
                    break;
                case 'UserDomInject':
                    UserDomInject = elem;
                    break;
                case 'User':
                    User = elem;
                case 'StubApi':
                    StubApi = elem;
                case 'SalesReportsApi':
                    SalesReportsApi=elem;
            }
        })

        const p = new PagesReportSales()
        p.init()
    })
}();