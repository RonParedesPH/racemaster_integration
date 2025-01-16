class RolesApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = "http://sentry.verityclouds.com/api";
        this._token = "";

        this._request_roles_path = "roles";
        this._submit_userwithroles_path = "roles/updateuserswithroles";
    }

    path() {
        return this._path;
    }

    Request_Roles(callback, negcallback, alwayscallback) {

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
        xhttp.open("GET", `${this._path}/${this._request_roles_path}`, true);
        xhttp.send();
        return;
    }

    Submit_UsersWithRoles(data, callback, negcallback, alwayscallback)
{
         let xhttp = new XMLHttpRequest();
  
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400) {
                    if (typeof negcallback === "function") negcallback({status:this.status,statusText:this.statusText});
                    if (typeof alwayscallback === "function") alwayscallback();
                }

            }
        };
        xhttp.open("PUT", `${this._path}/${this._submit_userwithroles_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;
}
}

export default RolesApi;