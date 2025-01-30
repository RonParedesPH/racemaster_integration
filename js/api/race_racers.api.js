class Race_RacersApi {
    constructor() {
        this._path = "http://localhost:52764/api";
        this._token = "";

        this._request_all_racers_path = "racers";

        this._init();
    }

    // Masonry Cards Example init
    _init() {

    }


        Request_Items(callback, negcallback, alwayscallback) {

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
        xhttp.open("GET", `${this._path}/${this._request_all_items_path}`, true);
        xhttp.send();
        return;
    }


    // Submit_AddItem(data, callback, negcallback, alwayscallback) {
    //     let xhttp = new XMLHttpRequest();

    //     xhttp.onreadystatechange = function () {
    //         if (this.readyState === 4) {
    //             if (this.status >= 200 && this.status <= 202) {
    //                 if (typeof callback === "function") callback(this.responseText);
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 400 && this.status <= 451) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 500 || this.status == 0 ) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }

    //         }
    //     };
    //     xhttp.open("POST", `${this._path}/${this._submit_add_item_path}`, true);
    //     xhttp.setRequestHeader('Content-type', 'application/json');
    //     xhttp.send(JSON.stringify(data));
    //     return;
    // }

    // Submit_UpdateItem(data, callback, negcallback, alwayscallback) {
    //     let xhttp = new XMLHttpRequest();

    //     xhttp.onreadystatechange = function () {
    //         if (this.readyState === 4) {
    //             if (this.status >= 200 && this.status <= 202) {
    //                 if (typeof callback === "function") callback(this.responseText);
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 400 && this.status <= 451) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 500 || this.status == 0 ) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //         }
    //     };
    //     xhttp.open("PUT", `${this._path}/${this._submit_update_item_path}/${data.Id}`, true);
    //     xhttp.setRequestHeader('Content-type', 'application/json');
    //     xhttp.send(JSON.stringify(data));
    //     return;
    // }

    // Submit_DeleteItem(data, callback, negcallback, alwayscallback) {
    //     let xhttp = new XMLHttpRequest();

    //     xhttp.onreadystatechange = function () {
    //         if (this.readyState === 4) {
    //             if (this.status >= 200 && this.status <= 202) {
    //                 if (typeof callback === "function") callback(this.responseText);
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 400 && this.status <= 451) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }
    //             else if (this.status >= 500 || this.status == 0 ) {
    //                 if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: ''});
    //                 if (typeof alwayscallback === "function") alwayscallback();
    //             }

    //         }
    //     };
    //     // xhttp.open("DELETE", `${this._path}/${this._submit_delete_item_path}?id=${id}`, true);
    //      xhttp.open("DELETE", `${this._path}/${this._submit_delete_item_path}/${data.Id}`, true);
    //    xhttp.setRequestHeader('Content-type', 'application/json');
    //     xhttp.send(JSON.stringify(data));
    //     return;
    // }

}

export default Race_RacersApi;