/**
 * Real Code 128 (set B) barcode: the same encoding as a scannable label.
 * Each pattern lists the widths of bar, space, bar, space… in modules.
 */
const PATTERNS = (
  '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 ' +
  '123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 ' +
  '232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 ' +
  '313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 ' +
  '111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
  '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 ' +
  '114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'
).split(' ');

const START_B = 104;
const START_C = 105;
const STOP = 106;

/**
 * Encodes text and returns the widths of its bars and spaces, in modules ("2112321…").
 * Digits only are encoded two by two (set C), which gives a much shorter barcode.
 */
export function code128(text: string): string {
  const digits = /^(\d\d)+$/.test(text);
  const start = digits ? START_C : START_B;
  const values = digits
    ? (text.match(/\d\d/g) ?? []).map(Number)
    : [...text].map((ch) => {
        const v = ch.charCodeAt(0) - 32;
        if (v < 0 || v > 94) throw new Error(`Caractère impossible à encoder en Code 128 : "${ch}"`);
        return v;
      });
  const checksum = values.reduce((sum, v, i) => sum + v * (i + 1), start) % 103;
  return [start, ...values, checksum, STOP].map((v) => PATTERNS[v]).join('');
}

/** Vector version (for a tilted element): SVG path with 1 unit = 1 module, and the width in modules. */
export function barcodePath(code: string, height: number): { d: string; modules: number } {
  let x = 0;
  let d = '';
  [...code].forEach((w, i) => {
    if (i % 2 === 0) d += `M${x} 0h${w}v${height}h-${w}z`;
    x += Number(w);
  });
  return { d, modules: x };
}

/**
 * Barcode of a label in the "LM26" series: 4 digits (series + number), e.g. 26·07 → "2607".
 * Every label has the same length, so all barcodes have the same width, but a different code.
 */
export const labelBarcode = (series: string, n: number) =>
  code128(`${series.replace(/\D/g, '').slice(-2).padStart(2, '0')}${String(n % 100).padStart(2, '0')}`);
