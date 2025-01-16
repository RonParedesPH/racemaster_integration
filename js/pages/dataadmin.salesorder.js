/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */

 var _this = null;
class HeaderButtonState {
    constructor() {
        this._editButton = null
        this._deleteButton = null
        this._saveButton = null
        this._cancelButton = null

        this._buttonsExist = false;
        this._isEditing = false;
    }

    ButtonSet(elEdit, elDelete, elSave, elCancel) {
        this._editButton = elEdit
        this._deleteButton = elDelete
        this._saveButton = elSave
        this._cancelButton = elCancel

        this._saveButton.classList.add('d-none')
        this._cancelButton.classList.add('d-none')

        this._buttonsExist = true;
    }

    Editing() {
        if (this._buttonsExist) {
            this._saveButton.classList.remove('d-none')
            this._cancelButton.classList.remove('d-none')
            this._editButton.classList.remove('d-none')

            this._deleteButton.classList.add('d-none')
            this._isEditing = true;
        }
    }

    CancelEdit() {
        if (this._buttonsExist) {
            this._saveButton.classList.add('d-none')
            this._cancelButton.classList.add('d-none')

            this._editButton.classList.remove('d-none')
            this._deleteButton.classList.remove('d-none')
            this._isEditing = true;
        }
    }

    SetEventListener(button, actionBlock) {
        if (button == "edit")   this._editButton.addEventListener('click', actionBlock)
        if (button == "delete")   this._deleteButton.addEventListener('click', actionBlock)
        if (button == "save")   this._saveButton.addEventListener('click', actionBlock)
        if (button == "cancel")   this._cancelButton.addEventListener('click', actionBlock)
    }

    IsInEditMode() {
        return this._isEditing;
    }

