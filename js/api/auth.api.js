class AuthApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = 
        "http://sentry2.verityclouds.com";
        //;"http://localhost:46725";
        
        
        this._token = "";

        this._request_login_path = "login";
        this._request_register_path = "register";
        this._request_profile_path = "profiles";
        this._request_verify_info_path = "verifyinfo";
        this._request_verify_email_path = "verifyemail";

        this._APPNAME = "RaceMaster Sandbox";
        this._URLBASEPATH = window.location.href.substring(0, window.location.href.lastIndexOf('/'))
        this._URLVERIFYPATH = this._URLBASEPATH + "/pages.authentication.verifyemail.html";
        this._URLMAINPATH = this._URLBASEPATH;
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


    Request_Login(formValues, callback, negcallback, alwayscallback, severecallback) {
        /*  fetch(this._path + "/profiles")
                  .then(response => response.json())
                  .then(data => console.log(data));
            */
        let data = {
            UserNameOrEmail: formValues.Email,
            Password: formValues.Password,
        };

        let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

        xhr.open("POST", `${this._path}/${this._request_login_path}`, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(data));
        return;

    }

    Request_VerifyInfo(uid, callback, negcallback, alwayscallback) {
        let data = {
            uid: uid,
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 202) {
                    if (typeof callback === "function") callback(this.responseText);
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 400 && this.status <= 451) {
                    if (typeof negcallback === "function") negcallback({ status: this.status, statusText: this.statusText, responseText: this.responseText });
                    if (typeof alwayscallback === "function") alwayscallback();
                }
                else if (this.status >= 500 || this.status == 0) {
                    if (typeof negcallback === "function") negcallback({ status: this.status, statusText: this.statusText, responseText: '' });
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            }
        };
        xhttp.open("POST", `${this._path}/${this._request_verify_info_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(uid));
        return;

    }

    Request_VerifyEmail(formValues, callback, negcallback, alwayscallback) {
        /*  fetch(this._path + "/profiles")
                  .then(response => response.json())
                  .then(data => console.log(data));
            */
        let data = {
            UserName:formValues.username,
            Email: formValues.email,
            Password: formValues.password,
            ApplicationName: this._APPNAME,
            UrlVerifyPath: this._URLBASEPATH
        };

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
        xhttp.open("POST", `${this._path}/${this._request_verify_email_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;

    }

    Request_Profile(jwtToken, callback, negcallback, alwayscallback) {
        this._AjaxGetWithTokenAsync(
            this._request_profile_path,
            jwtToken,
            callback,
            negcallback,
            alwayscallback
        );
    }

    Request_Register(formValues, callback, negcallback, alwayscallback, severecallback) {
        /*  fetch(this._path + "/profiles")
                  .then(response => response.json())
                  .then(data => console.log(data));
            */
        // modify payload for API compatibility  name -> firstname and lastname is blank
        //let firstname = formValues.name.split(" ")[0];
        //let lastname = formValues.name.split(" ")[1];
        let data = {
            UserName:formValues.username,
            Email: formValues.email,
            Password: formValues.password,
            ApplicationName: this._APPNAME,
            UrlVerifyPath: this._URLVERIFYPATH
        };

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
        xhttp.open("POST", `${this._path}/${this._request_register_path}`, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(data));
        return;

    }

    _AjaxGetWithTokenAsync(
        urlTarget,
        token,
        callback,
        negcallback,
        alwayscallback
    ) {
        let Authorization = "Bearer " + token + "";
        $.ajax({
            url: this._path + "/" + urlTarget,
            crossDomain: true,
            headers: {
                Authorization,
            },
            type: "GET",
        })
            .done(function (data, s, xhr) {
                if (typeof callback === "function") callback(data);
            })
            .fail(function (xhr, s, e) {
                if (typeof negcallback === "function") negcallback(xhr, s, e);
            })
            .always(function (xhr, s, e) {
                if (typeof alwayscallback === "function") alwayscallback(xhr, s, e);
            });
    }

    _AjaxPostWithTokenAsync(
        urlTarget,
        jsonData,
        token,
        callback,
        negcallback,
        alwayscallback
    ) {
        $.ajax({
            url: this._path + "/" + urlTarget,
            crossDomain: true,
            dataType: "json",
            data: jsonData,
            contentType: "application/json",
            type: "POST",
        })
            .done(function (data, s, xhr) {
                if (typeof callback === "function") callback(data);
            })
            .fail(function (xhr, s, e) {
                if (typeof negcallback === "function") negcallback(xhr, s, e);
            })
            .always(function (xhr, s, e) {
                if (typeof alwayscallback === "function") alwayscallback(xhr, s, e);
            });
    }
}

export default AuthApi;