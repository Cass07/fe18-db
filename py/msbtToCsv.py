import argparse
import csv
import os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def load_map(path, key_col, val_col):
    with open(path, encoding='utf-8-sig', newline='') as f:
        return {r[key_col].strip(): r[val_col].strip() for r in csv.DictReader(f)
                if r.get(key_col)}


def convert(src, dst, name_path, name_m_path, newline_repl):
    names = load_map(name_path, 'jp', 'kr')
    names_m = load_map(name_m_path, 'MPID', 'name')

    with open(src, encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))

    with open(dst, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['label', 'name', 'text'])
        for r in rows:
            pid = (r.get('PID') or '').strip()
            mpid = (r.get('MPID') or '').strip()
            if mpid:
                name = names_m.get(mpid, mpid)
            else:
                name = names.get(pid, pid)
            text = (r.get('text') or '').replace('\r\n', '\n').replace('\r', '\n')
            text = text.replace('\n', newline_repl)
            writer.writerow([r.get('label', ''), name, text])


def main():
    p = argparse.ArgumentParser(description='msbt 변환 CSV를 출력용 CSV로 변환')
    p.add_argument('input', help='원본 CSV 경로')
    p.add_argument('output', help='출력 CSV 경로')
    p.add_argument('--name', default=os.path.join(BASE, 'csv_constant', 'name.csv'),
                   help='PID(jp) -> kr 변환 CSV (en,kr,jp)')
    p.add_argument('--name-m', default=os.path.join(BASE, 'csv_constant', 'name_m.csv'),
                   help='MPID -> name 변환 CSV')
    p.add_argument('--space', action='store_true', help='줄바꿈을 <br> 대신 띄어쓰기로 변환')
    a = p.parse_args()
    convert(a.input, a.output, a.name, a.name_m, ' ' if a.space else '<br>')


if __name__ == '__main__':
    main()

