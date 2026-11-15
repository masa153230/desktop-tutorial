"""キゲンメモのテスト用: EAN-13 のバーコード画像を作る。

  python3 tools/make_kigen_fixture.py 4550182144338 tests/fixtures/kigen-ean13.png

スマホで撮った写真に近づけるため、周りに文字代わりの線を置き、少し傾けてぼかす。
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
G = [s[::-1].translate(str.maketrans('01', '10')) for s in L]
R = [s.translate(str.maketrans('01', '10')) for s in L]
PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']


def bits(code):
    d = [int(c) for c in code]
    out = '101'
    for i in range(6):
        out += (L if PARITY[d[0]][i] == 'L' else G)[d[i + 1]]
    out += '01010'
    for i in range(6):
        out += R[d[i + 7]]
    return out + '101'


def main(code, path):
    b = bits(code)
    m = 5
    img = Image.new('L', (1200, 900), 238)
    dr = ImageDraw.Draw(img)
    x0, y0 = (1200 - len(b) * m) // 2, 330
    dr.rectangle([x0 - 60, y0 - 40, x0 + len(b) * m + 60, y0 + 240], fill=250)
    for i, v in enumerate(b):
        if v == '1':
            dr.rectangle([x0 + i * m, y0, x0 + i * m + m - 1, y0 + 200], fill=20)
    for k in range(6):  # 原材料の文字の代わり
        dr.rectangle([80, 60 + k * 36, 1100 - k * 40, 72 + k * 36], fill=90)
    img = img.rotate(4, resample=Image.BICUBIC, fillcolor=238).filter(ImageFilter.GaussianBlur(1.2))
    img.convert('RGB').save(path)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
