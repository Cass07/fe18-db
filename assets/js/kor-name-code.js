// 한글 음절(가 ~ 힣, 11172자)을 글자당 base36 3자리 영문/숫자 문자열로 변환해 query string 길이를 줄임
// 전역에는 KorNameCode 하나만 노출 (KorNameCode.encode, KorNameCode.decode)
const KorNameCode = (function () {
    const HANGUL_BASE = 0xAC00, HANGUL_COUNT = 11172, CODE_LENGTH = 3;

    function encode(name) {
        return Array.from(name).map(ch => (ch.codePointAt(0) - HANGUL_BASE).toString(36).padStart(CODE_LENGTH, '0')).join('');
    }

    // 형식이 맞지 않으면 null 반환
    function decode(code) {
        if (!code || !/^[0-9a-z]+$/.test(code) || code.length % CODE_LENGTH !== 0) {
            return null;
        }
        let name = '';
        for (let i = 0; i < code.length; i += CODE_LENGTH) {
            const offset = Number.parseInt(code.slice(i, i + CODE_LENGTH), 36);
            if (offset >= HANGUL_COUNT) {
                return null;
            }
            name += String.fromCodePoint(HANGUL_BASE + offset);
        }
        return name;
    }

    return Object.freeze({encode, decode});
})();
