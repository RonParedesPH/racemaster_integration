/**
 *
 * SalesOrderDataTablePaged
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */
var _this;

class RaceTeamsDataTablePaged {
    constructor(toasts, race_teamsApi) {
        _this = this
        this.Toasts = toasts
        this.Race_TeamsApi = race_teamsApi
       
    }

    init(e) {
        this._initObjectsAndVariables();
        this._createInstance(e);
        this._addListeners();
        this._extend();
        // this._initBootstrapModal();
        // this._fetchData();
    }


    _initObjectsAndVariables() {
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
     }

    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance(e) {
        //var tabs = new ResponsiveTab(document.getElementById('responsiveTabs'));
        
        const race_RacersApi = new this.Race_TeamsApi()
        this._datatable = jQuery(e).DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            processing: true,
            //serverSide: true,
            ajax: {
                type: "POST",
                contentType: "application/json",
                url: race_RacersApi._path + '/teams',
                dataSrc: function(json)
                    {
                        let a = [];
                    json.forEach(d => {
                        a.push({
                            Name: d.Name,
                            Description: d.Description,
                            dtcreated: d.dtcreated
                        })
                    });
                    return a;
                },
                // data: function (d) {
                //     // note: d is created by datatable, the structure of d is the same with DataTableParameters model above
                //     console.log(d);
                //     return JSON.stringify(d);
                // },
            },
            order: [0, "asc"], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            columns: [
                { data: 'Name' },
                { data: 'Description' },
                { data: 'dtcreated' }
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
                    targets: 2,
                    render: function (data, type, row, meta) {
                        var dt = new Date(data);
                        return '<span class="badge bg-outline-info"><i class="fas fa-bell"></i> ' + dt.toLocaleDateString('en-US',{
                            weekday: 'short', // "Monday"
                            year: '2-digit', // "2024"
                            month: '2-digit', // "September"
                            day: '2-digit', // "15"
                            hour: '2-digit', // "03"
                            minute: '2-digit', // "06"
                            second: '2-digit', // "23"
                            hour12: true // "03:06:23 PM"
                          }) + '</span>';
                    },
                },

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
        //this._addEditModal = new bootstrap.Modal(document.getElementById('viewModal'));
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
        
        // let callbackFlag = false;
        // const modal = new this.SalesOrderForm(this.Toasts, this.ItemsApi, this.OutletsApi, this.DirectApi)
        // modal.showEditor(document.getElementById('editorModal'), rowToEdit.data(), 'Edit',
        //     (d) => {
        //         if (!callbackFlag) {
        //             callbackFlag = true;
        //             _this = this;

        //             this._addSpinner()
        //             const salesApi = new this.SalesApi()
        //             //const data = JSON.parse(d)
        //             const user = new this.User()
        //             d.username = user.profile.username
        //             salesApi.Submit_Update_Sales_Order(d,

        //                 (d) => {
        //                     this._datatable.draw()
        //                     this._removeSpinner()
        //                 },
        //                 (err) => {
        //                     console.log(err)
        //                     this._removeSpinner()
        //                 })
        //         }
        //         //console.log(d)
        //     },
        //     (err) => {
        //         _this = this;
        //     })

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
        // const modal = new this.SalesOrderForm()
        // modal.showEditor(document.getElementById('editorModal'), null, 'Add',
        //     (d) => {
        //         if (!callbackFlag) {
        //             callbackFlag = true;
        //             _this = this;

        //             this._addSpinner()
        //             const salesApi = new this.SalesApi()
        //             //const data = JSON.parse(d)
        //             const user = new this.User()
        //             d.username = user.profile.username
        //             salesApi.Submit_Add_Sales_Order(d,
        //                 (d) => {
        //                     this._datatable.draw()
        //                     this._removeSpinner()
        //                 },
        //                 (err) => {
        //                     console.log(err)
        //                     this._removeSpinner()
        //                 })
        //             //console.log(d)
        //         }
        //     },
        //     (err) => {
        //         _this = this;
        //     })
    }

    // Delete icon click
    _onDeleteClick() {
        let callbackFlag = false;
        // const selected = this._datatableExtend.getSelectedRows().data()[0]
        // const modal = new this.SalesOrderForm()
        // modal.showEditor(document.getElementById('editorModal'), selected, 'Delete',
        //     (d) => {
        //         if (!callbackFlag) {
        //             callbackFlag = true;
        //             _this = this;

        //             this._addSpinner()
        //             const salesApi = new this.SalesApi()
        //             salesApi.Submit_Delete_Sales_Order(d,
        //                 (d) => {
        //                     this._datatable.draw()
        //                     this._removeSpinner()
        //                 },
        //                 (err) => {
        //                     console.log(err)
        //                     this._removeSpinner()
        //                 })
        //             //console.log(d)
        //         }
        //     },
        //     (err) => {
        //         _this = this;
        //     })
    }

    // + Add New or just + button from top side click
    _onAddRowClick() {
        //this._showModal('add', 'Add New', 'Add');
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








}

export default RaceTeamsDataTablePaged;
