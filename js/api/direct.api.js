class DirectApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = "http://emidcors.verityclouds.com/api";
        this._token = "";

        this._request_direct_info_path = "profile/empowerno";
    }

    Request_Direct(distributorNumber, callback, negcallback, alwayscallback) {

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400) {
                    if (typeof negcallback === "function") negcallback(this.status + ' ' + this.statusText );
                    if (typeof alwayscallback === "function") alwayscallback();
                }

            }
        };
        xhttp.open("GET", `${this._path}/${this._request_direct_info_path}/${distributorNumber}`, true);
        xhttp.send();
        return;
    }


}

export default DirectApi;