/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */
 
var Messages;
var Toasts;
var User;
var Items;
var Outlets;
var Direct;
var SalesApi;

var _this;

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
        this._staticHeight = 72;

        this._messages = null;
        this._user = null;
        	
        this._online = window.navigator.onLine;
        this._itemsLookup = [];
        this._outletsLookup = [];
        this._invoiceLookup = [];
        this._dataHeaders = [];
        this._dataLines = [];

        this._controlNumber = '';
        this._editorDataLines = [];
        this._toEdit = 0;
        this._lineToEdit = 0;
        this._hasCompleted = false;
        

        _this = this;
    }

    init() {
        /// let messages act as singleton
        this._messages = new Messages() 
        this._user = new User()
        this._user.readFromStorage()

        //this._initObjectsAndVariables();
        this._createInstance();
        this._addListeners();
        this._extend();
        this._initBootstrapModal();

        this._fetchLookups();
        this._fetchFromStorage();

    }

    _setEditorVisible(toggle)
    {
        if (toggle?true:false) {
            document.querySelector('#divEditor').classList.remove("d-none")
            document.querySelector('#divGrid').classList.add("d-none")
        }
        else {
            document.querySelector('#divEditor').classList.add("d-none")
            document.querySelector('#divGrid').classList.remove("d-none")
        }
    }

    _setEditorData(mode) {
        //_this.controlNumber = controlNumber;
        //if (controlNumber == '')
        
        if (mode==='add' || mode==='clear')
        {
            document.querySelector('#formEditor input[name=DateSold]').value = '';
            document.querySelector('#formEditor input[name=ControlNumber]').value = '';
            document.querySelector('#formEditor input[name=Outlet]').value = '';
            document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value =''
            document.querySelector('#formEditor input[name=SoldToDistributorName]').value =''
            document.querySelector('#formEditor input[name=Total]').value = '';

            this._setEditorDataLines()
            return
        }
        
        if (mode='edit') {
            this._hasCompleted = this._rowToEdit.data().Tag === 'Completed';

            document.querySelector('#formEditor input[name=DateSold]').value = this._rowToEdit.data().DateSold;
            document.querySelector('#formEditor input[name=ControlNumber]').value = this._rowToEdit.data().ControlNumber;
            document.querySelector('#formEditor input[name=Outlet]').value = this._rowToEdit.data().Outlet;
            document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value = this._rowToEdit.data().SoldToDistributorNumber;
            document.querySelector('#formEditor input[name=SoldToDistributorName]').value = this._rowToEdit.data().SoldToDistributorName;
 
            document.querySelector('#formEditor input[name=Total]').value = this._rowToEdit.data().TotalAmount;

            _this._controlNumber = this._rowToEdit.data().ControlNumber;
            _this._toEdit = this._rowToEdit.data().index;

           let i = 0;
            _this._dataLines.forEach(e => {
                if (e.ControlNumber == _this._controlNumber)
                    this._editorDataLines.push({
                        ControlNumber: e.ControlNumber, ItemCode: e.ItemCode, ItemName: e.ItemName, CategoryCode: e.CategoryCode, 
                        RecordedPrice: e.RecordedPrice, Quantity:e.Quantity, Tag: e.Tag, Remarks: e.Remarks, active: e.active,
                        index: e.index
                    })
                i++;
            })
             // _this._datatable.data().forEach( e => {
            //     if (e.ControlNumber === this._controlNumber) {
            //         _editorDataLines.push(e);
            //     }
            // })
            // this._editorDataLines = [];
            // let total = 0;

            // for (let i = 0; i < _this._datatable.rows().count(); i++)
            //     if (_this._datatable.rows(i).data()[0].ControlNumber === this._controlNumber) {
            //         this._editorDataLines.push({index: i, data: _this._datatable.rows(i).data()[0], active:1});

            //         total += _this._datatable.rows(i).data()[0].RecordedPrice *
            //                     _this._datatable.rows(i).data()[0].Quantity

            //         if (_this._datatable.rows(i).data()[0].RecordedPrice)
            //             _this._hasCompleted = true;
            //     }
            // document.querySelector('#formEditor input[name=Total]').value = total;

            this._setEditorDataLines()
            return
        }
    }

    _setEditorDataValues(data) {
        document.querySelector('#formEditor input[name=DateSold]').value = data.DateSold;
        document.querySelector('#formEditor input[name=ControlNumber]').value = data.ControlNumber;
        document.querySelector('#formEditor input[name=Outlet]').value = data.Outlet;
        document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value = data.SoldToDistributorNumber;
        document.querySelector('#formEditor input[name=SoldToDistributorName]').value = data.SoldToDistributorName;
    }

    _addEditorDataLines(data) {
        //this._editorDataLines.push({index: 0, data: data, active:1})

        this._editorDataLines.push({
                ControlNumber: data.ControlNumber, 
                ItemCode: data.ItemCode, ItemName: data.ItemName, CategoryCode: data.CategoryCode, 
                RecordedPrice: data.RecordedPrice, Quantity: data.Quantity, Tag: data.Tag, Remarks: data.Remarks, active: true,
                index: 0 
            })
        this._setEditorDataLines()
    }

    _updateEditorDataLine(data) {
        if (this._lineToEdit >= 0) {
        const el = _this._editorDataLines[_this._lineToEdit]
        el.ItemCode = data.ItemCode;
        el.ItemName = data.ItemName;
        el.CategoryCode = data.CategoryCode;
        el.RecordedPrice = data.RecordedPrice;
        el.Quantity = data.Quantity;
        el.Remarks = '';
        if (document.querySelector('#formEditor input[name=SoldToDistributorName]').value === '')
            el.Tag='Edited';
        else 
            el.Tag='Edited';

        this._setEditorDataLines()
        }
    }

    _setEditorDataLines() {
        const el = document.querySelector('#tableEditor tbody')
        let inner = '';
        let total = 0;
        let i = 0;

        this._editorDataLines.forEach( e => {
            if (e.active == 1) {
                total += Number(e.RecordedPrice) * Number(e.Quantity)
                inner += `                                            
                    <tr>
                        <td scope="row"> ${e.ItemCode} <br/> ${e.ItemName}
                        </td>
                        <td class="text-end"> ${e.RecordedPrice}
                        </td>
                        <td class="text-end"> ${e.Quantity}
                        </td>
                        <td class="text-end"> ${e.RecordedPrice * e.Quantity}
                        </td>` + 
                        (e.Tag !== 'Completed'?
                        `<td>
                            <div class="d-inline">
                                <button class="btn btn-icon btn-icon-only btn-outline-primary shadow edit-datatable" title="" type="button" onclick="_this._onEditorEditLineClick(${i})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-edit undefined">
                                        <path d="M14.6264 2.54528C15.0872 2.08442 15.6782 1.79143 16.2693 1.73077C16.8604 1.67011 17.4032 1.84674 17.7783 2.22181C18.1533 2.59689 18.33 3.13967 18.2693 3.73077C18.2087 4.32186 17.9157 4.91284 17.4548 5.3737L6.53226 16.2962L2.22192 17.7782L3.70384 13.4678L14.6264 2.54528Z"></path>
                                    </svg>
                                </button>
                                <button class="btn btn-icon btn-icon-only btn-outline-primary shadow delete-datatable"  title="" type="button"  onclick="_this._onEditorDeleteLineClick(${i})">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="acorn-icons acorn-icons-bin undefined">
                                        <path d="M4 5V14.5C4 15.9045 4 16.6067 4.33706 17.1111C4.48298 17.3295 4.67048 17.517 4.88886 17.6629C5.39331 18 6.09554 18 7.5 18H12.5C13.9045 18 14.6067 18 15.1111 17.6629C15.3295 17.517 15.517 17.3295 15.6629 17.1111C16 16.6067 16 15.9045 16 14.5V5"></path>
                                        <path d="M14 5L13.9424 4.74074C13.6934 3.62043 13.569 3.06028 13.225 2.67266C13.0751 2.50368 12.8977 2.36133 12.7002 2.25164C12.2472 2 11.6734 2 10.5257 2L9.47427 2C8.32663 2 7.75281 2 7.29981 2.25164C7.10234 2.36133 6.92488 2.50368 6.77496 2.67266C6.43105 3.06028 6.30657 3.62044 6.05761 4.74074L6 5"></path>
                                        <path d="M2 5H18M12 9V13M8 9V13"></path>
                                    </svg>
                                </button>
                            </div>
                        </td>`:'<td><span class="badge bg-outline-success">Completed</span></td>') +
                    `</tr>`;
            }
            i++;

        })
        el.innerHTML = inner;
        document.querySelector('#formEditor input[name=Total]').value = total;
    }



    _setEditorControls(mode) {
        if (mode === 'add') {
            document.querySelector('#controlEditorEdit').classList.remove('disabled')
            document.querySelector('#controlEditorSave').classList.add('d-none')
            document.querySelector('#controlEditorCancel').classList.remove('disabled')
            document.querySelector('#controlEditorDelete').classList.add('d-none')
            document.querySelector('#controlEditorAddLine').classList.add('disabled')

            return
        }
        if (mode === 'edit') {
            document.querySelector('#controlEditorSave').classList.add('d-none')
            document.querySelector('#controlEditorCancel').classList.remove('disabled')
            document.querySelector('#controlEditorAddLine').classList.remove('disabled')
            if (_this._hasCompleted) {
                document.querySelector('#controlEditorEdit').classList.add('disabled')
                document.querySelector('#controlEditorDelete').classList.add('d-none')
                document.querySelector('#controlEditorAddLine').classList.add('disabled')
            }
            else {
                document.querySelector('#controlEditorEdit').classList.remove('disabled')
                document.querySelector('#controlEditorDelete').classList.remove('d-none')
                document.querySelector('#controlEditorAddLine').classList.remove('disabled')
            }


            return
        }
        if (mode === 'editing') {

            document.querySelector('#controlEditorSave').classList.remove('d-none')
            document.querySelector('#controlEditorCancel').classList.remove('disabled')
            document.querySelector('#controlEditorDelete').classList.add('d-none')
            document.querySelector('#controlEditorAddLine').classList.remove('disabled')
            if (_this._hasCompleted)
                document.querySelector('#controlEditorEdit').classList.add('disabled')
            else
                document.querySelector('#controlEditorEdit').classList.remove('disabled')
            return
        }

    }

    _onEditorCancelClick() {
        this._lineToEdit = 0;
        this._editorDataLines = [];
        this._hasCompleted = false;
        this._rowToEdit = null;
        this._controlNumber = '';

        this._setEditorData('clear')
        this._setEditorVisible(false)
        this._datatable.draw()
    }

    _onEditorEditClick() {
        /*
         if (("New;Failed;Edited").indexOf(rowToEdit.data().Tag) >=0) {
             document.querySelector("#addEditConfirmButton").classList.remove("d-none");
         }
         else {
             document.querySelector("#addEditConfirmButton").classList.add("d-none");
         }
         */
        this._lineToEdit = -1;
        if (this._rowToEdit == null) {
            this._showModal('add', 'Add', 'Add New')

        }
        else {
            this._lineToEdit = 0;
            this._showModal('edit', 'Edit', 'Update')
        }
        this._setForm()
    }

    _onEditorSaveClick() {
        let total = 0;
        this._editorDataLines.forEach(e => {
            if(e.Tag !== 'Completed') {
                if (e.active == 0 && e.index > 0) {
                    //this._datatable.rows(e.index).remove().draw();
                    this._dataLines.splice(e.index, 1)

                }
                if (e.index == 0 && e.active==1) {
                    // e.DateSold = document.querySelector('#formEditor input[name=DateSold]').value;
                    // e.ControlNumber = document.querySelector('#formEditor input[name=ControlNumber]').value;
                    // e.SoldToDistributorNumber = document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value;
                    // e.SoldToDistributorName = document.querySelector('#formEditor input[name=SoldToDistributorName]').value;
                    // e.Outlet = document.querySelector('#formEditor input[name=Outlet]').value;

                    // if (e.SoldToDistributorName === '')
                    //     this._datatable.row.add(this._toTableRow(e,"New")).draw()
                    // else 
                    //     this._datatable.row.add(this._toTableRow(e,"Pending")).draw()
                    this._dataLinesAdd(e.ControlNumber, e.ItemCode, e.ItemName, e.CategoryCode,
                        e.RecordedPrice, e.Quantity, e.Tag, e.Remarks, e.active)
                    total += Number(e.Quantity) * Number(e.RecordedPrice)
                }
                if (e.index > 0 && e.active==1)  {
                    this._dataLines[e.index].ControlNumber = e.ControlNumber;
                    this._dataLines[e.index].ItemCode = e.ItemCode;
                    this._dataLines[e.index].ItemName = e.ItemName;
                    this._dataLines[e.index].CategoryCode = e.CategoryCode;
                    this._dataLines[e.index].RecordedPrice = e.RecordedPrice;
                    this._dataLines[e.index].Quantity = e.Quantity;
                    this._dataLines[e.index].Tag = e.Tag;
                    this._dataLines[e.index].Remarks = e.Remarks;
                    this._dataLines[e.index].active = e.active;
                    // this._datatable.rows(e.index).data()[0]

                    // _this._datatable.rows(e.index).data()[0].DateSold = document.querySelector('#formEditor input[name=DateSold]').value;
                    // _this._datatable.rows(e.index).data()[0].ControlNumber = document.querySelector('#formEditor input[name=ControlNumber]').value;
                    // _this._datatable.rows(e.index).data()[0].SoldToDistributorNumber = document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value;
                    // _this._datatable.rows(e.index).data()[0].SoldToDistributorName = document.querySelector('#formEditor input[name=SoldToDistributorName]').value;
                    // _this._datatable.rows(e.index).data()[0].Outlet = document.querySelector('#formEditor input[name=Outlet]').value;

                    // _this._datatable.rows(e.index).data()[0].ItemCode = e.ItemCode;
                    // _this._datatable.rows(e.index).data()[0].ItemName = e.ItemName;
                    // _this._datatable.rows(e.index).data()[0].CategoryCode = e.CategoryCode;
                    // _this._datatable.rows(e.index).data()[0].RecordedPrice = e.RecordedPrice;
                    // _this._datatable.rows(e.index).data()[0].Quantity = e.Quantity;
                    // _this._datatable.rows(e.index).data()[0].Remarks = e.Remarks;
                    // _this._datatable.rows(e.index).data()[0].Tag = e.Tag;
                    total += Number(e.Quantity) * Number(e.RecordedPrice)

                }

            }
        });
        if (this._rowToEdit===null) {
            
            //const user = new User()
            this._dataHeadersAdd( 
                document.querySelector('#formEditor input[name=ControlNumber]').value,
                document.querySelector('#formEditor input[name=DateSold]').value,
                document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value,
                document.querySelector('#formEditor input[name=SoldToDistributorName]').value,
                document.querySelector('#formEditor input[name=Outlet]').value,
                0,
                0,

                this._user.profile.username,
                document.querySelector('#formEditor input[name=SoldToDistributorName]').value? "New": "New",
                '',
                false,
                '',
                new Date().toISOString(),
                null
            )
            this._updateDataTable()
        }
        else {

            _this._dataHeaders[_this._toEdit].DateSold = document.querySelector('#formEditor input[name=DateSold]').value;
            _this._dataHeaders[_this._toEdit].ControlNumber = document.querySelector('#formEditor input[name=ControlNumber]').value;
            _this._dataHeaders[_this._toEdit].SoldToDistributorNumber = document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value;
            _this._dataHeaders[_this._toEdit].SoldToDistributorName = document.querySelector('#formEditor input[name=SoldToDistributorName]').value;
            _this._dataHeaders[_this._toEdit].Outlet = document.querySelector('#formEditor input[name=Outlet]').value;
            if (_this._dataHeaders[_this._toEdit].Tag !== 'Complete')
                _this._dataHeaders[_this._toEdit].Tag = document.querySelector('#formEditor input[name=SoldToDistributorName]').value? "Edited": "Edited"
            this._updateDataTable()
        }



        this._onEditorCancelClick()     // don't redo code
        this._flushToStorage()
    }


    _onEditorAddLineClick() {
        this._lineToEdit = -1;

        this._showModal('add', 'Add New', 'Add')
        this._setForm()
    }

    _onEditorDeleteLineClick(line) {
        if (line < _this._editorDataLines.length) {
            const e = _this._editorDataLines[line]
            if (e.Tag !== 'Completed')
                e.active = 0;
        }
        _this._setEditorDataLines()
        _this._setEditorControls('editing')
    }

    _onEditorEditLineClick(line) {
        this._lineToEdit = line;

        this._showModal('edit', 'Edit', 'Update')
        this._setForm()
    }



    _initObjectsAndVariables() {
        
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
                    toastModule = module.default;
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

            })
            .catch((err) => {
                console.log(`salesApi import at dataentry.orders - ${err.message}`);
            });    }

    // Creating datatable instance. Table data is provided by json/products.json file and loaded via ajax
    _createInstance() {


        this._datatable = jQuery('#datatableRowsAjax').DataTable({
            scrollX: true,
            buttons: ['copy', 'excel', 'csv', 'print'],
            info: false,
            //   ajax: 'json/test.json',
            // ajax: {
            //     "url": "https://localhost:7035/api/SalesOrderDetails/GetSalesOrderDetailsExpanded",
            //     "dataSrc": function (json) {
            //         let a = [];
            //         json.forEach(d => {
            //             a.push({
            //                 DateSold: d.DateSold,
            //                 ItemCode: d.ItemCode,
            //                 ItemName: d.ItemName,
            //                 RecordedPrice: d.RecordedPrice,
            //                 Quantity: d.Quantity,
            //                 Amount: d.RecordedPrice * d.Quantity,
            //                 CategoryCode: "",
            //                 ControlNumber: d.ControlNumber,
            //                 SoldToDistributorNumber: d.SoldToDistributorNumber,
            //                 SoldToDistributorName: d.SoldToDistributorName,
            //                 username: d.username,
            //                 Id: d.Id,
            //                 ItemCategory: 'd.ItemCategory',
            //                 Tag: "",
            //                 Check: "",
            //             })
            //         });
            //         //console.log(`Received json as : ${json}`);
            //         return a;
            //     },
            //     "type": "GET"
            // },
            order: [0, "desc"], // Clearing default order
            sDom: '<"row"<"col-sm-12"<"table-container"t>r>><"row"<"col-12"p>>', // Hiding all other dom elements except table and pagination
            pageLength: 10,
            //   columns: [{data: ''}, {data: 'Sales'}, {data: 'Stock'}, {data: 'Category'}, {data: 'Tag'}, {data: 'Check'}],
            columns: [
            { data: 'DateSold'},
            { data: 'ControlNumber' },
            { data: 'SoldToDistributorNumber' },            
            { data: 'Items'},            
            { data: 'TotalAmount' },
            { data: 'Username' },                        
 
            { data: 'Tag' },
            { data: 'Remarks' },
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
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        var dt = new Date(data);
                        return dt.toJSON().substr(0,10);
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
                        const a = _this._dataLinesFindByControlNumber( row.ControlNumber )
                        let items = '';
                        let total = 0;
                        a.forEach( el => {
                            items += `${el.ItemName}<br/> Code:${el.ItemCode}  Qty:${el.Quantity}<br/>`;
                            total += Number(el.Quantity) * Number(el.RecordedPrice)
                        })
                        row.TotalAmount = total;
                        return `<a class="list-item-heading body" href="#"> ${items} </a>`;
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
                // Remarks
                {
                    
                    targets: 7,
                    render: function (data, type, row, meta) {
                        if (data!=='')
                            return '<a class="list-item-heading body" href="#"><span class="alert alert-danger"><small>' 
                                + data 
                                + '</small></span></a>';
                        else 
                            return '';
                    },
                },
                // Adding checkbox for Check column
                {
                    targets: 8,
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
        document.querySelectorAll('.tag-done').forEach((el) => el.addEventListener('click', () => this._updateTag('Ready')));
        // document.querySelectorAll('.tag-new').forEach((el) => el.addEventListener('click', () => this._updateTag('New')));
        document.querySelectorAll('.tag-sale').forEach((el) => el.addEventListener('click', () => this._updateTag('Repost')));
        document.querySelector('#controlEditorCancel').addEventListener('click', this._onEditorCancelClick.bind(this));
        document.querySelector('#controlEditorEdit').addEventListener('click', this._onEditorEditClick.bind(this));
        document.querySelector('#controlEditorAddLine').addEventListener('click', this._onEditorAddLineClick.bind(this));
        document.querySelector('#controlEditorSave').addEventListener('click', this._onEditorSaveClick.bind(this));


        window.addEventListener('online', () => {
            document.querySelector("button i.icon-20").classList.remove("bi-wifi-off")
            document.querySelector("button i.icon-20").classList.add("bi-wifi")
            this._online = window.navigator.onLine;
        });
        window.addEventListener('offline', () => {
            document.querySelector("button i.icon-20").classList.remove("bi-wifi")
            document.querySelector("button i.icon-20").classList.add("bi-wifi-off")
            this._online = window.navigator.onLine;
        });
        setInterval( () => {
            // Invoke function every 10 minutes
            if (this._online) {
                //console.log('should run a validation on rows')
                this._processToServer();
            }
        }, 60000 ); // 60000 = 3 mins

    }



    // Keeping a reference to add/edit modal
    _initBootstrapModal() {
         this._addEditModal = new bootstrap.Modal(document.getElementById('addEditModal'));

       // Calling clear form when modal is closed
        document.getElementById('addEditModal').addEventListener('hidden.bs.modal', this._clearModalForm);

        if (jQuery().datepicker) {
            jQuery('#dateSold2').datepicker({
                autoclose: true,
            });
            jQuery('#dateSold2').on('change', function () {
                jQuery(this).valid();
                $('#dateSold2').focus();
            });
        }

        document.querySelector('#addEditModal [name="SoldToDistributorNumber"]').onchange = (e)=> {
            const val = document.querySelector('#addEditModal [name="SoldToDistributorNumber"]').value
            if (val.length==7)
            _this._findDirect( val, 
                (d)=>{ 
                    const data = JSON.parse(d);
                    document.querySelector('#addEditModal [name="SoldToDistributorName"]').value = `${data.name_last}, ${data.name_first}`;
                    _this._setPageAlert(`Lookup result: ${data.member_id} - ${data.name_last}, ${data.name_first}`);
                    },
                ()=>{
                    _this._setPageAlert(`May not be a valid Empower number : ${val}`, "alert-danger")
                }
            );
        };

        document.querySelector('#addEditModal [name="Quantity"]').onfocusout = (e)=>{
            const item = _this._findItem(document.querySelector('#addEditModal [name="ItemCode"]').value)
            if (item) {
                document.querySelector('#addEditModal [name="Amount"]').value = 
                document.querySelector('#addEditModal [name="Quantity"]').value *
                    item[0].DiscountedPrice;

                document.querySelector('#addEditModal [name="ItemName"]').value  = item[0].ItemName;
                document.querySelector('#addEditModal [name="RecordedPrice"]').value  = item[0].DiscountedPrice;
                document.querySelector('#addEditModal [name="CategoryCode"]').value  = item[0].ItemCategory1.CategoryCode;
            }
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

        

        const form = document.getElementById("modalForm");
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

            },
        };
        jQuery(form).validate(validateOptions);
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('submit clicked');
                if (jQuery(form).valid()) {
                    if (this._currentState === 'add') 
                        this._addNewRowFromModal();
                     else 
                        this._editRowFromModal();
                    
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
        /*
        if (("New;Failed;Edited").indexOf(rowToEdit.data().Tag) >=0) {
            document.querySelector("#addEditConfirmButton").classList.remove("d-none");
        }
        else {
            document.querySelector("#addEditConfirmButton").classList.add("d-none");
        }
        this._showModal('edit', 'Edit', 'Update');
        this._setForm();
        */
        this._showEditor('edit', 'Edit', 'Update')
    }

    // Edit button inside th modal click
    _editRowFromModal() {
        const data = this._getFormData();

        this._setEditorDataValues(data)
        this._updateEditorDataLine(data)
        this._setEditorControls("editing")

        this._setPageAlert("Line was updated.");
        this._addEditModal.hide();
    }

    // Add button inside th modal click
    _addNewRowFromModal() {
        const data = this._getFormData();

        this._setEditorDataValues(data)
        this._addEditorDataLines(data)
        this._setEditorControls("editing")

        //this._datatable.row.add(this._toTableRow(data,"New")).draw();
        //this._addRowData(data)
        // this._datatableExtend.unCheckAllRows();
        // this._datatableExtend.controlCheckAll();
        
        // this._setModalAlert("Record was added.");
        this._setPageAlert("Line was added.");

        this._clearModalFormPartial();
        this._lineIncrement();
    }

    // Delete icon click
    _onDeleteClick() {
        const selected = this._datatableExtend.getSelectedRows();
        if (selected.count() == 1) {

            const toast = new Toasts()
            toast.Toast(this._messages.Common_AreYouSureToDeleteSelected, "bg-primary", true, () => {
                this._rowToDelete = selected.data()[0];
                this._deleteRowData()
            });
        }
        else {
            const toast = new Toasts()
            toast.Toast(this._messages.Common_DeleteOnlyWithOneSelected)
        }

    }

    // + Add New or just + button from top side click
    _onAddRowClick() {
        document.querySelector("#addEditConfirmButton").classList.remove("d-none");
        //this._showModal('add', 'Add New', 'Add');
        this._rowToEdit = null;
        this._showEditor('add', 'Add New', 'Add');
    }

    _showEditor(objective, title, button) {
        //this._lineReset;
 
        //this._addEditModal.show();
        this._setEditorVisible(true);
        this._currentState = objective;
        document.getElementById('modalTitle').innerHTML = title;
        document.getElementById('addEditConfirmButton').innerHTML = button;
        this._setEditorData(objective)
        this._setEditorControls(objective)
    }

    // Showing modal for an objective, add or edit
    _showModal(objective, title, button) {
        this._lineReset;
 
        this._addEditModal.show();
        this._currentState = objective;
        document.getElementById('modalTitle').innerHTML = title;
        document.getElementById('addEditConfirmButton').innerHTML = button;
    }

    // Filling the modal form data
    _setForm() {
        document.querySelector('#addEditModal input[name=DateSold]').value = document.querySelector('#formEditor input[name=DateSold]').value;
        document.querySelector('#addEditModal input[name=ControlNumber]').value = document.querySelector('#formEditor input[name=ControlNumber]').value;
        document.querySelector('#addEditModal input[name=SoldToDistributorNumber]').value = document.querySelector('#formEditor input[name=SoldToDistributorNumber]').value;
        document.querySelector('#addEditModal input[name=SoldToDistributorName]').value = document.querySelector('#formEditor input[name=SoldToDistributorName]').value;
        document.querySelector('#addEditModal input[name=Outlet]').value = document.querySelector('#formEditor input[name=Outlet]').value;

        if (this._editorDataLines.length == 0 || this._lineToEdit==-1) {
            document.querySelector('#addEditModal input[name=ItemCode]').value = '';
            document.querySelector('#addEditModal input[name=Quantity]').value = '';
            document.querySelector('#addEditModal input[name=Amount]').value = '';

        }
        else {
            let i = this._lineToEdit;
            document.querySelector('#addEditModal input[name=ItemCode]').value = this._editorDataLines[i].ItemCode;
            document.querySelector('#addEditModal input[name=Quantity]').value = this._editorDataLines[i].Quantity;
            document.querySelector('#addEditModal input[name=Amount]').value = Number(this._editorDataLines[i].RecordedPrice) * Number(this._editorDataLines[i].Quantity)
        }

        if (_this._hasCompleted) {
            document.querySelector('#addEditModal input[name=DateSold]').disabled=true;
            document.querySelector('#addEditModal input[name=ControlNumber]').disabled=true;
            document.querySelector('#addEditModal input[name=SoldToDistributorNumber]').disabled=true;
            document.querySelector('#addEditModal input[name=Outlet]').disabled=true;
            
        }
        else {
            document.querySelector('#addEditModal input[name=DateSold]').disabled=false;
            document.querySelector('#addEditModal input[name=ControlNumber]').disabled=false;
            document.querySelector('#addEditModal input[name=SoldToDistributorNumber]').disabled=false;
            document.querySelector('#addEditModal input[name=Outlet]').disabled=false;
        }
    }

    // Getting form values from the fields to pass to datatable
    _getFormData() {
        const data = {
            DateSold: document.querySelector('#addEditModal [name="DateSold"]').value,
            ControlNumber: document.querySelector('#addEditModal [name="ControlNumber"]').value,
            SoldToDistributorNumber: document.querySelector('#addEditModal [name="SoldToDistributorNumber"]').value,
            SoldToDistributorName: document.querySelector('#addEditModal [name="SoldToDistributorName"]').value,
            ItemCode: document.querySelector('#addEditModal [name="ItemCode"]').value,
            Quantity: document.querySelector('#addEditModal [name="Quantity"]').value,
            Amount: document.querySelector('#addEditModal [name="Amount"]').value,
            Outlet: document.querySelector('#addEditModal [name="Outlet"]').value,

            ItemName: document.querySelector('#addEditModal [name="ItemName"]').value,
            RecordedPrice: document.querySelector('#addEditModal [name="RecordedPrice"]').value,
            CategoryCode: document.querySelector('#addEditModal [name="CategoryCode"]').value,
            Remarks: '',
            Tag: '',
            Check: ''
        };
        return data;
    }

    // Clearing modal form
    _clearModalForm() {
        document.querySelector('#addEditModal form').reset();
    }

        _clearModalFormPartial() {
            // document.querySelector('#addEditModal input[name=DateSold]').value = '';
            // document.querySelector('#addEditModal input[name=ControlNumber]').value = '';
            // document.querySelector('#addEditModal input[name=SoldToDistributorNumber]').value = '';
            document.querySelector('#addEditModal input[name=ItemCode]').value =  '';
            document.querySelector('#addEditModal input[name=Quantity]').value =  '';
            document.querySelector('#addEditModal input[name=Amount]').value =  '';
            // document.querySelector('#addEditModal input[name=Outlet]').value = '';
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


    // Update tag from top side dropdown
    _updateTag(tag) {
        const selected = this._datatableExtend.getSelectedRows();
        
        selected.every(function (rowIdx, tableLoop, rowLoop) {
            const data = this.data();
            if (data.Tag!=='Completed')
                data.Tag = tag;
            if (data.Tag==='Completed' && tag==="Repost")
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

    _fetchLookups() {
        const itemsApi = new ItemsApi()
        itemsApi.Request_Items(
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

        const outletsApi = new OutletsApi()
        outletsApi.Request_Outlets(
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

    _updateRowData(data) {
        this._flushToStorage();
    }

    _addRowData(data) {
        this._flushToStorage();
    }

    _flushToStorage() {
        // const a = [];
        // for (let i=0; i < this._datatable.rows().data().length; i++) {
        //     a.push(this._datatable.rows().data()[i]);
        // }

        //localStorage.setItem("dataentry.orders", JSON.stringify(a));
        localStorage.setItem("dataentry.dataheaders", JSON.stringify(this._dataHeaders))
        localStorage.setItem("dataentry.datalines", JSON.stringify(this._dataLines))
    }

    _fetchFromStorage() {
        const headers  = localStorage.getItem("dataentry.dataheaders")
        let a= [];

        if (!headers) {
            const data = localStorage.getItem("dataentry.orders")
            a = JSON.parse(data);
            if (a.length) {
                a.forEach(el=>{
                     this._dataHeadersAdd(el.ControlNumber, el.DateSold,
                        el.SoldToDistributorNumber, el.SoldToDistributorName, 
                        el.Outlet, el.Quantity, el.RecordedPrice, el.username,
                        el.Tag, el.Remarks, el.Check,
                        el.Id)
                    this._dataLinesAdd(el.ControlNumber, el.ItemCode, el.ItemName, el.CategoryCode,
                     el.RecordedPrice, el.Quantity, el.Tag, el.Remarks, true)
                })
                // a.forEach(el=>{
                //     this._datatable.row.add(this._toTableRow(el));
                // })
                // this._datatable.rows().draw();

            }
        }
        else {
            a = JSON.parse(headers);
            a.forEach(el=>{
                     this._dataHeadersAdd(el.ControlNumber, el.DateSold,
                        el.SoldToDistributorNumber, el.SoldToDistributorName, 
                        el.Outlet, el.Quantity, el.RecordedPrice, el.Username,
                        el.Tag, el.Remarks, el.Check,
                       el.Id)
                            })

            const lines = localStorage.getItem("dataentry.datalines")
            a = JSON.parse(lines);

            a.forEach(el=>{
                    this._dataLinesAdd(el.ControlNumber, el.ItemCode, el.ItemName, el.CategoryCode,
                     el.RecordedPrice, el.Quantity, el.Tag, el.Remarks, true)
            })
        }
        this._updateDataTable()

    }

    _updateDataTable(index)
    {
        this._datatable.clear()
        if(this._dataHeaders.length) {
            this._dataHeaders.forEach(el=>{
                 this._datatable.row.add(this._toTableRow(el))
                })
            this._datatable.rows().draw()
        }
    }

    _processToServer() {
        let toProcess = -1;

        for (let i = 0; i < this._dataHeaders.length && toProcess < 0; i++) {
            if (this._dataHeaders[i].SoldToDistributorName === '')
                toProcess = i;
        }
        if (toProcess < 0) {
            for (let i = 0; i < this._dataHeaders.length && toProcess < 0; i++) {
                if (this._dataHeaders[i].Tag === 'Ready')
                    toProcess = i;
            }
        }
        // if (toProcess < 0) {
        // for (let i = 0; i < this._dataHeaders.length && toProcess<0; i++) {
        //     if (this._dataHeaders[i].Tag==='Edited')
        //             toProcess = i;
        //     }
        // }

        if (toProcess >= 0) {
            const o = this._dataHeaders[toProcess];
            if (o.ControlNumber != this._controlNumber) {
                //if (o.Tag==="New" || o.Tag==="Edited") {
                if (o.SoldToDistributorName === '') {
                    const directApi = new DirectApi()
                    directApi.Request_Direct(o.SoldToDistributorNumber,
                        (d) => {
                            const data = JSON.parse(d);
                            o.SoldToDistributorName = `${data.name_last}, ${data.name_first}`;
                            //o.Tag = "Pending";
                            //_this._datatable.row(toProcess).data(o).draw();
                            this._updateDataTable(toProcess)

                            _this._flushToStorage()
                            

                            // _this._datatable.row(toProcess).data().SoldToDistributorName = `${data.name_last}, ${data.name_first}`;
                            // _this._datatable.row(toProcess).data().Tag = "Pending";
                            // _this._datatable.draw()
                        },
                        (x) => {
                            o.Tag = "Error";
                            o.Remarks = JSON.parse(x.responseText).Message;
                            //_this._datatable.row(toProcess).data(o).draw();
                            this._updateDataTable(toProcess)

                            // _this._datatable.row(toProcess).data().Tag = "Failed";
                            // _this._datatable.row(toProcess).data().Remarks = JSON.parse(x.responseText).Message;
                            // _this._datatable.draw()
                        },
                    )                
                    // if (o.Tag === "Ready") {

                    // }
                    // else {
                    //     o.Tag = "Pending";
                    //     _this._datatable.draw()
                    // }
                }
                if (o.Tag === "Ready") {
                //if (o.Tag === "Pending") {
                	o.Username = this._user.profile.username;
                	const salesApi = new SalesApi()
                    salesApi.Submit_SalesOrderEntry(o, this._dataLinesFindByControlNumber(o.ControlNumber),
                        (d) => {
                            const data = JSON.parse(d);
                            o.Id = data.Id;
                            o.Tag = "Completed";
                            o.Remarks = '';

                            if (data.SalesOrderDetails ? true : false) {
                                data.SalesOrderDetails.forEach(el => {
                                    const a = _this._dataLines.filter(e => e.ControlNumber == o.ControlNumber && e.ItemCode == el.Item1.ItemCode)
                                    a.forEach(ai => ai.Tag = 'Completed')
                                })

                            }
                            //_this._datatable.row(toProcess).data(o).draw();
                            this._updateDataTable(toProcess)


                            // _this._datatable.rows(toProcess).data()[0].Id = data.Id;
                            // _this._datatable.rows(toProcess).data()[0].Tag = "Completed";
                            // _this._datatable.rows(toProcess).data()[0].Remarks = "";
                            // _this._datatable.rows(toProcess).data().draw()
                            _this._flushToStorage();
                        },
                        (x) => {
                            if (o.Tag != 'Completed') {
                                o.Tag = "Failed";
                                o.Remarks = JSON.parse(x.responseText).Message;
                                //_this._datatable.row(toProcess).data(o).draw();
                                this._updateDataTable(toProcess)

                                // _this._datatable.rows(toProcess).data()[0].Tag = "Failed";
                                // _this._datatable.rows(toProcess).data()[0].Remarks = JSON.parse(x.responseText).Message;
                                // _this._datatable.rows(toProcess).draw().draw()
                                _this._flushToStorage()
                            }
                        },
                    );
                }
            }
        }
    }

    _deleteRowData() {
        const Id = this._rowToDelete.Id;
        if (Id!=="") {
            const toast = new Toasts()
            toast.Toast(this._messages.DataEntry_CannotDeleteAnymore, "bg-warning");
        }
        else {
                const selected = this._datatableExtend.getSelectedRows();
                if (selected.count() == 1)
                    selected.remove().draw();
                this._datatableExtend.controlCheckAll();
                const toast = new Toasts()
            toast.Toast(this._messages.Item_Deleted_info, "bg-info"); 
                this._flushToStorage();           
        }
    }


    _toTableRow(d, tag) {

        const data = d;

        return data

    }

    _findDirect(value, successBlock, failBlock) {
        if (_this._online) {
            const directApi = new DirectApi()
            directApi.Request_Direct(value, 
                successBlock, failBlock)
        }
        else {
            _this._setPageAlert("Cannot perform Empower number lookup when offline","alert-warning")
            document.querySelector('#formEditor input[name=SoldToDistributorName]').value =''
            if (typeof(failBlock)=='function')
                failBlock()
        }
    }


    _invoiceFind(invoiceNo) {
        let retObj = null;
         this._invoiceLookup.forEach( c=> {
            if (c.InvoiceNo === invoiceNo) {
                retObj = c;
            }
        })    
        return retObj  
    }

    _invoiceAdd(invoiceNo, qty, amount) {
        let found = false;
        this._invoiceLookup.forEach( c=> {
            if (c.InvoiceNo === invoiceNo) {
                c.Amount += amount;
                c.Qty += Number(qty)
                found = true;
            }
        })
        if (found===false) {
            this._invoiceLookup.push({InvoiceNo: invoiceNo, Qty: Number(qty), Amount: amount})
        }
    }

    _dataHeadersAdd(ControlNumber, DateSold, 
            SoldToDistributorNumber, SoldToDistributorName,
            Outlet, Quantity, RecordedPrice, Username, 
            Tag, Remarks, Check,
            Id, dtcreated, dtlastmodified) {
        let found = false;
        this._dataHeaders.forEach( c=> {
            if (c.ControlNumber === ControlNumber) {
                c.TotalAmount += Number(Quantity) * Number(RecordedPrice)
                found = true;
            }
        })
        if (found===false) {
            this._dataHeaders.push({
                ControlNumber, DateSold, 
                SoldToDistributorNumber, SoldToDistributorName,
                Outlet, 
                //Quantity, RecordedPrice, 
                TotalAmount : Number(Quantity) * Number(RecordedPrice),
                Items: '',
                Username, 
                Tag, Remarks, Check,
                Id, dtcreated, dtlastmodified,
                index: this._dataHeaders.length
            })
        }
    }

    _dataHeadersFind(ControlNumber) {
    return this._dataHeaders.filter( el => el.ControlNumber == ControlNumber)
    }

    _dataLinesFindByControlNumber(ControlNumber) {
    return this._dataLines.filter( el => el.ControlNumber == ControlNumber )
    }

    _dataLinesAdd(ControlNumber, ItemCode, ItemName, CategoryCode, RecordedPrice, Quantity, Tag, Remarks, active) {
        let found = false;
        this._dataLines.forEach( c=> {
            if (c.ControlNumber === ControlNumber && c.ItemCode === ItemCode) {
                 found = true;
            }
        })
        if (found===false) {
                    this._dataLines.push({
                        ControlNumber, 
                        ItemCode, ItemName, CategoryCode, 
                        RecordedPrice, Quantity, Tag, Remarks, active,
                        index: this._dataLines.length
            })
        }
    }

    _lineIncrement() {
        const el = document.querySelector('#lineSpan')
        if (el)
        {
            let str = el.textContent;
            el.textContent = `#${Number(str.substr(1,str.length-3))+1}: `;
        }
    }

    _lineReset() {
        document.querySelector('#lineSpan').textContent = "#1:";
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
    ], (modules) => {
        modules.forEach((elem) => {
            switch (elem.name) {
                case 'Messages':
                    Messages = elem;
                    break;
                case 'Toasts':
                    Toasts = elem;
                    break;
                 case 'User':
                    User = elem;
                    break;
                // no need to instantiate single-use, self-triggering modules
                // case 'UserDomInject' :
                //     UserDomInject = elem;
                //     break;
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
                	SalesApi = elem
               	
            }
        })

        const r = new RowsAjax()
        r.init()
    })
}();