class HtmlLoader {
    constructor() {
        return
    }

    Load (filename, elem, callback, negcallback, alwayscallback) {
        let xhttp;
        let file = filename;
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        const el = document.createElement('template');
                        el.innerHTML = this.responseText;
                        document.body.appendChild(el);

                        const templat = document.body.getElementsByTagName('template')
                            [document.body.getElementsByTagName('template').length-1];
                        const clon = templat.content.querySelector('div.partial-html').children[0].cloneNode(true);
                        if (elem?true:false)
                            elem.appendChild(clon);
                        else
                            document.body.appendChild(clon);

                        document.body.removeChild(el);
                        if (typeof callback === "function") callback('200 Ok' + ' (' + filename + ')');
                    } 
                    else if(this.status >= 400)  {
                        if (typeof negcallback === "function") negcallback(this.status + ' ' + this.statusText + ' (' + filename + ')');
                    }
                    if (typeof alwayscallback === "function") alwayscallback();
                }
            };
            xhttp.open("GET", filename, true);
            xhttp.send();
            return;
        }
    }

}

export default HtmlLoader;
