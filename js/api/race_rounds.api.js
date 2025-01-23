class Race_RoundsApi {
    constructor() {
        this._path = //"http://localhost:52764/api";
        "http://raceporting.verityclouds.com/api";
        this._token = "";

        this._request_all_items_path = "rounds";

        this._init();
    }

    // Masonry Cards Example init
    _init() {

    }

    _xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 204) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({status: this.status, statusText: this.statusText, responseText: this.responseText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0 ) {
                    if (typeof severecallback === "function") severecallback({status: this.status, statusText: this.statusText, responseText: ''});
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }
        };

        return xhttp;
    }

    Request_Items(callback, negcallback, alwayscallback) {
        let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);
        
        xhr.open("GET", `${this._path}/${this._request_all_items_path}`, true);
        xhr.send();
        return;
    }

}

export default Race_RoundsApi;