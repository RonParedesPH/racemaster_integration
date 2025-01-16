
var ItemsApi;
var OutletsApi;
var DirectApi;

var geta;

class SalesOrderEditor {
    constructor() {
        const aModuleNames = []

        ItemsApi = ItemsApi || undefined;
        if (!ItemsApi)
            aModuleNames.push('./api/items.api.js');

        OutletsApi = OutletsApi || undefined;
        if (!OutletsApi)
            aModuleNames.push('./api/outlets.api.js')

        DirectApi = DirectApi || undefined;
        if (!DirectApi)
            aModuleNames.push('./api/direct.api.js')

        geta = modulepool.preload(aModuleNames, (modules) => {
            console.log(modules)
            modules.forEach((elem) => {
                switch (elem.name) {
                    case 'ItemsApi':
                        ItemsApi = elem;
                        break;
                    case 'OutletsApi':
                        OutletsApi = elem;
                        break;
                    case 'DirectApi':
                        DirectApi = elem;
                }
            })

            this._element = null;
            this._data = null;
            this._objective = '';
            this._onCancel = null,
                this._onSave = null,

                this._itemsLookup = null;
            this._outletsLookup = null;

            this._objective = '';
            this._lineToEdit = -1;

           })
    }


    // Filling the modal form data
    _setForm() {
        if (this._element != null) {
            const el = this._element;
            const data = this._data;
            if (data !== null) {
                el.querySelector('input[name=ControlNumber]').value = data.ControlNumber;
                el.querySelector('input[name=DateSold]').value = new Date(data.DateSold).toLocaleDateString();
                el.querySelector('input[name=Outlet]').value = data.Outlet;
                el.querySelector('input[name=SoldToDistributorNumber]').value = data.SoldToDistributorNumber;
                el.querySelector('input[name=SoldToDistributorName]').value = data.SoldToDistributorName;
            }
            else {
                el.querySelector('input[name=ControlNumber]').value = '';
                el.querySelector('input[name=DateSold]').value = '';
                el.querySelector('input[name=Outlet]').value = '';
                el.querySelector('input[name=SoldToDistributorNumber]').value = '';
                el.querySelector('input[name=SoldToDistributorName]').value = '';
            }
            // el.querySelector('input[name=Username]').value = data.UserName;
        }
        this._setEditorLines()
    }

    _setEditorLines() {
        const el = this._element
        let inner = '';
        let total = 0;
        let i = 0;

        if (this._data != null) {

            this._data.SalesOrderDetails.forEach(e => {
                //if (e.active == 1) {
                total += Number(e.RecordedPrice) * Number(e.Quantity)
                inner += `                                            
                    <tr>
                        <td scope="row"> ${e.Item1.ItemCode} <br/> ${e.Item1.ItemName}
                        </td>
                        <td class="text-end"> ${e.RecordedPrice}
                        </td>
                        <td class="text-end"> ${e.Quantity}
                        </td>
                        <td class="text-end"> ${e.RecordedPrice * e.Quantity}
                        </td>` +
                    (this._objective !== 'Delete' ?
                        `<td>
                            <div class="d-inline">
                                <button class="btn btn-icon btn-icon-only btn-outline-primary shadow edit-datatable" title="" type="button" onclick="_this._onEditLineClick(${i})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-edit undefined">
                                        <path d="M14.6264 2.54528C15.0872 2.08442 15.6782 1.79143 16.2693 1.73077C16.8604 1.67011 17.4032 1.84674 17.7783 2.22181C18.1533 2.59689 18.33 3.13967 18.2693 3.73077C18.2087 4.32186 17.9157 4.91284 17.4548 5.3737L6.53226 16.2962L2.22192 17.7782L3.70384 13.4678L14.6264 2.54528Z"></path>
                                    </svg>
                                </button>
                                <button class="btn btn-icon btn-icon-only btn-outline-primary shadow delete-datatable"  title="" type="button"  onclick="_this._onDeleteLineClick(${i})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-bin undefined">
                                        <path d="M4 5V14.5C4 15.9045 4 16.6067 4.33706 17.1111C4.48298 17.3295 4.67048 17.517 4.88886 17.6629C5.39331 18 6.09554 18 7.5 18H12.5C13.9045 18 14.6067 18 15.1111 17.6629C15.3295 17.517 15.517 17.3295 15.6629 17.1111C16 16.6067 16 15.9045 16 14.5V5"></path>
                                        <path d="M14 5L13.9424 4.74074C13.6934 3.62043 13.569 3.06028 13.225 2.67266C13.0751 2.50368 12.8977 2.36133 12.7002 2.25164C12.2472 2 11.6734 2 10.5257 2L9.47427 2C8.32663 2 7.75281 2 7.29981 2.25164C7.10234 2.36133 6.92488 2.50368 6.77496 2.67266C6.43105 3.06028 6.30657 3.62044 6.05761 4.74074L6 5"></path>
                                        <path d="M2 5H18M12 9V13M8 9V13"></path>
                                    </svg>
                                </button>
                               <button class="btn btn-icon btn-icon-only btn-outline-primary shadow add-datatable"  title="" type="button"  onclick="_this._onAddLineClick(${i})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-plus undefined">
                                        <path d="M10 17 10 3M3 10 17 10"></path>
                                    </svg>
                                </button>
                            </div>
                        </td>` : '<td></td>')
                    +

                    `</tr>`;
                //}
                i++;

            })
            el.querySelector('#tableEditor tbody').innerHTML = inner;
            el.querySelector('input[name=Total]').value = total;
        }
        if (i == 0)
            el.querySelector('#controlAddLine').classList.remove("d-none")
        else
            el.querySelector('#controlAddLine').classList.add("d-none")
    }



