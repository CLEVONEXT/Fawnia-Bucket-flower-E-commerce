/* ============================================================
   js/qr.js — Pembuat QR code (tanpa library eksternal)
   Implementasi QR Model 2, level M, versi otomatis 1-10.
   Dipakai untuk QR pembayaran di halaman struk.
   ============================================================ */

const FawniaQr = {
  /* Galois field GF(256) */
  _EXP: (() => {
    const exp = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    exp[255] = exp[0];
    return exp;
  })(),
  _LOG: (() => {
    const exp = [];
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp.push(x);
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    const log = new Array(256);
    exp.forEach((v, i) => (log[v] = i));
    return log;
  })(),

  _mul(a, b) {
    if (!a || !b) return 0;
    return this._EXP[(this._LOG[a] + this._LOG[b]) % 255];
  },

  /* Reed-Solomon generator polinomial */
  _rsGen(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      poly.forEach((c, j) => {
        next[j] ^= this._mul(c, 1);
        next[j + 1] ^= this._mul(c, this._EXP[i]);
      });
      poly = next;
    }
    return poly;
  },

  _rsEncode(data, degree) {
    const gen = this._rsGen(degree);
    const res = new Array(degree).fill(0);
    data.forEach((b) => {
      const factor = b ^ res[0];
      res.shift();
      res.push(0);
      if (factor)
        gen.slice(1).forEach((g, i) => (res[i] ^= this._mul(g, factor)));
    });
    return res;
  },

  /* Tabel kapasitas byte (level M), versi 1-10 */
  _capacity(ver) {
    return [14, 26, 42, 62, 84, 106, 122, 152, 180, 213][ver - 1];
  },
  _ecCount(ver) {
    /* blok & EC per blok level M */
    const info = {
      1: [1, 16],
      2: [1, 28],
      3: [1, 44],
      4: [2, 32],
      5: [2, 43],
      6: [4, 27],
      7: [4, 31],
      8: [2, 38],
      9: [3, 36],
      10: [4, 43],
    };
    const [blocks, per] = info[ver];
    return blocks * per;
  },

  generate(text) {
    /* pilih versi terkecil yang muat */
    const bytes = new TextEncoder().encode(text);
    let ver = 1;
    while (
      ver <= 10 &&
      bytes.length + 2 > this._capacity(ver) - this._ecCount(ver)
    )
      ver++;
    if (ver > 10) throw new Error("Data terlalu panjang untuk QR");

    const size = ver * 4 + 17;
    const modules = Array.from({ length: size }, () =>
      new Array(size).fill(null),
    );

    /* --- Function patterns --- */
    const setFinder = (r, c) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const rr = r + dr,
            cc = c + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          const inRing =
            (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
            (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6));
          const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          modules[rr][cc] = inRing || inCore ? 1 : 0;
        }
      }
    };
    setFinder(0, 0);
    setFinder(0, size - 7);
    setFinder(size - 7, 0);

    /* alignment patterns */
    const alignPos = {
      1: [],
      2: [6, 18],
      3: [6, 22],
      4: [6, 26],
      5: [6, 30],
      6: [6, 34],
      7: [6, 22, 38],
      8: [6, 24, 42],
      9: [6, 26, 46],
      10: [6, 28, 50],
    }[ver];
    for (const r of alignPos) {
      for (const c of alignPos) {
        if (
          modules[r]?.[c] !== null &&
          !(r === 6 && (c === 6 || c === size - 7)) &&
          !(r === size - 7 && c === 6)
        )
          continue;
        if (
          (r === 6 && (c <= 6 || c >= size - 7)) ||
          (c === 6 && (r <= 6 || r >= size - 7))
        )
          continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            modules[r + dr][c + dc] =
              Math.max(Math.abs(dr), Math.abs(dc)) === 1 ? 0 : 1;
          }
        }
      }
    }

    /* timing patterns */
    for (let i = 8; i < size - 8; i++) {
      if (modules[6][i] === null) modules[6][i] = i % 2 === 0 ? 1 : 0;
      if (modules[i][6] === null) modules[i][6] = i % 2 === 0 ? 1 : 0;
    }
    /* dark module */
    modules[size - 8][8] = 1;

    /* --- Data encoding (mode byte) --- */
    const dataBits = [];
    const push = (val, len) => {
      for (let i = len - 1; i >= 0; i--) dataBits.push((val >> i) & 1);
    };
    push(0b0100, 4); // mode byte
    push(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach((b) => push(b, 8));

    const capBits = (this._capacity(ver) - this._ecCount(ver)) * 8;
    /* terminator + padding */
    for (let i = 0; i < 4 && dataBits.length < capBits; i++) dataBits.push(0);
    while (dataBits.length % 8) dataBits.push(0);
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (dataBits.length < capBits) {
      push(padBytes[padIdx++ % 2], 8);
    }
    const dataCodewords = [];
    for (let i = 0; i < dataBits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | dataBits[i + j];
      dataCodewords.push(b);
    }

    /* --- Error correction --- */
    const [blocks, per] = {
      1: [1, 16],
      2: [1, 28],
      3: [1, 44],
      4: [2, 32],
      5: [2, 43],
      6: [4, 27],
      7: [4, 31],
      8: [2, 38],
      9: [3, 36],
      10: [4, 43],
    }[ver];
    const blockLen = dataCodewords.length / blocks;
    const ecCodewords = [];
    for (let b = 0; b < blocks; b++) {
      const chunk = dataCodewords.slice(b * blockLen, (b + 1) * blockLen);
      ecCodewords.push(...this._rsEncode(chunk, per));
    }

    /* interleave */
    const final = [];
    const maxData = Math.max(
      ...Array.from({ length: blocks }, (_, b) => blockLen),
    );
    for (let i = 0; i < maxData; i++)
      for (let b = 0; b < blocks; b++)
        if (i < blockLen) final.push(dataCodewords[b * blockLen + i]);
    for (let i = 0; i < per; i++)
      for (let b = 0; b < blocks; b++) final.push(ecCodewords[b * per + i]);

    /* --- Penempatan data (zigzag dari kanan-bawah) --- */
    let bitIdx = 0;
    const totalBits = final.length * 8;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip kolom timing
      for (let row = 0; row < size; row++) {
        for (const r of [row, size - 1 - row]) {
          for (const c of [col, col - 1]) {
            if (modules[r][c] === null) {
              modules[r][c] =
                bitIdx < totalBits
                  ? (final[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1
                  : 0;
              bitIdx++;
            }
          }
        }
      }
    }

    /* --- Mask 0 + format info --- */
    const mask = (r, c) =>
      (r + c) % 2 === 0 ? modules[r][c] ^ 1 : modules[r][c];
    /* level M (00) + mask 0 (000) -> format bits */
    const fmtBitsRaw = 0b00000; // (level M = 00, mask 0)
    const fmtG = 0b10100111111;
    let fmt = fmtBitsRaw << 10;
    for (let i = 10; i >= 0; i--) {
      if ((fmt >> i) & 1) fmt ^= (fmtG << (i - 10)) & 0x7ff;
    }
    const fmtBits = ((fmtBitsRaw << 10) ^ fmt) | 0b101010000010010;
    const bits = [];
    for (let i = 14; i >= 0; i--) bits.push((fmtBits >> i) & 1);

    const place = (r, c, v) => {
      if (modules[r]?.[c] !== undefined) modules[r][c] = v;
    };
    /* sekitar finder kiri-atas */
    for (let i = 0; i <= 5; i++) place(8, i, bits[i]);
    place(8, 7, bits[6]);
    place(8, 8, bits[7]);
    place(7, 8, bits[8]);
    for (let i = 9; i < 15; i++) place(14 - i, 8, bits[i]);
    /* kanan-atas */
    for (let i = 0; i < 8; i++) place(8, size - 1 - i, bits[i]);
    /* kiri-bawah */
    for (let i = 0; i < 7; i++) place(size - 15 + i, 8, bits[i]);

    /* --- Render SVG --- */
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`;
    svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;
    svg += `<path fill="#1c1712" d="`;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c]) svg += `M${c} ${r}h1v1h-1z`;
      }
    }
    svg += `"/></svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  },

  dataUrl(text) {
    try {
      return this.generate(text);
    } catch (e) {
      /* fallback: placeholder */
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#fff"/><text x="100" y="100" text-anchor="middle" font-size="12" fill="#a94b42">QR error</text></svg>`;
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    }
  },
};

window.FawniaQr = FawniaQr;
