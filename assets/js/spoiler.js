function saveCheckboxStatesToCookie(checkboxStates) {
    // 쿠키 수명 13개월로 설정
    let expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 13);
    document.cookie = "spoiler=" + checkboxStates + "; expires=" + expirationDate.toUTCString() + "; path=/";
}

function loadCheckboxStatesFromCookie() {
    let match = document.cookie.match(/(?:^|;\s*)spoiler=([^;]*)/);
    return match ? match[1] === "true" : false;
}

$(function () {
    $('#is-spoiler-avail').prop('checked', loadCheckboxStatesFromCookie());
    $('#is-spoiler-avail').on('change', function () {
        saveCheckboxStatesToCookie($(this).is(':checked'));
        applySpoilerFilter();
    });
    applySpoilerFilter();
});