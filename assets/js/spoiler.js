// 스포일러 표시 체크박스(#is-spoiler-avail) 상태를 쿠키로 유지
// 전역에는 Spoiler 하나만 노출 (Spoiler.init)
const Spoiler = (function () {
    function saveCheckboxStatesToCookie(checkboxStates) {
        // 쿠키 수명 13개월로 설정
        let expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 13);
        document.cookie = "spoiler=" + checkboxStates + "; expires=" + expirationDate.toUTCString() + "; path=/";
    }

    function loadCheckboxStatesFromCookie() {
        let match = new RegExp(/(?:^|;\s*)spoiler=([^;]*)/).exec(document.cookie);
        return match ? match[1] === "true" : false;
    }

    // DOM 준비 시 쿠키 값으로 체크박스를 복구하고, 체크박스 변경 시와 초기화 시 applyFilter 호출
    function init(applyFilter) {
        $(function () {
            $('#is-spoiler-avail').prop('checked', loadCheckboxStatesFromCookie());
            $('#is-spoiler-avail').on('change', function () {
                saveCheckboxStatesToCookie($(this).is(':checked'));
                applyFilter();
            });
            applyFilter();
        });
    }

    return Object.freeze({init});
})();
