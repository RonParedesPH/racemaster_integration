/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */

class RowsAjax {
    constructor() {
        if (!jQuery().DataTable) {
            console.log('DataTable is null!');
            return;
        }

        // Selected single row which will be edited
        this._rowToEdit;

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

        this._rolesApi = null;
        this._updateButton = null;
        this._spinner = null;

        this._initVariables();
        this._createInstance();
        this._addListeners();
        this._extend();
        this._initBootstrapModal();
    }

    _initVariables() {
        import('../api/roles.api.js')
            .then((module) => {
                console.log('rolesApi import at admin.assignroles - OK');
                this._rolesApi = new module.default();

                this._fetchData();
            })
            .catch((err) => {
                console.log(`rolesApi import at admin.assignroles - ${err.message}`);
            });

        let el = document.querySelectorAll('.save-datatable');
        if (el.length) {
            this._updateButton = el[0];
        }
        el =  document.querySelectorAll('.spinner-border');
        if (el.length) {
            this._spinner = el[0];
        }
    }

    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance() {
        const _this = this;
        this._datatable = jQuery('#datatableRowsAjax').DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            ajax: {
                "url": "http://sentry.verityclouds.com/api/users/getuserswithoutrole",
                "dataSrc": function (json) {
                    let a = [];
                    json.forEach(j => { a.push({ email: j.Email, firstname: j.UserName, lastname: "", roles: "" , id:j.Id }) });
                    //console.log(`Received json as : ${json}`);
                    return a;
                },
                "type": "GET"
            },
            order: [], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            //   columns: [{data: 'Name'}, {data: 'Sales'}, {data: 'Stock'}, {data: 'Category'}, {data: 'Tag'}, {data: 'Check'}],
            columns: [ { data: 'email' }, { data: 'firstname' }, { data: 'lastname' }, { data: 'roles' }, { data: 'check' },{ data: 'id' }],
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
                    targets: 3,
                    render: function (data, type, row, meta) {
                        let a = data.split(',');
                        let ret = '';
                        a.forEach(i => {
                            ret += '<span class="badge bg-outline-primary">' + i + '</span>';
                        });
                        return ret;
                    },
                },
                // Adding checkbox for Check column
                {
                    targets: 4,
                    render: function (data, type, row, meta) {
                        return '<div class="form-check float-end mt-1"><input type="checkbox" class="form-check-input"></div>';
                    },
                },                {
                    targets: 5,
                    visible: false
                },
            ],
        });
    }

    _addListeners() {
        // Listener for confirm button on the edit/add modal
        document.getElementById('addEditConfirmButton').addEventListener('click', this._addEditFromModalClick.bind(this));

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
        document.getElementById('addEditModal').addEventListener('hidden.bs.modal', this._clearModalForm);

        //
        this._updateButton.addEventListener('click', () => this._saveData());
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
        this._addEditModal = new bootstrap.Modal(document.getElementById('addEditModal'));
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
        this._showModal('edit', 'Edit', 'Done');
        this._setForm();
    }

    // Edit button inside th modal click
    _editRowFromModal() {
        const data = this._rowToEdit.data();
        const formData = Object.assign(data, this._getFormData());
        this._datatable.row(this._rowToEdit).data(formData).draw();
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();
    }

    // Add button inside th modal click
    _addNewRowFromModal() {
        const data = this._getFormData();
        this._datatable.row.add(data).draw();
        this._datatableExtend.unCheckAllRows();
        this._datatableExtend.controlCheckAll();
    }

    // Delete icon click
    _onDeleteClick() {
        const selected = this._datatableExtend.getSelectedRows();
        selected.remove().draw();
        this._datatableExtend.controlCheckAll();
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
        document.querySelector('#addEditModal input[name=Name]').value = data.Name;
        document.querySelector('#addEditModal input[name=Sales]').value = data.Sales;
        document.querySelector('#addEditModal input[name=Stock]').value = data.Stock;
        if (document.querySelector('#addEditModal ' + 'input[name=Category][value="' + data.Category + '"]')) {
            document.querySelector('#addEditModal ' + 'input[name=Category][value="' + data.Category + '"]').checked = true;
        }
        if (document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]')) {
            document.querySelector('#addEditModal ' + 'input[name=Tag][value="' + data.Tag + '"]').checked = true;
        }
    }

    // Getting form values from the fields to pass to datatable
    _getFormData() {
        const data = {};
        data.Name = document.querySelector('#addEditModal input[name=Name]').value;
        data.Sales = document.querySelector('#addEditModal input[name=Sales]').value;
        data.Stock = document.querySelector('#addEditModal input[name=Stock]').value;
        data.Category = document.querySelector('#addEditModal input[name=Category]:checked')
            ? document.querySelector('#addEditModal input[name=Category]:checked').value || ''
            : '';
        data.Tag = document.querySelector('#addEditModal input[name=Tag]:checked')
            ? document.querySelector('#addEditModal input[name=Tag]:checked').value || ''
            : '';
        data.Check = '';
        return data;
    }

    // Clearing modal form
    _clearModalForm() {
        document.querySelector('#addEditModal form').reset();
    }

    // Update tag from top side dropdown
    _updateTag(tag) {
        this._updateButton.classList.remove('disabled');
        const selected = this._datatableExtend.getSelectedRows();
        const _this = this;
        selected.every(function (rowIdx, tableLoop, rowLoop) {
            const data = this.data();
            if (!data.roles.includes(tag))
                data.roles += (data.roles ? ',' : '') + tag;
            else {
                let t = tag;
                if (data.roles.includes(t + ','))
                    t = tag + ','
                data.roles = data.roles.replace(t, '');
            }
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

    _saveData() {
        console.log(this);
        const a = [];
        const d = this._datatable.rows().data();
        for(let i=0; i < d.length; i++) {
            if (d[i].roles?1:0)
                a.push(d[i]);
        };
        if (a.length) {
            this._updateButton.classList.add('disabled');
            this._spinner.classList.remove('d-none');
            this._rolesApi.Submit_UsersWithRoles(a,
                (d) => {
                    this._datatable.ajax.reload();
                    this._updateButton.classList.remove('disabled');
                    this._spinner.classList.add('d-none');

                },
                (x) => {
                    console.log(`error at _saveData: ${x}`);
                    // TODO: show toast here
                    this._updateButton.classList.remove('disabled');
                    this._spinner.classList.add('d-none');
                }
            );
        }
    }

    _fetchData() {
        this._rolesApi.Request_Roles(
            (d) => {
                const a = JSON.parse(d)
                let inner = '';
                if (a.length)  {
                    a.forEach(it => {
                        inner += `<button class="dropdown-item tag-item" type="button" data-tag="${it.Name}">${it.Name}</button>`;
                    });
                    const el = document.querySelector('#tags');
                    if (el?1:0) {
                        el.innerHTML = inner;
                    }
                    document.querySelectorAll('.tag-item').
                        forEach((el) => el.addEventListener('click', () => this._updateTag(el.dataset.tag)));

                }
            },
            (x) => {
                console.log(`xhr error: ${x}`);
        });

    }
}
