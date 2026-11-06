// 스킬 이름 앞에 아이콘(image/icon/[icon].png)을 붙여 출력하는 공용 포매터
// 전역에는 SkillIcon 하나만 노출 (SkillIcon.load, SkillIcon.icon, SkillIcon.format, SkillIcon.loadLearnData, SkillIcon.learnTable)
// 사용법:
//   SkillIcon.load().then(skills => { ... SkillIcon.format("공격 진형") ... });
//   load()는 data/skills.json 을 한 번만 불러오고, 불러온 스킬 목록으로 resolve 됨
//   SkillIcon.loadLearnData().then(() => { ... SkillIcon.learnTable(unitRow, rankOrder) ... });
//   learnTable()은 unit_*.json 한 행의 랭크별 습득 기술을 랭크 / 이름 / 효과 / (스탯) 테이블로 출력
const SkillIcon = (function () {
    const ICON_DIR = "image/icon/";
    const STYLE_ID = "skill-icon-style";
    const STATS_HEADER = ["cost", "might", "hit", "crit", "range"];
    const STATS_HEADER_KR = ["내구", "위력", "명중", "필살", "사정"];
    let iconIdxByName = {};
    let loading = null;
    // learnTable 용 데이터. loadLearnData() 완료 전에는 null
    let descByName = null;
    let artStatsByName = {};
    let learnLoading = null;

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

    // data/skills.json 을 불러와 이름 → icon 맵을 만든다. 여러 번 호출해도 fetch는 한 번만 함
    function load() {
        if (loading === null) {
            injectStyle();
            loading = fetch("data/skills.json")
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
                .then(skills => {
                    skills.forEach(s => {
                        if (s.icon !== undefined && s.icon !== null && s.icon !== "") {
                            iconIdxByName[s.name] = s.icon;
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

    function escapeHtml(text) {
        const entities = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"};
        return String(text).replace(/[&<>"']/g, c => entities[c]);
    }

    function fetchJson(url) {
        return fetch(url).then(res => res.ok ? res.json() : []).catch(() => []);
    }

    // 스킬(전투기술 포함) / 마법 설명과 전투기술 스탯을 불러온다. 이름이 겹치면 skills > magic 순으로 우선
    function loadLearnData() {
        if (learnLoading === null) {
            learnLoading = Promise.all([load(), fetchJson("data/combat_arts_stats.json"), fetchJson("data/magic.json")])
                .then(([skills, stats, magics]) => {
                    const descs = {};
                    const artStats = {};
                    const statsByEn = {};
                    stats.forEach(s => statsByEn[s.en] = s);
                    const add = (name, desc) => {
                        if (!name || name in descs) return false;
                        descs[name] = desc || "";
                        return true;
                    };
                    skills.forEach(s => {
                        if (add(s.name, s.desc) && s.is_ca && statsByEn[s.en]) {
                            artStats[s.name] = statsByEn[s.en];
                        }
                    });
                    magics.forEach(m => add(m.name, m.desc));
                    artStatsByName = artStats;
                    descByName = descs;
                });
        }
        return learnLoading;
    }

    function statText(stats) {
        return STATS_HEADER.map((key, i) => {
            const base = stats[key];
            const plus = stats[key + "+"];
            return STATS_HEADER_KR[i] + " " + (plus === "" || plus === undefined || base === plus ? base : base + "/" + plus);
        }).join(", ");
    }

    // row : unit_*.json 의 한 행 ({ name, E: "...", D: "...", ... })
    // ranks : 출력할 랭크 순서
    // 반환값 : 테이블 HTML. 데이터 로딩 전이면 "불러오는 중...", 습득 기술이 없으면 emptyText
    function learnTable(row, ranks, emptyText) {
        if (descByName === null) return "불러오는 중...";
        const rows = [];
        let hasStats = false;
        ranks.forEach(rank => {
            if (!row || !row[rank]) return;
            String(row[rank]).split(/[,\r\n]+/).forEach(entry => {
                // ex) "떠돌이 벽(Lv45)" -> name: "떠돌이 벽", extra: "(Lv45)"
                const match = entry.trim().match(/^([\s\S]*?)\s*(\([\s\S]*\))?$/);
                if (!match || !match[1]) return;
                const name = match[1];
                const stats = artStatsByName[name];
                if (stats) hasStats = true;
                rows.push([
                    escapeHtml(rank),
                    icon(name) + "<b>" + escapeHtml(name + (match[2] || "")) + "</b>",
                    escapeHtml(descByName[name] || ""),
                    stats ? escapeHtml(statText(stats)) : ""
                ]);
            });
        });
        if (rows.length === 0) return emptyText === undefined ? "습득하는 기술이 없습니다." : emptyText;
        const header = ["랭크", "이름", "효과"].concat(hasStats ? ["스탯"] : []);
        const cols = header.length;
        return '<div class="table-responsive"><table class="table table-bordered table-sm mb-0 w-auto">'
            + "<thead><tr>" + header.map(h => '<th class="p-1">' + h + "</th>").join("") + "</tr></thead>"
            + "<tbody>" + rows.map(r => "<tr>" + r.slice(0, cols).map(c => "<td>" + c + "</td>").join("") + "</tr>").join("")
            + "</tbody></table></div>";
    }

    return Object.freeze({load, icon, format, loadLearnData, learnTable});
})();
