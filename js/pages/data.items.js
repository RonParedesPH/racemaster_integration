/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */

// var User;
// var Messages;
// var Toasts;
// var ItemsApi;

// var geta;

 var _this = null;

class RowsAjax {
    constructor() {
                    if (!jQuery().DataTable) {
                console.log('DataTable is null!');
                return;
            }

            // Selected single row which will be edited
            this._rowToEdit;
            this._rowToDelete;

            // Datatable instance
            this._datatable;

            // Edit or add state of the modal
            this._currentState;

            // Controls and select helper
            this._datatableExtend;

            // Add or edit modal
            this._addEditModal;

            // Datatable single item height
            this._staticHeight = 62;

            this._user;
            this._messages;
            this._toastFactory;
            this._itemsApi;
    }


    init(User, Messages, Toasts, ItemsApi) {
        // instantiate
        this._user = new User()
        this._messages = new Messages()
        this._itemsApi = new ItemsApi()
        // get handle to factory
        this._toastFactory = Toasts;


            //this._initObjectsAndVariables();
            this._createInstance();
            this._addListeners();
            this._extend();
            this._initBootstrapModal();

            this._fetchData()
            _this = this;
   }

    // _initObjectsAndVariables() {
    //     import('../helpers/messages.js')
    //         .then((module) => {
    //             console.log('messages import at dataadmin.item - OK');
    //             this._messages = new module.default();
    //         })
    //         .catch((err) => {
    //             console.log(`messages import at dataadmin.item - ${err.message}`);
    //         });
    //     import('../components/toasts.js')
    //         .then((module) => {
    //             console.log('toasts import at dataadmin.item - OK');
    //             this._toast = new module.default();
    //         })
    //         .catch((err) => {
    //             console.log(`toasts import at dataadmin.item - ${err.message}`);
    //         });

    //     import('../api/items.api.js')
    //         .then((module) => {
    //             console.log('itemsApi import at dataadmin.item - OK');
    //             this._itemsApi = new module.default();

