
{
    let expiredOrLoggedOut = true;
    const u = JSON.parse(localStorage.getItem('acorn-user'));
    if (u ? 1 : 0) {
        const stamp = Date.parse(u.lastStamp);
        const d = new Date();
        expiredOrLoggedOut = (Date.parse(d.toISOString()) - stamp > 15*60*1000);
    }
    document.location = expiredOrLoggedOut ? 'pages.authentication.login.html' : 'pages.landing.html';
}