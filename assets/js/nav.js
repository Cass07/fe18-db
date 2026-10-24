(function(window) {

    function NavInitiator() {
        let _nav = {};
        _nav.initiate = function (navData) {
            if(navData == null) {
                const navDir = "data/nav.json"
                const navPromise = $.ajax({
                    url: navDir,
                    dataType : 'json'
                });

                Promise.all([navPromise])
                    .then(([navData]) => {
                        updateDiv(navData);
                    });
            } else {
                updateDiv(navData);
            }
        }

        function updateDiv(navData) {
            let navLis = "";
            let currentFile = getCurrentUrl();
            navData.forEach(singleNav => {
                navLis += makeLi(singleNav.title, singleNav.href, currentFile, singleNav.child);
            });
            $("#navbarSupportedContent").find("ul").append(navLis);
        }

        function getNavData() {
            const navDir = "data/nav.json"
            const navPromise = $.ajax({
                url: navDir,
                dataType : 'json'
            })

            Promise.all([navPromise])
                .then(([navData]) => {
                    console.log(navData);
                    return navData;
                });
        }

        function getCurrentUrl() {
            let path = new URL(window.location.href).pathname;
            let filename = path.substring(path.lastIndexOf('/') + 1);
            if(filename === "") {
                filename = "index.html";
            }
            return filename;
        }

        let dropdownCount = 0;

        function makeLi(title, url, current, child) {
            let active = "";
            let childLis = "";
            let result = "";
            let childCurrent = false;

            if(url === current) {
                active = " active";
            }

            child.forEach(singleChild => {
                if(singleChild.href === current) {
                    childCurrent = true;
                    childLis += `<li><a class="dropdown-item active" aria-current="page">${singleChild.title}</a></li>`;
                } else {
                    childLis += `<li><a class="dropdown-item" href="${singleChild.href}">${singleChild.title}</a></li>`;
                }
            });

            if(childLis !== "") {
                const dropdownId = `navbarDropdown${dropdownCount++}`;
                result = `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle${childCurrent ? " active" : ""}" href="#" id="${dropdownId}" role="button" data-bs-toggle="dropdown" aria-expanded="false">${title}</a>
                            <ul class="dropdown-menu" aria-labelledby="${dropdownId}">${childLis}</ul> </li>`;
            } else {
                result = `<li class="nav-item"><a class="nav-link${active}" href="${url}">${title}</a></li>`;
            }

            return result;
        }        return _nav;
    }

    if (typeof window.NavInitiator === 'undefined') {
        window.NavInitiator = NavInitiator();
    }

})(window);