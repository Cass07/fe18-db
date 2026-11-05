// 스킬 이름 앞에 아이콘(image/icon/[icon_idx].png)을 붙여 출력하는 공용 포매터
// 전역에는 SkillIcon 하나만 노출 (SkillIcon.load, SkillIcon.icon, SkillIcon.format)
// 사용법:
//   SkillIcon.load().then(skills => { ... SkillIcon.format("공격 진형") ... });
//   load()는 data/skills.json 을 한 번만 불러오고, 불러온 스킬 목록으로 resolve 됨
const SkillIcon = (function () {
    const ICON_DIR = "image/icon/";
    const STYLE_ID = "skill-icon-style";
    let iconIdxByName = {};
    let loading = null;

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = ".skill-icon{width:1.5em;height:1.5em;vertical-align:middle;margin-right:.25em;}";
        document.head.appendChild(style);
    }

    function escapeAttr(text) {
        return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // data/skills.json 을 불러와 이름 → icon_idx 맵을 만든다. 여러 번 호출해도 fetch는 한 번만 함
    function load() {
        if (loading === null) {
            injectStyle();
            loading = fetch("data/skills.json")
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
                .then(skills => {
                    skills.forEach(s => {
                        if (s.icon_idx !== undefined && s.icon_idx !== null && s.icon_idx !== "") {
                            iconIdxByName[s.name] = s.icon_idx;
                        }
                    });
                    return skills;
                });
        }
        return loading;
    }

    // 스킬 이름에 해당하는 아이콘 <img> 태그. skills.json 에 없는 이름이면 빈 문자열
    function icon(name) {
        const idx = iconIdxByName[String(name).trim()];
        if (idx === undefined) return "";
        return '<img class="skill-icon" src="' + ICON_DIR + idx + '.png" alt="' + escapeAttr(name) + '" loading="lazy">';
    }

    // 아이콘 + 표시 텍스트. text 를 생략하면 스킬 이름을 그대로 출력
    function format(name, text) {
        return icon(name) + (text === undefined ? name : text);
    }

    return Object.freeze({load, icon, format});
})();
