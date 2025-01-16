class UsersApi {
    constructor() {
        this._init();
    }

    // Masonry Cards Example init
    _init() {
        this._path = "https://sentry.verityclouds.com/api";
        this._token = "";

        this._request_users = "users";
        this._request_users_withoutroles = "users/getuserswithoutrole";
        this._request_profile_path = "profiles";
    }

    Request_Users(callback, negcallback,alwayscallback) {
        return
    }

        Request_Users_WithoutRoles(callback, negcallback,alwayscallback) {
        return
    }
}

export default UsersApi;