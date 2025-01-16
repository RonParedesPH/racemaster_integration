/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */

var Toasts;
var Messages;
var ItemsApi;
var OutletsApi;
var DirectApi;
var SalesApi;
var SalesOrderEditor;

var _this = null;
var geta;

class RowsAjax {
    constructor() {}

    init() {
            if (!jQuery().DataTable) {
                console.log('DataTable is null!');
                return;
            }

            // Selected single row which will be edited
            this._rowToEdit;
            this._rowToDelete;

            // Datatable instance
            this._datatable;
            this._formTable;

            // Edit or add state of the modal
            this._currentState;

            // Controls and select helper
            this._datatableExtend;

            // Add or edit modal
            this._addEditModal;

            // Datatable single item height
            this._staticHeight = 62;

            //this._salesApi = null;
            //this._toast = null;
            //this._messages = null;

            //this._initObjectsAndVariables();
            this._createInstance();
            this._addListeners();
            this._extend();
            this._initBootstrapModal();
            this._fetchData();
        }


    _initObjectsAndVariables() {
        // = new Messages()
        // = new Toasts()




            //     import('../helpers/messages.js')
            // .then((module) => {
            //     console.log('messages import at dataadmin.item - OK');
            //     this._messages = new module.default();
            //                 })
            // .catch((err) => {
            //     console.log(`messages import at dataadmin.item - ${err.message}`);
            // });
        // import('../components/toasts.js')
        //     .then((module) => {
        //         console.log('toasts import at dataadmin.item - OK');
        //         this._toast = new module.default();
        //         Toasts = module.default;
        //     })
        //     .catch((err) => {
        //         console.log(`toasts import at dataadmin.item - ${err.message}`);
        //     });

        // import('../api/sales.api.js')
        //     .then((module) => {
        //         console.log('salesApi import at dataadmin.item - OK');
        //         //this._salesApi = new module.default();
        //         SalesApi = module.default;

        //         this._fetchData();
        //     })
        //     .catch((err) => {
        //         console.log(`salesApi import at dataadmin.item - ${err.message}`);
        //     });
            // import('../api/items.api.js')
            // .then((module) => {
            //     console.log('itemsApi import at dataadmin.item - OK');
            //     itemsModule = module.default;
            // })
            // .catch((err) => {
            //     console.log(`itemsApi import at dataadmin.item - ${err.message}`);
            // });
            // import('../api/outlets.api.js')
            // .then((module) => {
            //     console.log('outletsApi import at dataadmin.item - OK');
            //     OutletsApi = module.default;
            // })
            // .catch((err) => {
            //     console.log(`outletsApi import at dataadmin.item - ${err.message}`);
            // });
            // import('../api/direct.api.js')
            // .then((module) => {
            //     console.log('directApi import at dataadmin.item - OK');
            //     DirectApi = module.default;
            // })
            // .catch((err) => {
            //     console.log(`directApi import at dataadmin.item - ${err.message}`);
            // });

            // import('../modules/sales.order.editor.js')
            // .then((module) => {
            //     console.log('salesOrderEditor import at dataadmin.item - OK');
            //     salesOrderEditor = module.default;
            // })
            // .catch((err) => {
            //     console.log(`salesOrderEditor import at dataadmin.item - ${err.message}`);
            // });
    }

    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance() {
        const salesApi = new SalesApi()
        this._datatable = jQuery('#datatableRowsAjax').DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            processing: true,
            serverSide: true,
            ajax: {
                type: "POST",
                contentType: "application/json",
                url: salesApi._path + '/salesOrderPages',
                //`http://localhost:52764/api/salesOrderPages`,
                data: function (d) {
                    // note: d is created by datatable, the structure of d is the same with DataTableParameters model above
                    //console.log(JSON.stringify(d));
                    return JSON.stringify(d);
                },
            },
            order: [0, "asc"], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            //   columns: [{data: ''}, {data: 'Sales'}, {data: 'Stock'}, {data: 'Category'}, {data: 'Tag'}, {data: 'Check'}],
            columns: [
            { data: 'DateSold', name: 'DateSold'},
            { data: 'ControlNumber', name: 'ControlNumber' },
            { data: 'SoldToDistributorNumber', name: 'SoldToDistributorNumber' },            
            { data: 'Items', orderable: false},            
            { data: 'TotalAmount' , orderable: false},
            { data: 'username' },                        
 
            { data: 'Tag' , orderable: false},
            //{ data: 'Remarks' },
            { data: 'Check' , orderable: false},
            //{ data: 'Id'}
            
            ],
            //rowId: Id,
            //   rowCallback: ( row, data ) => {
            //         console.log(row, data);
            //   },
            language: {
                paginate: {
                    previous: '<i class="cs-chevron-left"></i>',
                    next: '<i class="cs-chevron-right"></i>',
                },
            },
            initComplete: function (settings, json) {
                _this._setInlineHeight();
            },
            drawCallback: function (settings) {
                _this._setInlineHeight();
            },
            columnDefs: [
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        var dt = new Date(data);
                        return dt.toLocaleDateString()
                    },
                },