    _showModal(objective, title, button) {
        const el = this._element;
        el.querySelector('#modalTitle').innerHTML = objective

        if (objective === 'Edit' || objective === 'Add') {
            el.querySelector('#controlEditorEdit').classList.add('d-none')
            el.querySelector('#controlEditorDelete').classList.add('d-none')

            el.querySelector('input[name=ControlNumber]').readonly = false;
            el.querySelector('input[name=DateSold]').readonly = false;
            el.querySelector('input[name=Outlet]').readonly = false;
            el.querySelector('input[name=SoldToDistributorNumber]').readonly = false;
            //el.querySelector('input[name=SoldToDistributorName]').value = data.SoldToDistributorName;

        }
        if (objective == 'Delete') {
            el.querySelector('#controlEditorEdit').classList.add('d-none')
            el.querySelector('#controlEditorSave').classList.add('d-none')
            el.querySelector('#controlEditorCancel').classList.add('d-none')
            el.querySelector('#controlEditorDelete').classList.remove('d-none')
        }

        _this = this;
        this._modal.show()
    }



    showEditor(el, data, mode, onSaveCallback, onCancelCallback) {
        const clon = el.cloneNode(true);
        const newId = 'sales_order___' + (Math.floor(Math.random() * (9999 - 1111 + 1) + 1111))
        clon.setAttribute('id', newId)
        document.body.appendChild(clon)

        el = document.getElementById(newId)

        this._element = el
        this._element.addEventListener(
            "hide.bs.modal",
            () => {
                if (typeof (onCancelCallback) == "function")
                    onCancelCallback()
                this._element.remove()
            },
            { once: true }
        );

        this._modal = new bootstrap.Modal(el);

        if (data != null)
            this._data = data;
        else
            this._data = this._createDummy()
        this._objective = mode;

        this._onSave = onSaveCallback;
        this._onCancel = onCancelCallback

        this._addListeners()
        this._setFormValidations()

        this._setForm()
        this._showModal(mode)

        this._fetchLookups()


        if (this._objective == 'Delete') {
            this._onEditorDeleteClick()
        }
    }

    _createDummy() {
        return {
            ControlNumber: '',
            DateSold: new Date(),
            Outlet: '',
            SoldToDistributorNumber: '',
            SoldToDistributorName: '',
            SalesOrderDetails: []
        }
    }


