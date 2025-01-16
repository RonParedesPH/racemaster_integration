
class SalesReportsApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._reports_path = 
        'http://stockroom.verityclouds.com';
        //'http://localhost:52764';
        this._path = 
        'http://stockroom.verityclouds.com/api';
        //'http://localhost:52764/api';
 
        this._submit_salesreport_path = "reports/salesreport";
        this._submit_payoutreport_path = "reports/payoutreport";
    }

    Submit_SalesReport(data, callback, negcallback, alwayscallback)
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
            }        
        };
        
        console.log(data);

        xhttp.open("POST", `${this._path}/${this._submit_salesreport_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;
    }

        Submit_PayoutReport(data, callback, negcallback, alwayscallback)
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
            }        
        };
        
        console.log(data);

        xhttp.open("POST", `${this._path}/${this._submit_payoutreport_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;
    }

}

export default SalesReportsApi;