                // ControlNumber
                {
                    targets: 1,
                    render: function (data, type, row, meta) {
                         return `<a class="list-item-heading body" href="#"> ${data} </a>`;
                    },
                },               
                // Soldto
                {
                    targets: 2,
                    render: function (data, type, row, meta) {
                       return `${row.SoldToDistributorName}<br/>(${data})`;
                    },
                },                 
                // Adding Name content as an anchor with a target #
                {
                    targets: 3,
                    render: function (data, type, row, meta) {
                        const a = row.SalesOrderDetails
                        let items = '';
                        let total = 0;
                        let i = 0;
                        a.forEach( el => {
                            if (i<2) {
                                items += `${el.Item1.ItemName}<br/>${el.Item1.ItemCode}  x${el.Quantity}<br/>`;
                            }
                            if (i==2)
                                items += "..."
                            i++;
                            total += Number(el.Quantity) * Number(el.RecordedPrice)
                        })
                        if (i>2)
                            row.TotalAmount = `${total} (${i})`;
                        else 
                            row.TotalAmount = total;
                        return `<a class="list-item-heading body" href="#"> ${items} </a>`;
                        // return `<a class="list-item-heading body" href="#"> data </a>`;
                    },
                },
                
                // Username/branch
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                       return `${data}<br/>(${row.Outlet})`;
                    },
                },    
        
                // Adding Tag content as a span with a badge class
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
                        if (data==='Completed')
                            return '<span class="badge bg-outline-success">' + data + '</span>';
                        if (data==='Failed')
                            return '<span class="badge bg-outline-danger">' + data + '</span>';
                        return '<span class="badge bg-outline-primary">' + data + '</span>';
                    },
                },

                // Adding checkbox for Check column
                {
                    targets: 7,
                    render: function (data, type, row, meta) {
                        return '<div class="form-check float-end mt-1"><input type="checkbox" class="form-check-input"></div>';
                    },
                },
                // {
                //     targets: [11],
                //     visible: false
                // },
            ],

        });

        _this = this;
    }

    _addListeners() {
        // Listener for confirm button on the edit/add modal
        //document.getElementById('addEditConfirmButton').addEventListener('click', this._addEditFromModalClick.bind(this));

        // Listener for add buttons
        document.querySelectorAll('.add-datatable').forEach((el) => el.addEventListener('click', this._onAddRowClick.bind(this)));

        // Listener for delete buttons
        document.querySelectorAll('.delete-datatable').forEach((el) => el.addEventListener('click', this._onDeleteClick.bind(this)));

        // Listener for edit button
        document.querySelectorAll('.edit-datatable').forEach((el) => el.addEventListener('click', this._onEditButtonClick.bind(this)));

        // Calling a function to update tags on click
        document.querySelectorAll('.tag-done').forEach((el) => el.addEventListener('click', () => this._updateTag('Done')));
        document.querySelectorAll('.tag-new').forEach((el) => el.addEventListener('click', () => this._updateTag('New')));
        document.querySelectorAll('.tag-sale').forEach((el) => el.addEventListener('click', () => this._updateTag('Sale')));

        // Calling clear form when modal is closed
        document.getElementById('viewModal').addEventListener('hidden.bs.modal', this._clearModalForm);

        jQuery.validator.addMethod("lessThanOrEqual", function (value, element, params) {
            if ($(params[0]).val() != '') {
                if (!/Invalid|NaN/.test(new Date(value))) {
                    return new Date(value) <= new Date($(params[0]).val());
                }
                return isNaN(value) && isNaN($(params[0]).val()) || (Number(value) <= Number($(params[0]).val()));
            };
            return true;
        }, 'Must be less than or equal {1}.');

        const form = document.getElementById("modalForm");
        const validateOptions = {
            rules: {
                ItemCode: "required",
                 ItemName: "required",
                price: {
                    required: true,
                    number:true,
                    min: 10
                },
                discountedPrice: {
                    required: true,
                    number:true,
                    min: 10,
                    lessThanOrEqual: ["input[name=price]","Price"]
                },
                ItemCategory: "required"
            },
            messages: {
                discountedPrice: {
                    lessThanOrEqual: "Discounted price should be less than or equal the value input in Price.",
                },
            },
        };
        jQuery(form).validate(validateOptions);
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('submit clicked');
                if (jQuery(form).valid()) {
                    if (this._currentState === 'add') {
                        this._addNewRowFromModal();
                    } else {
                        this._editRowFromModal();
                    }
                    this._addEditModal.hide();
                }
            });
        
        }
    }

    // Extending with DatatableExtend to get search, select and export working
    _extend() {
        this._datatableExtend = new DatatableExtend({
            datatable: this._datatable,
            editRowCallback: this._onEditRowClick.bind(this),
            singleSelectCallback: this._onSingleSelect.bind(this),
            multipleSelectCallback: this._onMultipleSelect.bind(this),
            anySelectCallback: this._onAnySelect.bind(this),
            noneSelectCallback: this._onNoneSelect.bind(this),
        });
    }

    // Keeping a reference to add/edit modal
    _initBootstrapModal() {
        this._addEditModal = new bootstrap.Modal(document.getElementById('viewModal'));
    }

    // Setting static height to datatable to prevent pagination movement when list is not full
    _setInlineHeight() {
        if (!this._datatable) {
            return;
        }
        const pageLength = this._datatable.page.len();
        document.querySelector('.dataTables_scrollBody').style.height = this._staticHeight * pageLength + 'px';
    }
        // Showing spinner for server side operations
    _addSpinner() {
        document.body.classList.add('spinner');
    }

    // Removing spinner after completing server side operations
    _removeSpinner() {
        document.body.classList.remove('spinner');
    }


    // Add or edit button inside the modal click
    _addEditFromModalClick(event) {
        if (this._currentState === 'add') {
            this._addNewRowFromModal();
        } else {
            this._editRowFromModal();
        }
        this._addEditModal.hide();
    }

    // Top side edit icon click
    _onEditButtonClick(event) {
        if (event.currentTarget.classList.contains('disabled')) {
            return;
        }
        const selected = this._datatableExtend.getSelectedRows();
        this._onEditRowClick(this._datatable.row(selected[0][0]));
     }

    // Direct click from row title
    _onEditRowClick(rowToEdit) {
        this._rowToEdit = rowToEdit; // Passed from DatatableExtend via callback from settings
        // localStorage.setItem("view_sales_details",rowToEdit.data().SalesOrder);
        // window.location="pages.dataadmin.salesorder.html"
        // this._showModal('edit', 'Edit', 'Update');
        // this._setForm();
        let callbackFlag = false;
        const modal = new SalesOrderEditor()
        modal.showEditor( document.getElementById('editorModal'), rowToEdit.data(), 'Edit', 
            (d) => {
                if (!callbackFlag) {
                    callbackFlag = true;
                    _this = this;

                    this._addSpinner()
                    const salesApi = new SalesApi()
                    //const data = JSON.parse(d)
                    const user = new User()
                    d.username = user.profile.username
                    salesApi.Submit_Update_Sales_Order(d,
                    
                    (d) => {
                        this._datatable.draw()
                        this._removeSpinner()
                    },
                    (err) => {
                        console.log(err)
                        this._removeSpinner()
                    })
                }
                //console.log(d)
            },
            (err) => {
                _this = this;
            })

    }

    // Edit button inside th modal click
    _editRowFromModal() {
        // const data = this._rowToEdit.data();
        // const formData = Object.assign(data, this._getFormData());
        // this._updateRowData(formData)
        // this._datatable.row(this._rowToEdit).data(formData).draw();
        // this._datatableExtend.unCheckAllRows();
        // this._datatableExtend.controlCheckAll();
    }

    // Add button inside th modal click
    _addNewRowFromModal() {
        let callbackFlag = false;
        const modal = new SalesOrderEditor()
        modal.showEditor(document.getElementById('editorModal'), null, 'Add',
            (d) => {
                if (!callbackFlag) {
                    callbackFlag = true;
                    _this = this;

                    this._addSpinner()
                    const salesApi = new SalesApi()
                    //const data = JSON.parse(d)
                    const user = new User()
                    d.username = user.profile.username
                    salesApi.Submit_Add_Sales_Order(d,
                        (d) => {
                            this._datatable.draw()
                            this._removeSpinner()
                        },
                        (err) => {
                            console.log(err)
                            this._removeSpinner()
                        })
                    //console.log(d)
                }
            },
            (err) => {
                _this = this;
            })
    }

    // Delete icon click
    _onDeleteClick() {
        let callbackFlag = false;
        const selected = this._datatableExtend.getSelectedRows().data()[0]
        const modal = new SalesOrderEditor()
        modal.showEditor(document.getElementById('editorModal'), selected, 'Delete',
            (d) => {
                if (!callbackFlag) {
                    callbackFlag = true;
                    _this = this;

                    this._addSpinner()
                    const salesApi = new SalesApi()
                    salesApi.Submit_Delete_Sales_Order(d,
                        (d) => {
                            this._datatable.draw()
                            this._removeSpinner()
                        },
                        (err) => {
                            console.log(err)
                            this._removeSpinner()
                        })
                    //console.log(d)
                }
            },
            (err) => {
                _this = this;
            })
    }

    // + Add New or just + button from top side click
    _onAddRowClick() {
        this._showModal('add', 'Add New', 'Add');
    }

    // Showing modal for an objective, add or edit
    _showModal(objective, title, button) {
        this._addEditModal.show();
        this._currentState = objective;
        document.getElementById('modalTitle').innerHTML = title;
        //document.getElementById('addEditConfirmButton').innerHTML = button;
    }

    // Filling the modal form data
    _setForm() {
        const data = this._rowToEdit.data();
        document.querySelector('#viewModal input[name=ControlNumber]').value = data.ControlNumber;
        document.querySelector('#viewModal input[name=DateSold]').value = data.DateSold;
        document.querySelector('#viewModal input[name=Branch]').value = 'data.branch';
        document.querySelector('#viewModal input[name=SoldToDistributorNumber]').value = data.SoldToDistributorNumber;
        document.querySelector('#viewModal input[name=SoldToDistributorName]').value = data.SoldToDistributorName;

        // if (document.querySelector('#viewModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]')) {
        //     document.querySelector('#viewModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]').checked = true;
        // }
        // if (document.querySelector('#viewModal ' + 'input[name=Tag][value="' + data.Tag + '"]')) {
        //     document.querySelector('#viewModal ' + 'input[name=Tag][value="' + data.Tag + '"]').checked = true;
        // }
    }

    // Getting form values from the fields to pass to datatable
    _getFormData() {
        const data = {};
        data.ItemName = document.querySelector('#viewModal input[name=ItemName]').value.trim();
        data.ItemCode = document.querySelector('#viewModal input[name=ItemCode]').value.trim();
        data.price = document.querySelector('#viewModal input[name=price]').value.trim();
        data.discountedPrice = document.querySelector('#viewModal input[name=discountedPrice]').value.trim();
        data.ItemCategory = document.querySelector('#viewModal  input[name=ItemCategory]:checked')
            ? document.querySelector('#viewModal input[name=ItemCategory]:checked').value || ''
            : '';
        data.CategoryCode = document.querySelector('#viewModal  input[name=ItemCategory]:checked').labels[0].textContent;
        
        data.Tag = document.querySelector('#viewModal input[name=Tag]:checked')
            ? document.querySelector('#viewModal input[name=Tag]:checked').value || ''
            : '';
        data.Check = '';
        const user = new User()
        data.username = user.profile.username;
        return data;
    }

    // Clearing modal form
    _clearModalForm() {
        document.querySelector('#viewModal form').reset();
    }

    _setModalAlert(msg, mode, off, eparam) {
        const _this = this;
        if (mode ? false : true) {
            mode = "alert-secondary";
        }
        if (off ? false : true) {
            const e = document.querySelector('#addEditModalAlert');
            e.classList.add(mode);
            e.innerHTML = msg;
            e.classList.remove("d-none");
            setTimeout(() => {
                _this._setModalAlert(msg, mode, true, e)
            }, 30000);
        }
        else {
            if (eparam ? true : false) {
                eparam.classList.remove(mode);
                eparam.classList.add("d-none");
            }
        }
    }

    _setModalAlertXhrWarn(xhr, doing) {
        let msg = "While " + doing + ", error(s) occured.";
        if (xhr.responseText ? true : false)
            msg += "<br/><br/>" + JSON.parse(xhr.responseText).Message;
        this._setModalAlert(msg, "alert-danger");
    }

    _setPageAlert(msg, mode, off, eparam) {
        const _this = this;
        if (mode ? false : true) {
            mode = "alert-secondary";
        }
        if (off ? false : true) {
            const e = document.querySelector('#cardAlert');
            e.classList.add(mode);
            e.innerHTML = msg;
            e.classList.remove("d-none");
            setTimeout(() => {
                _this._setPageAlert(msg, mode, true, e)
            }, 60000);
        }
        else {
            if (eparam ? true : false) {
                eparam.classList.remove(mode);
                eparam.classList.add("d-none");
            }
        }
    }

    _setPageAlertXhrWarn(xhr, doing) {
        let msg = "While " + doing + ", error(s) occured.";
        if (xhr.responseText ? true : false)
            msg += "<br/><br/>" + JSON.parse(xhr.responseText).Message;
        this._setPageAlert(msg, "alert-danger");
    }


    _handleXhrError(xhr, on) {
        console.log(xhr);
        let msg = '';
        if (on !== null && on !== undefined)
            msg += `While ${on}, an error occurred.<br/><br/> `;
        //let msg = 'WARNING: API backend is unreachable';

        if (xhr.responseText ? true : false)
            msg += JSON.parse(xhr.responseText).Message;
        else {
            const msg = new Messages()
            msg += msg.AuthenticationFatalError;
        }
        let toast = new Toasts();
        toast.Toast(msg, "bg-danger");
    }

        // Update tag from top side dropdown
    _updateTag(tag) {
        const selected = this._datatableExtend.getSelectedRows();
        const _this = this;
        selected.every(function (rowIdx, tableLoop, rowLoop) {
            const data = this.data();
            data.Tag = tag;
            _this._datatable.row(this).data(data).draw();
        });
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();
    }

    // Single item select callback from DatatableExtend
    _onSingleSelect() {
        document.querySelectorAll('.edit-datatable').forEach((el) => el.classList.remove('disabled'));
    }

    // Multiple item select callback from DatatableExtend
    _onMultipleSelect() {
        document.querySelectorAll('.edit-datatable').forEach((el) => el.classList.add('disabled'));
    }

    // One or more item select callback from DatatableExtend
    _onAnySelect() {
        document.querySelectorAll('.delete-datatable').forEach((el) => el.classList.remove('disabled'));
        document.querySelectorAll('.tag-datatable').forEach((el) => el.classList.remove('disabled'));
    }

    // Deselect callback from DatatableExtend
    _onNoneSelect() {
        document.querySelectorAll('.delete-datatable').forEach((el) => el.classList.add('disabled'));
        document.querySelectorAll('.tag-datatable').forEach((el) => el.classList.add('disabled'));
    }

    _fetchData() {
    }

    _updateRowData(data) {
        // this._itemsApi.Submit_UpdateItem(
        //     data,
        //     (datarow) => {
        //         const d = JSON.parse(datarow);
        //         this._datatable.row(this._rowToEdit).data(this._toTableRow(d)).draw();
        //         this._datatableExtend.unCheckAllRows();
        //         this._datatableExtend.controlCheckAll();

        //         this._toast.Toast(this._messages.Common_RecordUpdated);
        //     },
        //     (x) => {
        //         console.log(`xhr error: ${x}`);
        //     }
        // );
    }

    _addRowData(data) {
        // this._itemsApi.Submit_AddItem(
        //     data,
        //     (datarow) => {
        //         const d = JSON.parse(datarow);
        //         this._datatable.row.add(this._toTableRow(d)).draw();
        //         this._datatableExtend.unCheckAllRows();
        //         this._datatableExtend.controlCheckAll();
        //         this._toast.Toast(this._messages.Common_RecordAdded);
        //     },
        //     (x) => {
        //         console.log(`xhr error: ${x}`);
        //     }
        // );
    }

    _deleteRowData(data, successBlock, failBlock) {
        this._salesApi.Submit_DeleteSalesOrderDetail(
            data,
            successBlock,
            failBlock
        );
    }


    _toTableRow(d) {
        return {
            ItemCode: d.ItemCode,
            ItemName: d.ItemName,
            price: d.price,
            discountedPrice: d.discountedPrice,
            CategoryCode: d.CategoryCode,
            Tag: "",
            Id: d.Id,
            ItemCategory: d.ItemCategory,
            Check: "",
        }
    }
}

const main = function() {

    modulepool.preload([
        './user.js',
        './helpers/messages.js',
        './helpers/toasts.js',
        './user.DomInject.js',
        './api/items.api.js',
        './api/outlets.api.js',
        './api/direct.api.js',
        './api/sales.api.js',
        './modules/sales.order.editor.js'
    ], (modules) => {
        console.log(modules)
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
                case 'ItemsApi':
                    ItemsApi = elem;
                    break;
                case 'OutletsApi':
                    OutletsApi = elem;
                    break;
                case 'DirectApi':
                    DirectApi = elem;
                    break;
                case 'SalesApi':
                    SalesApi = elem;
                    break;
                case 'SalesOrderEditor':
                    SalesOrderEditor = elem;
            }
        })

        const r = new RowsAjax()
        r.init()
    })
}();