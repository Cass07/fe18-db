import io
import os
import re
import sys

from openpyxl import load_workbook
from openpyxl.utils import column_index_from_string
from PIL import Image

# ===== 전역 설정 =====
XLSX_PATH = "image/Skills.xlsx"   # 입력 파일 (인자로 덮어쓰기 가능)
SHEET_NAME = None                 # None 이면 첫 번째(활성) 시트
NAME_COLUMN = "B"                 # 파일명으로 사용할 텍스트 열
IMAGE_COLUMN = "C"                # 이미지가 들어있는 열
HEADER_ROWS = 1                   # 건너뛸 헤더 행 수
OUTPUT_DIR = "image/icon"         # 저장 위치
# ====================

INVALID_CHARS = re.compile(r'[\\/:*?"<>|\s]+')


def sanitize(name):
    """공백/파일명 불가 문자를 _ 로 대체."""
    name = INVALID_CHARS.sub("_", str(name).strip())
    return name.strip(".") or "unnamed"


def unique_path(directory, base):
    """같은 이름이 이미 쓰였으면 _2, _3 ... 을 붙임."""
    path = os.path.join(directory, f"{base}.png")
    # i = 2
    #     path = os.path.join(directory, f"{base}_{i}.png")
    #     i += 1
    # unique_path.used.add(path)
    return path


unique_path.used = set()


def extract(xlsx_path):
    wb = load_workbook(xlsx_path)
    ws = wb[SHEET_NAME] if SHEET_NAME else wb.active

    name_col = column_index_from_string(NAME_COLUMN) - 1   # anchor 는 0-based
    image_col = column_index_from_string(IMAGE_COLUMN) - 1

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    saved = 0

    for img in ws._images:
        anchor = img.anchor._from
        if anchor.col != image_col:
            continue
        row = anchor.row + 1  # 1-based
        if row <= HEADER_ROWS:
            continue

        name = ws.cell(row=row, column=name_col + 1).value
        if name is None or str(name).strip() == "":
            print(f"[skip] {row}행: 이름 없음")
            continue

        path = unique_path(OUTPUT_DIR, sanitize(name))
        data = img._data()
        Image.open(io.BytesIO(data)).convert("RGBA").save(path, "PNG")
        saved += 1
        print(f"[save] {row}행 -> {path}")

    print(f"완료: {saved}개 저장")


if __name__ == "__main__":
    extract(sys.argv[1] if len(sys.argv) > 1 else XLSX_PATH)