    _setLineForm(objective) {
        const el = this._element
        el.querySelector('input[name=ItemName]').readonly = true;

        if (objective == "Add") {
            el.querySelector('input[name=ItemId]').value = '';
            el.querySelector('input[name=ItemCode]').value = '';
            el.querySelector('input[name=ItemName]').value = '';
            el.querySelector('input[name=Quantity]').value = '';
            el.querySelector('input[name=Amount]').value = '';

            el.querySelector('#controlSaveLineEdit span').innerHTML = "Add new"

            return
        }
        if (objective == "Edit") {
            const data = this._data.SalesOrderDetails[this._lineToEdit]
            el.querySelector('input[name=ItemId]').value = data.Item1.Id;
            el.querySelector('input[name=ItemCode]').value = data.Item1.ItemCode;
            el.querySelector('input[name=ItemName]').value = data.Item1.ItemName;
            el.querySelector('input[name=Quantity]').value = data.Quantity;
            el.querySelector('input[name=Amount]').value = data.Quantity * data.RecordedPrice;

            el.querySelector('#controlSaveLineEdit span').innerHTML = "Update"

            return
        }

    }

    _showLineForm() {
        const el = this._element;
        el.querySelector('#tableEditor tbody').innerHTML = '';
        el.querySelectorAll('.line-form-wrapper')[0].classList.remove('d-none')
        el.querySelectorAll('.editor-buttons-wrapper')[0].classList.add('d-none')
    }

    _hideLineForm() {
        const el = this._element;
        el.querySelectorAll('.line-form-wrapper')[0].classList.add('d-none')
        el.querySelectorAll('.editor-buttons-wrapper')[0].classList.remove('d-none')
    }

    _fetchLookups() {
        const el = this._element;
        const itemsApi = new ItemsApi()
        itemsApi.Request_Items(
            (d) => {
                this._itemsLookup = JSON.parse(d);

                if (el.querySelector('#itemCode_input') !== null) {
                    const secs = [];
                    this._itemsLookup.forEach(e => {
                        secs.push({ id: e.ItemCode, name: `${e.ItemCode}  ${e.ItemName}` })
                    })
                    new AutocompleteCustom('itemCode_input', 'itemCode_input_result', {
                        data: {
                            src: secs,
                            key: ['name'],
                        },
                        placeHolder: '',
                        searchEngine: 'strict',
                        onSelection: (feedback) => {
                            el.querySelector('#itemCode_input').value = feedback.selection.value['id'];
                            el.querySelector('#itemCode_input').focus();
                        },
                    });
                }
            },
            (x) => { console.log(`xhr error: ${x}`); }
        );
        const outletsApi = new OutletsApi()
        outletsApi.Request_Outlets(
            (d) => {
                this._outletsLookup = JSON.parse(d);
                if (el.querySelector('#outlet_input') !== null) {
                    const secs = [];
                    this._outletsLookup.forEach(e => {
                        secs.push({ id: e.OutletCode, name: `${e.OutletCode}  ${e.OutletName}` })
                    })
                    new AutocompleteCustom('outlet_input', 'outlet_input_result', {
                        data: {
                            src: secs,
                            key: ['name'],
                        },
                        placeHolder: '',
                        searchEngine: 'strict',
                        onSelection: (feedback) => {
                            el.querySelector('#outlet_input').value = feedback.selection.value['id'];
                            el.querySelector('#outlet_input').blur();
                        },
                    });
                }
            },
            (x) => { console.log(`xhr error: ${x}`); }
        );


    }

