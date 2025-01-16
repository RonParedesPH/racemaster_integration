
class SalesApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = 
        'http://stockroom.verityclouds.com/api';
        //'http://localhost:52764/api';
        this._token = "";

        this._request_salesorderdetails_path = "SalesOrderDetails";
        //this._submit_salesorderentry_path = "SalesOrders/OrderEntry";
        this._submit_salesorderentry_path = "SalesOrders";
        this._submit_delete_salesorderdetail_path = "SalesOrderDetails";

        this._request_sales_order_path="SalesOrders"
        this._submit_delete_sales_order_path="SalesOrders"
        this._submit_update_sales_order_path="SalesOrders"
    }

    Request_Sales_Order(data, callback, negcallback, alwayscallback) {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
             if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        };
        xhttp.open("GET", `${this._path}/${this._request_sales_order_path}/${data}`, true);
        xhttp.send();
        return;
    }

        Submit_Add_Sales_Order(data, callback, negcallback, alwayscallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
             if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        
        };
        
        xhttp.open("POST", `${this._path}/${this._request_sales_order_path}`, true);
       xhttp.setRequestHeader('Content-type', 'application/json');
         xhttp.send(JSON.stringify(data));
        return;
    }
       Submit_Delete_Sales_Order(data, callback, negcallback, alwayscallback) {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
             if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        
        };
        const id = data.Id;
        
        xhttp.open("DELETE", `${this._path}/${this._request_sales_order_path}/${id}`, true);
       xhttp.setRequestHeader('Content-type', 'application/json');
         xhttp.send(JSON.stringify(data));
        return;
    }

    Submit_Update_Sales_Order(data, callback, negcallback, alwayscallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
             if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        
        };
        const id = data.Id;
        
        xhttp.open("PUT", `${this._path}/${this._request_sales_order_path}/${id}`, true);
       xhttp.setRequestHeader('Content-type', 'application/json');
         xhttp.send(JSON.stringify(data));
        return;
    }

    Request_Sales(callback, negcallback, alwayscallback) {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
             if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        };
        xhttp.open("GET", `${this._path}/${this._request_salesorderdetails_path}`, true);
        xhttp.send();
        return;
    }

    Submit_SalesOrderEntry(header, aDetail, callback, negcallback, alwayscallback)
    {
         let xhttp = new XMLHttpRequest();
  
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }        };
        // inject dummy Guid 
        // data.id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
        // data.DateSold = `${data.DateSold.substr(6,4)}/${data.DateSold.substr(0,5)}`.replaceAll('/','-');
        let data;
        if (header.Tag !== 'Completed') {
            let details = []
            aDetail.forEach( el => {
                details.push({
                    ItemCode: el.ItemCode,
                    Quantity: el.Quantity,
                    RecordedPrice: el.RecordedPrice
                })
            })            
            data = {
                ControlNumber: header.ControlNumber,
                DateSold: header.DateSold,
                SoldToDistributorNumber: header.SoldToDistributorNumber,
                SoldToDistributorName: header.SoldToDistributorName,
                Outlet: header.Outlet,
                username: header.Username,
                SalesOrderDetails: details
            }

        }

        // let data = {
        //     ControlNumber: formData.ControlNumber,
        //     DateSold : formData.DateSold,
        //     SoldToDistributorNumber:  formData.SoldToDistributorNumber,
        //     SoldToDistributorName: formData.SoldToDistributorName,
        //     Outlet: formData.Outlet,
        //     username: formData.username,
        //     SalesOrderDetail1: {
        //         ItemCode: formData.ItemCode,
        //         Quantity: formData.Quantity,
        //         RecordedPrice: formData.RecordedPrice
        //     }

        // }

        console.log(data);

        xhttp.open("POST", `${this._path}/${this._submit_salesorderentry_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;
    }

        Submit_DeleteSalesOrderDetail(data, callback, negcallback, alwayscallback) {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }

            }
        };
        // xhttp.open("DELETE", `${this._path}/${this._submit_delete_item_path}?id=${id}`, true);
         xhttp.open("DELETE", `${this._path}/${this._submit_delete_salesorderdetail_path}/${data.Id}`, true);
       xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;
    }

}

export default SalesApi;