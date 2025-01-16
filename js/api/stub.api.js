
class StubApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = 'http://sentry.verityclouds.com/api';
 
        this._submit_stubrefresh_path = "procs";
    }

    Submit_StubRefresh(id, callback, negcallback, alwayscallback)
    {
        let xhttp = new XMLHttpRequest()

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
        
        console.log(id)

        xhttp.open("GET", `${this._path}/${this._submit_stubrefresh_path}/${id}`, true)
        //xhttp.setRequestHeader('Content-type', 'application/json');
        //xhttp.send(JSON.stringify(data));
        xhttp.send()
        return
    }

}

export default StubApi;