    _setFormValidations() {
        const el = this._element;
        // header form
        const formEditor = el.querySelector("#formEditor");
        // jQuery.validator.addMethod("validItemCode", function (value, element, params) {
        //      return _this._itemsLookup.filter( e=> e.ItemCode == el.querySelector('#itemCode_input').value).length > 0;
        // }, 'Must be a valid Item Code.');
        jQuery.validator.addMethod("validDateString", function (value, element, params) {
            let dt = new Date(value);
            return dt > new Date('01/01/2020');
        }, 'Must be a valid date {1}.');

        const validateEditorOptions = {
            rules: {
                DateSold: {
                    required: true,
                    validDateString: true,
                },
                ControlNumber: {
                    required: true,
                    minlength: 6,
                    maxlength: 10,
                },
                SoldToDistributorNumber: {
                    required: true,
                    digits: true,
                    minlength: 7,
                    maxlength: 8,
                },
                SoldToDistributorName: {
                    required: true,
                },
                Outlet: {
                    required: true,
                },
            },
            messages: {

            },
        };
        jQuery(formEditor).validate(validateEditorOptions);
        if (formEditor) {
            formEditor.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (jQuery(formEditor).valid()) {
                    this._onEditorSaveClick()
                }
            });

        }

        // line form
        const formLine = el.querySelector("#formLine");
        jQuery.validator.addMethod("validItemCode", function (value, element, params) {
            return _this._itemsLookup.filter(e => e.ItemCode == el.querySelector('#itemCode_input').value).length > 0;
        }, 'Must be a valid Item Code.');

        const validateLineOptions = {
            rules: {
                ItemCode: {
                    required: true,
                    minlength: 8,
                    maxlength: 11,
                    validItemCode: true,
                },
                Quantity: {
                    required: true,
                    number: true,
                },
                Amount: {
                    required: true,
                    number: true,
                    //greaterThanOrEqual: ["input[name=Quantity]","Quantity"]
                },
            },
            messages: {

            },
        };
        jQuery(formLine).validate(validateLineOptions);
        if (formLine) {
            formLine.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (jQuery(formLine).valid()) {
                    this._onSaveLineEditClick()
                }
            });

        }
    }

    _addListeners() {
        const el = this._element
        //el.querySelector('#controlEditorSave').addEventListener('click', this._onEditorSaveClick.bind(this));
        el.querySelector('#controlEditorCancel').addEventListener('click', this._onEditorCancelClick.bind(this));
        el.querySelector('#controlEditorDelete').addEventListener('click', this._onEditorDeleteClick.bind(this));

        el.querySelector('#controlAddLine').addEventListener('click', this._onAddLineClick.bind(this));
        el.querySelector('#controlCancelLineEdit').addEventListener('click', this._onCancelLineEditClick.bind(this));
        //el.querySelector('#controlSaveLineEdit').addEventListener('click', this._onSaveLineEditClick.bind(this));

        el.querySelector('#itemCode_input').addEventListener('focusout', (e) => {
            const el = this._element;
            const item = this._itemsLookup.filter(e => e.ItemCode == el.querySelector('#itemCode_input').value)
            if (item.length) {
                el.querySelector('[name="ItemId"]').value = item[0].Id;
                el.querySelector('[name="ItemName"]').value = item[0].ItemName;
                // document.querySelector('#addEditModal [name="Quantity"]').value *
                //     item[0].DiscountedPrice;

                // document.querySelector('#addEditModal [name="ItemName"]').value  = item[0].ItemName;
                // document.querySelector('#addEditModal [name="RecordedPrice"]').value  = item[0].DiscountedPrice;
                // document.querySelector('#addEditModal [name="CategoryCode"]').value  = item[0].ItemCategory1.CategoryCode;
            }
            else {
                el.querySelector('[name="ItemId"]').value = '';
                el.querySelector('[name="ItemName"]').value = '';
            }
        })
        el.querySelector('[name="Quantity"]').addEventListener('focusout', (e) => {
            const el = this._element;
            const item = this._itemsLookup.filter(e => e.ItemCode == el.querySelector('#itemCode_input').value)
            if (item.length) {
                el.querySelector('[name="Amount"]').value = item[0].DiscountedPrice * Number(el.querySelector('[name="Quantity"]').value);
            }
            else {
                el.querySelector('[name="Amount"]').value = '';
            }
        })
        el.querySelector('[name="SoldToDistributorNumber"]').addEventListener('change', (e) => {
            el.querySelector('[name="SoldToDistributorName"]').value = ''
            const val = el.querySelector('[name="SoldToDistributorNumber"]').value
            if (val.length == 7) {
                const directApi = new DirectApi()
                directApi.Request_Direct(val,
                    (d) => {
                        const data = JSON.parse(d);
                        el.querySelector('[name="SoldToDistributorName"]').value = `${data.name_last}, ${data.name_first}`;
                    },
                    () => {
                        console.log('error looking up -', val)
                    }
                );
            }
        })

        // date picker is some sort of listener
        if (jQuery().datepicker) {
            el.querySelectorAll('.datepicker').forEach(e => {
                jQuery(e).datepicker({
                    autoclose: true,
                });
                jQuery(e).on('change', function () {
                    jQuery(this).valid();
                    $(e).focus();
                });
            })
            // jQuery('#dateSold2').datepicker({
            //     autoclose: true,
            // });
            // jQuery('#dateSold2').on('change', function () {
            //     jQuery(this).valid();
            //     $('#dateSold2').focus();
            // });
        }
    }

    _onDeleteLineClick(line) {
        const toast = new Toasts()
        toast.Toast("Are you sure you want to delete that line?", "bg-primary", true, () => {
            const a = [];
            for (let i = 0; i < this._data.SalesOrderDetails.length; i++) {
                if (i !== line)
                    a.push(this._data.SalesOrderDetails[i])
            }
            this._data.SalesOrderDetails = a;
            this._setEditorLines()
        });
    }

    _onAddLineClick() {
        this._lineToEdit = -1;
        this._setLineForm("Add")
        this._showLineForm()

        this._setFocusItemCode()
    }

    _setFocusItemCode() {
        const el = this._element.querySelector('[name="ItemCode"]')
        el.focus();

        let val = el.value;
        el.value = '';
        el.value = val;
    }

    _onEditLineClick(line) {
        this._lineToEdit = line;
        this._setLineForm("Edit")
        this._showLineForm()
        this._setFocusItemCode()
    }

    _onCancelLineEditClick() {
        this._hideLineForm()
        this._setEditorLines()
    }

    _onSaveLineEditClick() {
        const el = this._element;
        // const form = el.querySelector("#formLine");
        // if (jQuery(form).valid()) {
        if (this._lineToEdit === -1) {
            let item1 = {
                Id: el.querySelector('input[name=ItemId]').value,
                ItemCode: el.querySelector('input[name=ItemCode]').value,
                ItemName: el.querySelector('input[name=ItemName]').value,
            }
            let data = {
                Item: el.querySelector('input[name=ItemId]').value,
                Item1: item1,
                Quantity: el.querySelector('input[name=Quantity]').value,
                RecordedPrice: el.querySelector('input[name=Amount]').value / el.querySelector('input[name=Quantity]').value,
            }
            this._data.SalesOrderDetails.push(data)
        }
        else {
            this._data.SalesOrderDetails[this._lineToEdit].Item1.Id = el.querySelector('input[name=ItemId]').value;
            this._data.SalesOrderDetails[this._lineToEdit].Item1.ItemCode = el.querySelector('input[name=ItemCode]').value;
            this._data.SalesOrderDetails[this._lineToEdit].Item1.ItemName = el.querySelector('input[name=ItemName]').value;
            this._data.SalesOrderDetails[this._lineToEdit].Quantity = el.querySelector('input[name=Quantity]').value;
            this._data.SalesOrderDetails[this._lineToEdit].RecordedPrice = el.querySelector('input[name=Amount]').value / el.querySelector('input[name=Quantity]').value;
        }
        this._hideLineForm()
        this._setEditorLines()
        // }  
    }

    _onEditorSaveClick() {
        this._modal.hide()
        if (typeof (this._onSave) === 'function') {
            const el = this._element;
            this._data.ControlNumber = el.querySelector('input[name=ControlNumber]').value;
            this._data.DateSold = el.querySelector('input[name=DateSold]').value;
            this._data.Outlet = el.querySelector('input[name=Outlet]').value;
            this._data.SoldToDistributorNumber = el.querySelector('input[name=SoldToDistributorNumber]').value;
            this._data.SoldToDistributorName = el.querySelector('input[name=SoldToDistributorName]').value;

            this._onSave(this._data)
        }


    }

    _onEditorCancelClick() {
        this._modal.hide()
        if (typeof (this._onCancel) === 'function')
            this._onCancel()

    }

    _onEditorDeleteClick() {
        const toast = new Toasts()
        toast.Toast("Are you sure you want to delete this record?", "bg-primary", true, () => {
            this._modal.hide()
            if (typeof (this._onSave) == 'function') {
                this._onSave(this._data)
            }
        });
    }
}

export default SalesOrderEditor
    ;