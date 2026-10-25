import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, 'data', 'support.json')
TXT_PATH = os.path.join(BASE_DIR, 'data', 'support_st.txt')


def is_excluded(text):
    stripped = text.strip()
    # "-" 또는 "…"만으로 이루어진 값은 제외
    return stripped == '-' or (stripped != '' and set(stripped) == {'…'})


def main():
    with open(JSON_PATH, encoding='utf-8-sig') as f:
        data = json.load(f)

    lines = [item['st'] for item in data['value']
             if 'st' in item and not is_excluded(item['st'])]

    with open(TXT_PATH, 'w', encoding='utf-8') as f:
        for text in lines:
            # 한 줄에 하나씩 출력하기 위해 개행은 이스케이프
            f.write(text.replace('\r', '').replace('\n', '\\n') + '\n')

    print(f'{len(lines)} lines -> {TXT_PATH}')


if __name__ == '__main__':
    main()