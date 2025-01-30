class Race_MastersApi {
  constructor() {
    this._rootpath = "http://localhost:52764/";
    this._path = this._rootpath + "/api";
    this._token = "";

    this._request_extract_path = "process/extract_master";
    this._request_verify_path = "process/verify_master";
    this._request_post_path = "process/post_master";
    this._request_list_path = "reports/racers_master";
    this._request_round_path = "reports/round_result";
    this._init();
  }

  _init() {}

  link(target) {
    return this._path + "/" + target;
  }

  root() {
    return this._rootpath;
  }
  //---------------------------------------------------------------------------------
  Request_Extract(data, callback, negcallback, alwayscallback, severecallback) {
    let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

    xhr.open("POST", `${this._path}/${this._request_extract_path}`, true);
    //xhttp.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
    return;
  }
  //---------------------------------------------------------------------------------
  Request_Verify(data, callback, negcallback, alwayscallback, severecallback) {
    let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

    xhr.open("POST", `${this._path}/${this._request_verify_path}`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
    return;
  }
 //---------------------------------------------------------------------------------
  Request_Post(data, callback, negcallback, alwayscallback, severecallback) {
    let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

    xhr.open("POST", `${this._path}/${this._request_post_path}`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
    return;
  }
 //---------------------------------------------------------------------------------
  Request_List(callback, negcallback, alwayscallback, severecallback) {
    let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

    xhr.open("GET", `${this._path}/${this._request_list_path}`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
    return;
  }
 //---------------------------------------------------------------------------------
  Request_Round(roundId, callback, negcallback, alwayscallback, severecallback) {
    let xhr = this._xhRequestWithCallBack(callback, negcallback, alwayscallback, severecallback);

    xhr.open("POST", `${this._path}/${this._request_round_path}`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(roundId));
    return;
  }

  //---------------------------------------------------------------------------------
  _xhRequestWithCallBack(
    callback,
    negcallback,
    alwayscallback,
    severecallback
  ) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status <= 204) {
          if (typeof callback === "function") callback(this.responseText);
        } 
        else if (this.status >= 400 && this.status <= 451) {
          if (typeof negcallback === "function")
            negcallback({
              status: this.status,
              statusText: this.statusText,
              responseText: this.responseText,
            });

        } 
        else if (this.status >= 500 || this.status == 0) {
          if (typeof severecallback === "function")
            severecallback({
              status: this.status,
              statusText: this.statusText,
              responseText: "",
            });
        }
      }
          if (typeof alwayscallback === "function") alwayscallback();
    };

    return xhttp;
  }
}

export default Race_MastersApi;