    //             this._fetchData();
    //         })
    //         .catch((err) => {
    //             console.log(`itemsApi import at dataadmin.item - ${err.message}`);
    //         });
    // }

    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance() {
        const _this = this;
        this._datatable = jQuery('#datatableRowsAjax').DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            ajax: {
                "url": "http://stockroom.verityclouds.com/api/Items",
                "dataSrc": function (json) {
                    let a = [];
                    json.forEach(d => {
                        a.push({
                            ItemCode: d.ItemCode,
                            ItemName: d.ItemName,
                            Price: d.Price,
                            DiscountedPrice: d.DiscountedPrice,
                            CategoryName: d.ItemCategory1.CategoryName,
                            Tag: "",
                            Id: d.Id,
                            ItemCategory: d.ItemCategory,
                            Check: "",
                            dtcreated: d.dtcreated,
                            dtlastmodified: d.dtlastmodified,
                            username: d.username,
                            status: d.status
                        })
                    });
                    //console.log(`Received json as : ${json}`);
                    return a;
                },
                "type": "GET"
            },
            order: [], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            //   columns: [{data: ''}, {data: 'Sales'}, {data: 'Stock'}, {data: 'Category'}, {data: 'Tag'}, {data: 'Check'}],
            columns: [{
                data: 'ItemCode'
            },
            { data: 'ItemName' },
            { data: 'Price' },
            { data: 'DiscountedPrice' },
            { data: 'CategoryName' },
            { data: 'username' },

            { data: 'Tag' },
            { data: 'Check' },
            ],
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
                // Adding Name content as an anchor with a target #
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        return '<a class="list-item-heading body" href="#">' + data + '</a>';
                    },
                },
                // Adding Tag content as a span with a badge class
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
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

            ],
        });
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
        // Extending with DatatableExtend to get search, select and export working
    }
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
        this._addEditModal = new bootstrap.Modal(document.getElementById('addEditModal'));


        // Calling clear form when modal is closed
        document.getElementById('addEditModal').addEventListener('hidden.bs.modal', this._clearModalForm);

        jQuery.validator.addMethod("lessThanOrEqual", function (value, element, params) {
            if ($(params[0]).val() != '') {
                if (isNaN(value)) {
                    return new Date(value) <= new Date($(params[0]).val());
                }
                return (Number(value) <= Number($(params[0]).val()));
            };
            return true;
        }, 'Must be less than or equal {1}.');

        const form = document.getElementById("modalForm");
        const validateOptions = {
            rules: {
                ItemCode: "required",
                ItemName: "required",
                Price: {
                    required: true,
                    number: true,
                    min: 10
                },
                DiscountedPrice: {
                    required: true,
                    number: true,
                    min: 10,
                    lessThanOrEqual: ["input[name=Price]", "Price"]
                },
                ItemCategory: "required"
            },
            messages: {
                DiscountedPrice: {
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
                }
            });

        }
    }




    // Setting static height to datatable to prevent pagination movement when list is not full
    _setInlineHeight() {
        if (!this._datatable) {
            return;
        }
        const pageLength = this._datatable.page.len();
        document.querySelector('.dataTables_scrollBody').style.height = this._staticHeight * pageLength + 'px';
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
        this._showModal('edit', 'Edit', 'Update');
        this._setForm();
    }



    // Edit button inside th modal click
    _editRowFromModal() {
        let data = this._rowToEdit.data();
        data = Object.assign(data, this._getFormData());
        this._updateRowData(data, (datarow) => {
            const d = JSON.parse(datarow);
            this._datatable.row(this._rowToEdit).data(this._toTableRow(d)).draw();
            this._datatableExtend.unCheckAllRows();
            this._datatableExtend.controlCheckAll();

            //const messages = new Messages()
            const toast = new this._toastFactory()
            //this._toast.Toast(this._messages.Common_RecordUpdated);
            toast.Toast(this._messages.Common_RecordUpdated);

            this._addEditModal.hide(); // eventually clear
        }, (xhr) => {
            this._setModalAlertXhrWarn(xhr, "saving changes");
            //this._handleXhrError(xhr, "saving edit");
        });

    }


    // Add button inside th modal click
    _addNewRowFromModal() {
        const data = this._getFormData();
        this._addRowData(data, (datarow) => {
            const d = JSON.parse(datarow);
            this._datatable.row.add(this._toTableRow(d)).draw();
            this._datatableExtend.unCheckAllRows();
            this._datatableExtend.controlCheckAll();
            //this._toast.Toast(this._messages.Common_RecordAdded);

            this._setModalAlert("Record was added.");
            this._setPageAlert("Record was added.");
            this._clearModalFormPartial();
        }, (xhr) => {
            this._setModalAlertXhrWarn(xhr, "saving new record");
            //this._handleXhrError(xhr, "adding row");
        });

    }

    // Delete icon click
    _onDeleteClick() {
        const selected = this._datatableExtend.getSelectedRows();
        //const messages = new Messages()
        const toast = new this._toastFactory()


        if (selected.count() == 1) {
            this._rowToDelete = selected.data()[0];

            const data = selected.data()[0];
            //const user = new User()
            data.username = this._user.profile.username;

            toast.Toast(this._messages.Common_AreYouSureToDeleteSelected, "bg-primary", true, () => {

                if (this._rowToDelete == data) {
                    this._deleteRowData(
                        data,
                        (data) => {
                            const selected = this._datatableExtend.getSelectedRows();
                            if (selected.count() == 1 &&
                                selected.data()[0].Id == JSON.parse(data)) {
                                selected.remove().draw();
                                this._datatableExtend.unCheckAllRows();
                                //this._datatableExtend.controlCheckAll();
                                this._rowToDelete = null;
                                this._setPageAlert(this._messages.Item_Deleted_info, "alert-warning");
                            }
                        },
                        (xhr) => {
                            this._setPageAlertXhrWarn(xhr, "deleting row");
                            this._handleXhrError(xhr, "deleting row");

                        });
                }
            });
        }
        else {
            toast.Toast(this._messages.Common_DeleteOnlyWithOneSelected)
        }
        // selected.remove().draw();
        // this._datatableExtend.controlCheckAll();
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
        document.getElementById('addEditConfirmButton').innerHTML = button;
    }

    // Filling the modal form data
    _setForm() {
        const data = this._rowToEdit.data();
        document.querySelector('#addEditModal input[name=ItemName]').value = data.ItemName;
        document.querySelector('#addEditModal input[name=ItemCode]').value = data.ItemCode;
        document.querySelector('#addEditModal input[name=Price]').value = data.Price;
        document.querySelector('#addEditModal input[name=DiscountedPrice]').value = data.DiscountedPrice;
        if (document.querySelector('#addEditModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]')) {
            document.querySelector('#addEditModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]').checked = true;
        }
        if (document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]')) {
            document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]').checked = true;
        }
    }

    // Getting form values from the fields to pass to datatable
    _getFormData() {
        const data = {};
        data.ItemName = document.querySelector('#addEditModal input[name=ItemName]').value.trim();
        data.ItemCode = document.querySelector('#addEditModal input[name=ItemCode]').value.trim();
        data.Price = document.querySelector('#addEditModal input[name=Price]').value.trim();
        data.DiscountedPrice = document.querySelector('#addEditModal input[name=DiscountedPrice]').value.trim();
        data.ItemCategory = document.querySelector('#addEditModal  input[name=ItemCategory]:checked')
            ? document.querySelector('#addEditModal input[name=ItemCategory]:checked').value || ''
            : '';
        data.CategoryName = document.querySelector('#addEditModal  input[name=ItemCategory]:checked').labels[0].textContent;

        // data.Tag = document.querySelector('#addEditModal input[name=Tag]:checked')
        //     ? document.querySelector('#addEditModal input[name=Tag]:checked').value || ''
        //     : '';
        // data.Check = '';
        //const user = new User()
        data.username = this._user.profile.username;
        return data;
    }

    // Clearing modal form
    _clearModalForm() {
        document.querySelector('#addEditModal form').reset();
    }

    _clearModalFormPartial() {
        //_clearModalForm();
        document.querySelector('#addEditModal input[name=ItemName]').value = '';
        document.querySelector('#addEditModal input[name=ItemCode]').value = '';
        document.querySelector('#addEditModal input[name=Price]').value = '';
        document.querySelector('#addEditModal input[name=DiscountedPrice]').value = '';
        // if (document.querySelector('#addEditModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]')) {
        //     document.querySelector('#addEditModal ' + 'input[name=ItemCategory][value="' + data.ItemCategory + '"]').checked = true;
        // }
        // if (document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]')) {
        //     document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]').checked = true;
        // }

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
        //const messages = new Messages()
        const toast = new this._toastFactory()


        if (xhr.responseText ? true : false)
            msg += JSON.parse(xhr.responseText).Message;
        else
            msg += this._messages.AuthenticationFatalError;
        //let toast = new ComponentsToasts();
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
        document.querySelectorAll('.delete-datatable').forEach((el) => el.classList.remove('disabled'));
    }

    // Multiple item select callback from DatatableExtend
    _onMultipleSelect() {
        document.querySelectorAll('.edit-datatable').forEach((el) => el.classList.add('disabled'));
        document.querySelectorAll('.delete-datatable').forEach((el) => el.classList.add('disabled'));
    }

    // One or more item select callback from DatatableExtend
    _onAnySelect() {
        document.querySelectorAll('.tag-datatable').forEach((el) => el.classList.remove('disabled'));
    }

    // Deselect callback from DatatableExtend
    _onNoneSelect() {
        document.querySelectorAll('.edit-datatable').forEach((el) => el.classList.add('disabled'));
        document.querySelectorAll('.delete-datatable').forEach((el) => el.classList.add('disabled'));
        document.querySelectorAll('.tag-datatable').forEach((el) => el.classList.add('disabled'));
    }

    _fetchData() {
        this._itemsApi.Request_Categories(
            (d) => {
                const a = JSON.parse(d)
                let inner = '<label class="form-label">Category</label>';
                if (a.length) {

                    a.forEach(it => {
                        inner += `<div class="form-check">
                                <input type="radio" id="${it.CategoryCode}" name="ItemCategory" value="${it.Id}" class="form-check-input" />
                                <label class="form-check-label" for="${it.CategoryCode}">${it.CategoryCode}</label>
                            </div>`;
                    });
                    //console.log(inner);
                    const radio = document.querySelector('#radioCategory');
                    if (radio ? 1 : 0)
                        radio.innerHTML = inner;
                }
            },
            (xhr) => {
                this._handleXhrError(xhr, "fetching items");
            }
        );

    }

    _updateRowData(data, successBlock, failBlock) {
        this._itemsApi.Submit_UpdateItem(
            data,
            successBlock,
            failBlock
        );
    }

    _addRowData(data, successBlock, failBlock) {
        this._itemsApi.Submit_AddItem(
            data,
            successBlock,
            failBlock
        );
    }

    _deleteRowData(data, successBlock, failBlock) {
        this._itemsApi.Submit_DeleteItem(
            data,
            successBlock,
            failBlock
        );
    }


    _toTableRow(d) {
        return {
            ItemCode: d.ItemCode,
            ItemName: d.ItemName,
            Price: d.Price,
            DiscountedPrice: d.DiscountedPrice,
            CategoryName: d.ItemCategory1.CategoryName,
            Tag: "",
            Id: d.Id,
            ItemCategory: d.ItemCategory,
            Check: "",
            dtcreated: d.dtcreated,
            dtlastmodified: d.dtlastmodified,
            username: d.username,
            status: d.status
        }
    }
}

// const main = function() {

modulepool.depends([
    './user.js',
    './helpers/messages.js',
    './helpers/toasts.js',
        './api/items.api.js',
    './user.DomInject.js',
], (user, messages, toasts, itemsApi) => {
    // User = user
    // Messages = messages
    // Toasts = toasts
    // ItemsApi = itemsApi

    const r = new RowsAjax()
    r.init(user, messages, toasts, itemsApi)
})
// }();