    DisableAll() {
                    this._saveButton.classList.add('disabled')
            this._cancelButton.classList.add('disabled')

            this._editButton.classList.add('disabled')
            this._deleteButton.classList.add('disabled')
    }
}

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
        this._editViewModal

        // Datatable single item height
        this._staticHeight = 62;

        this._itemsApi = null;
        this._outletsApi = null;
        this._directApi = null;
        this._toast = null;
        this._messages = null;

        this._itemsLookup = [];
        this._outletsLookup = [];
        
        this._buttonHeaders = null;

		_this = this;
        this._imports();


        this._salesId = localStorage.getItem("view_sales_details");
        this._salesOrder = null;
        this._createInstance();
        this._addListeners();
        this._extend();
        this._initBootstrapModal();

        this._apiWaiting = false;
        this._loadInitialData();
    }

    _imports() {
        import('../helpers/messages.js')
            .then((module) => {
                console.log('messages import at dataentry.orders - OK');
                this._messages = new module.default();
            })
            .catch((err) => {
                console.log(`messages import at dataentry.orders - ${err.message}`);
            });
        import('../components/toasts.js')
            .then((module) => {
                console.log('toasts import at dataentry.orders - OK');
                this._toast = new module.default();
            })
            .catch((err) => {
                console.log(`toasts import at dataentry.orders - ${err.message}`);
            });

        import('../api/items.api.js')
            .then((module) => {
                console.log('itemsApi import at dataentry.orders - OK');
                this._itemsApi = new module.default();

                import('../api/outlets.api.js')
                    .then((module) => {
                        console.log('outletsApi import at dataentry.orders - OK');
                        this._outletsApi = new module.default();

                        this._fetchLookups();
                    })
                    .catch((err) => {
                        console.log(`outletsApi import at dataentry.orders - ${err.message}`);
                    });
            })
            .catch((err) => {
                console.log(`itemsApi import at dataentry.orders - ${err.message}`);
            });
        import('../api/direct.api.js')
            .then((module) => {
                console.log('directApi import at dataentry.orders - OK');
                this._directApi = new module.default();

            })
            .catch((err) => {
                console.log(`directApi import at dataentry.orders - ${err.message}`);
            });
        import('../api/sales.api.js')
            .then((module) => {
                console.log('salesApi import at dataentry.orders - OK');
                this._salesApi = new module.default();

                if (_this._apiWaiting)
                    _this._loadInitialData();

            })
            .catch((err) => {
                console.log(`salesApi import at dataentry.orders - ${err.message}`);
            });    
            
    }
            
    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance() {
        _this._buttonHeaders = new HeaderButtonState();
        _this._buttonHeaders.ButtonSet(
            document.querySelectorAll('.edit-header')[0],
            document.querySelectorAll('.delete-header')[0],
            document.querySelectorAll('.save-header')[0],
            document.querySelectorAll('.cancel-header')[0]
        )


        this._datatable = jQuery('#datatableRowsAjax').DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            // ajax: {
            //     "url": "http://stockroom.verityclouds.com/api/SalesOrders/" + this._salesId,
            //     "dataSrc": function (json) {
            //         let a = [];
            //         _this._salesOrder = json;
            //         _this._setHeaderForm();
            //         //_this._setForm(json)
            //         json.SalesOrderDetails.forEach(d => {
            //             a.push({
            //                 ItemCode: d.Item1.ItemCode,
            //                 ItemName: d.Item1.ItemName,
            //                 RecordedPrice: d.RecordedPrice,
            //                 Quantity: d.Quantity,
            //                 Amount: d.RecordedPrice * d.Quantity,
            //                 CategoryCode: d.Item1.ItemCategory1.CategoryCode,
            //                 Tag: "",
            //                 Check: "",

            //                 Id: d.Id,
            //                 ItemCategory: d.Item1.ItemCategory1.Id,
            //                 status: d.status,
            //                 dtcreated: d.dtcreated,
            //                 dtlastmodified: d.dtlastmodified,
            //                 SalesOrder1: d.SalesOrder1,
            //                 Item: d.Item
            //             })
            //         });
            //         //console.log(`Received json as : ${json}`);
            //         return a;
            //     },
            //     "type": "GET"
            // },
            order: [], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            //   columns: [{data: ''}, {data: 'Sales'}, {data: 'Stock'}, {data: 'Category'}, {data: 'Tag'}, {data: 'Check'}],
            columns: [
            { data: 'ItemCode'},
            { data: 'ItemName' },
             { data: 'Quantity' },
            { data: 'Amount' },
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
                // {
                //     targets: 0,
                //     render: function (data, type, row, meta) {
                //         var dt = new Date(data);
                //         return `${dt.toISOString().substr(0,10)} ${dt.toISOString().substr(11,5)}` ;
                //     },
                // },
                // Adding Name content as an anchor with a target #
                {
                    targets: [1],
                    render: function (data, type, row, meta) {
                        return `<a class="list-item-heading body" href="#">${data}</a><br/>
                        Category: ${row.CategoryCode}<br/>
                        Price: ${row.RecordedPrice}

                        `;
                    },
                },
                //Adding Tag content as a span with a badge class
                {
                    targets: 4,
                    // render: function (data, type, row, meta) {
                    //     return '';
                    // },
                    visible: false
                },
                // Adding checkbox for Check column
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                        return '<div class="form-check float-end mt-1"><input type="checkbox" class="form-check-input"></div>';
                    },
                },
                // {
                //     targets: [11,12,13],
                //     visible: false
                // },
            ],
        });

 
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

        // Listener for edit button
        this._buttonHeaders.SetEventListener('edit',this._onEditHeaderButtonClick.bind(this));
        this._buttonHeaders.SetEventListener('delete',this._onDeleteHeaderButtonClick.bind(this));        
        this._buttonHeaders.SetEventListener('save',this._onSaveHeaderButtonClick.bind(this));
        this._buttonHeaders.SetEventListener('cancel',this._onCancelHeaderButtonClick.bind(this));
}


	// Keeping a reference to add/edit modal
    _initBootstrapModal() {
        this._addEditModal = new bootstrap.Modal(document.getElementById('addEditModal'));
        this._editViewModal = new bootstrap.Modal(document.getElementById('editViewModal'));

         if (jQuery().datepicker) {
            jQuery('#dateSold2').datepicker({
                autoclose: true,
            });
            jQuery('#dateSold2').on('change', function () {
                jQuery(this).valid();
            });
        }
               // Calling clear form when modal is closed
        //document.getElementById('viewModal').addEventListener('hidden.bs.modal', this._clearModalForm);

        document.querySelector('#addEditModal [name="Quantity"]').onfocusout = (e)=>{
            const item = _this._findItem(document.querySelector('#addEditModal [name="ItemCode"]').value)
            if (item) {
                document.querySelector('#addEditModal [name="Amount"]').value = 
                document.querySelector('#addEditModal [name="Quantity"]').value *
                    item[0].DiscountedPrice;
            }
        };

        document.querySelector('#editViewModal [name="SoldToDistributorNumber"]').onchange = (e)=> {
            const val = document.querySelector('#editViewModal [name="SoldToDistributorNumber"]').value
            if (val.length==7)
            _this._findDirect( val, 
                (d)=>{ 
                    const data = JSON.parse(d);
                    document.querySelector('#editViewModal [name="SoldToDistributorName"]').value = `${data.name_last}, ${data.name_first}`;
                    _this._setPageAlert(`Lookup result: ${data.member_id} - ${data.name_last}, ${data.name_first}`);
                    },
            );
        };
        document.querySelector('#editViewModal [name="SoldToDistributorNumber"]').onkeydown = (e)=> {
            const el = document.querySelector( '#editViewModal [name="SoldToDistributorName"]' )
            el.value = '';
        };


        jQuery.validator.addMethod("greaterThanOrEqual", function (value, element, params) {
            if ($(params[0]).val() != '') {
                if (!/Invalid|NaN/.test(new Date(value))) {
                    return new Date(value) >= new Date($(params[0]).val());
                }
                return isNaN(value) && isNaN($(params[0]).val()) || (Number(value) >= Number($(params[0]).val()));
            };
            return true;
        }, 'Must be greater than or equal {1}.');
        jQuery.validator.addMethod("validItemCode", function (value, element, params) {
             return _this._findItem(value).length > 0;
        }, 'Must be a valid Item Code.');

        jQuery.validator.addMethod("validDateString", function (value, element, params) {
            let dt = new Date(value);
            return dt > new Date('01/01/2020');
        }, 'Must be a valid date {1}.');

        jQuery.validator.addMethod("validSoldToDistributorName", function (value, element, params) {
            return (value !== '');
        }, 'Must input a valid Distributor Number in the previous entry.');

        const validateOptions = {
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
                    //validSoldToDistributorNumber: ['#editViewModal input[name=SoldToDistributorNumber]',"Empower Distributor Number"]
                },
                SoldToDistributorName: {
                    required: true,
                    validSoldToDistributorName: ['#editViewModal input[name=SoldToDistributorName]',"Empower Distributor Name"]
                },
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
                SoldToDistributorName: {
                                    required: "Must input a valid Distributor Number above",
                }
            },
        };
        const form = document.getElementById("modalForm");

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

        const formView = document.getElementById("editForm");

        jQuery(formView).validate(validateOptions);
        if (formView) {
            formView.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('submit clicked');
                if (jQuery(formView).valid()) {
                    if (this._currentState === 'add') {
                        //this._addNewRowFromModal();
                    } else {
                        this._editViewFromModal();
                    }
                    this._editViewModal.hide();
                }
                this._buttonHeaders.Editing();
            });
        
        }    }
    

 

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

    _onEditHeaderButtonClick(event) {
        // if (event.currentTarget.classList.contains('disabled')) {
        //     return;
        // }
        const selected = this._datatableExtend.getSelectedRows();
        this._rowToEdit = this._datatable.row(0).data();
        
    //     this._onEditHeaderClick(this._datatable.row(0).data());
    // }

    // _onEditHeaderClick(rowToEdit) {
        // this._rowToEdit = rowToEdit; // Passed from DatatableExtend via callback from settings
        this._showViewModal('edit', 'Edit Details', 'Update');
        this._setViewForm(this._rowToEdit);
    }

    _onDeleteHeaderButtonClick(event) {
        this._toast.Toast(this._messages.Common_AreYouSureToDeleteSelected, "bg-primary", true, () => {
                this._salesOrder.username = _gxUser.profile.username;
                this._salesApi.Submit_Delete_Sales_Order(
                     this._salesOrder,
                    (data) => {
                        this._setPageAlert(this._messages.Item_Deleted_info, "alert-warning");
                        this._buttonHeaders.DisableAll();
                        this._loadInitialData();
                    },
                    (xhr) => {
                        this._setPageAlertXhrWarn(xhr, "deleting sales order");
                        this._handleXhrError(xhr, "deleting sales order");

                    });
            
        });
    }

    _onSaveHeaderButtonClick(event) {
                 this._salesOrder.username = _gxUser.profile.username;
                 this._salesOrder.SalesOrderDetails = [];
                 for(let i=0; i < this._datatable.rows().count(); i++)
                 {
                    this._salesOrder.SalesOrderDetails.push( this._datatable.row(i).data())
                 }
                 
                this._salesApi.Submit_Update_Sales_Order(
                     this._salesOrder,
                    (data) => {
                        this._setPageAlert("Sales Order updated", "alert-success");
                        this._buttonHeaders.CancelEdit();
                        this._loadInitialData();
                    },
                    (xhr) => {
                        this._setPageAlertXhrWarn(xhr, "updating sales order");
                        this._handleXhrError(xhr, "updating sales order");

                    });       
    }

    _onCancelHeaderButtonClick(event) {
        this._buttonHeaders.CancelEdit()
        this._loadInitialData()
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
        this._showModal('edit', 'Edit Details', 'Update');
        this._setForm();
    }

    // Edit button inside th modal click
    _editRowFromModal() {
        const data = this._rowToEdit.data();
        const formData = Object.assign(data, this._getFormData());
        //this._updateRowData(formData)
        this._datatable.row(this._rowToEdit).data(formData).draw();
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();

        this._setPageAlert("Item was updated.");
        this._buttonHeaders.Editing();
        //this._addEditModal.hide();
    }

    _editViewFromModal() {
        //const data = this._rowToEdit.data();
        this._salesOrder = Object.assign(this._salesOrder, this._getViewFormData());
        this._setHeaderForm();
        //this._updateRowData(formData)
        //this._datatable.row(this._rowToEdit).data(formData).draw();
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();

        this._setPageAlert("Item was updated.");
        //this._addEditModal.hide();
    }

    // Add button inside th modal click
    _addNewRowFromModal() {
        const data = this._getFormData();
        this._addRowData(data)

        // this._datatable.row.add(data).draw();
        // this._datatableExtend.unCheckAllRows();
        // this._datatableExtend.controlCheckAll();
    }

    // Delete icon click
    _onDeleteClick() {
        const selected = this._datatableExtend.getSelectedRows();
        if (selected.count() == 1) {
            this._toast.Toast(this._messages.Common_AreYouSureToDeleteSelected, "bg-primary", true, () => {
                selected.remove().draw();
                 //this._datatable.row.remove(selected.data()[0]).draw();
                 this._datatableExtend.unCheckAllRows();
                this._datatableExtend.controlCheckAll();          
                this._buttonHeaders.Editing();      
            });
        }
        else {
            this._toast.Toast(this._messages.Common_DeleteOnlyWithOneSelected)
        }
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

    _showViewModal(objective, title, button) {
        this._editViewModal.show();
        this._currentState = objective;
        document.getElementById('viewModalTitle').innerHTML = title;
        document.getElementById('editConfirmButton').innerHTML = button;
    }

    // Filling the modal form data
    _setForm() {
        const data = this._rowToEdit.data();
        document.querySelector('#addEditModal input[name=ItemCode]').value = data.ItemCode;
        document.querySelector('#addEditModal input[name=Quantity]').value = data.Quantity;
        document.querySelector('#addEditModal input[name=Amount]').value = data.Amount;
    }

    _setViewForm() {
        document.querySelector('#editViewModal input[name=DateSold]').value = this._salesOrder.DateSold.substr(0,10);
        document.querySelector('#editViewModal input[name=ControlNumber]').value = this._salesOrder.ControlNumber;
        document.querySelector('#editViewModal input[name=SoldToDistributorNumber]').value = this._salesOrder.SoldToDistributorNumber;
                document.querySelector('#editViewModal input[name=SoldToDistributorName').value = this._salesOrder.SoldToDistributorName;
        document.querySelector('#editViewModal input[name=Outlet]').value = this._salesOrder.Outlet;
    }

        _setHeaderForm() {
        document.querySelector('#viewForm input[name=DateSold]').value = this._salesOrder.DateSold.substr(0,10);
        document.querySelector('#viewForm input[name=ControlNumber]').value = this._salesOrder.ControlNumber;
        document.querySelector('#viewForm input[name=SoldToDistributorNumber]').value = this._salesOrder.SoldToDistributorNumber;
        document.querySelector('#viewForm input[name=SoldToDistributorName]').value = this._salesOrder.SoldToDistributorName;
        document.querySelector('#viewForm input[name=Outlet]').value = this._salesOrder.Outlet;
    }

    // Getting form values from the fields to pass to datatable
    _getFormData() {
        const data = {
            //DateSold: document.querySelector('#addEditModal [name="DateSold"]').value,
            //ControlNumber: document.querySelector('#addEditModal [name="ControlNumber"]').value,
            //SoldToDistributorNumber: document.querySelector('#addEditModal [name="SoldToDistributorNumber"]').value,
            ItemCode: document.querySelector('#addEditModal [name="ItemCode"]').value,
            Quantity: document.querySelector('#addEditModal [name="Quantity"]').value,
            Amount: document.querySelector('#addEditModal [name="Amount"]').value,
        };
        return data;
    }

    _getViewFormData() {
        const data = {
            DateSold: document.querySelector('#editViewModal [name="DateSold"]').value,
            ControlNumber: document.querySelector('#editViewModal [name="ControlNumber"]').value,
            SoldToDistributorNumber: document.querySelector('#editViewModal [name="SoldToDistributorNumber"]').value,
           SoldToDistributorName: document.querySelector('#editViewModal [name="SoldToDistributorName"]').value,
            Outlet: document.querySelector('#editViewModal input[name=Outlet]').value,
        };
        return data;
    }

    // Clearing modal form
    _clearModalForm() {
        document.querySelector('#addEditModal form').reset();
    }




        _setModalAlert(msg, mode, off, eparam) {

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
        else
            msg += this._messages.AuthenticationFatalError;
        //let toast = new ComponentsToasts();
        this._toast.Toast(msg, "bg-danger");
    }


    // Update tag from top side dropdown
    _updateTag(tag) {
        const selected = this._datatableExtend.getSelectedRows();
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
                            <input type="radio" Id="${it.CategoryCode}" name="ItemCategory" value="${it.Id}" class="form-check-input" />
                            <label class="form-check-label" for="${it.CategoryCode}">${it.CategoryCode}</label>
                          </div>`;
                    });
                    //console.log(inner);
                    const radio = document.querySelector('#radioCategory');
                    if (radio ? 1 : 0)
                        radio.innerHTML = inner;
                }
            },
            (x) => { console.log(`xhr error: ${x}`); }
        );

    }

    _fetchLookups() {

        this._itemsApi.Request_Items(
            (d) => {
                this._itemsLookup = JSON.parse(d);

                if (document.getElementById('ItemCode_input') !== null) {
                    const secs = [];
                    this._itemsLookup.forEach(e => {
                        secs.push({ id: e.ItemCode, name: `${e.ItemCode}  ${e.ItemName}` })
                    })
                    new AutocompleteCustom('ItemCode_input', 'ItemCode_input_result', {
                        data: {
                            src: secs,
                            key: ['name'],
                        },
                        placeHolder: '',
                        searchEngine: 'strict',
                        onSelection: (feedback) => {
                            document.getElementById('ItemCode_input').value = feedback.selection.value['id'];
                            document.getElementById('ItemCode_input').blur();
                        },
                    });
                }
            },
            (x) => { console.log(`xhr error: ${x}`); }
        );
        this._outletsApi.Request_Outlets(
            (d) => {
                this._outletsLookup = JSON.parse(d);
                if (document.getElementById('OutletCode_input') !== null) {
                    const secs = [];
                    this._outletsLookup.forEach(e => {
                        secs.push({ id: e.OutletCode, name: `${e.OutletCode}  ${e.OutletName}` })
                    })
                    new AutocompleteCustom('OutletCode_input', 'OutletCode_input_result', {
                        data: {
                            src: secs,
                            key: ['name'],
                        },
                        placeHolder: '',
                        searchEngine: 'strict',
                        onSelection: (feedback) => {
                            document.getElementById('OutletCode_input').value = feedback.selection.value['id'];
                            document.getElementById('OutletCode_input').blur();
                        },
                    });
                }
            },
            (x) => { console.log(`xhr error: ${x}`); }
        );


    }

    _findItem(value) {
        return this._itemsLookup.filter( e=> e.ItemCode == value);
    }

    _findDirect(value, successBlock, failBlock) {
        _this._directApi.Request_Direct(value, 
            successBlock, failBlock);
    }





    _updateRowData(data) {

            this._datatable.row(this._rowToEdit).data(this._toTableRow(data)).draw();
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();

        //         this._toast.Toast(this._messages.Common_RecordUpdated);       // this._itemsApi.Submit_UpdateItem(
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

    _deleteRowData() {
        const Id = this._rowToDelete.Id;
        this._itemsApi.Submit_DeleteItem(
            {Id:Id, username: _gxUser.profile.username},
            (d) => {
                const selected = this._datatableExtend.getSelectedRows();
                if (selected.count()==1 && selected.data()[0].Id == this._rowToDelete.Id)
                    selected.remove().draw();
                this._datatableExtend.controlCheckAll();
                this._toast.Toast(this._messages.Item_Deleted_info, "bg-info");
            },
            (x) => {
                console.log(`xhr error: ${x}`);
            }
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

    _loadInitialData() {
        if (this._salesApi?true:false) {
        _this._salesApi.Request_Sales_Order(this._salesId, 
            (data) => {
                const json = JSON.parse(data);
                if (json) {
                    _this._salesOrder = json
                    _this._setHeaderForm()
                    _this._datatable.clear();

                    //_this._setForm(json)
                    json.SalesOrderDetails.forEach(d => {
                        this._datatable.row.add({
                            ItemCode: d.Item1.ItemCode,
                            ItemName: d.Item1.ItemName,
                            RecordedPrice: d.RecordedPrice,
                            Quantity: d.Quantity,
                            Amount: d.RecordedPrice * d.Quantity,
                            CategoryCode: d.Item1.ItemCategory1.CategoryCode,
                            Tag: "",
                            Check: "",

                            Id: d.Id,
                            ItemCategory: d.Item1.ItemCategory1.Id,
                            status: d.status,
                            dtcreated: d.dtcreated,
                            dtlastmodified: d.dtlastmodified,
                            SalesOrder: d.SalesOrder,
                            SalesOrder1: d.SalesOrder1,
                            Item: d.Item
                        })
                    });
                    this._datatable.rows().draw()
                }
            }, 
            (xhr) => {
                this._setPageAlertXhrWarn(xhr)
            }
        );
        }
        else {
            this._apiWaiting = true;
        }
    }

}