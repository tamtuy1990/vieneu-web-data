// Lọc sea_g2p.bin (định dạng SEAP v2): giữ bảng merged + common (Việt + Anh), bỏ các mục tiếng Thái / Indonesia
// (chỉ đường xử lý tiếng Thái/Indonesia đọc tới) và các chuỗi chỉ chúng dùng. Thứ tự hàng giữ nguyên nên tra nhị phân vẫn đúng.
// Chạy: node locTuDien.mjs <vào.bin> <ra.bin>
import fs from 'node:fs';

const [src, dst] = process.argv.slice(2);
const b = fs.readFileSync(src);
const u = (o) => b.readUInt32LE(o);
if (b.toString('latin1', 0, 4) !== 'SEAP' || u(4) !== 2) throw new Error('không phải SEAP v2');
const [stringCount, mergedCount, commonCount, offPos, mergedPos, commonPos] = [u(8), u(12), u(16), u(20), u(24), u(28)];
const strAt = (id) => { const s = 48 + u(offPos + id * 4); let e = s; while (b[e]) e++; return b.subarray(s, e); };

const remap = new Map(); // id cũ → id mới
const pool = [];
let poolLen = 0;
const keep = (id) => {
  if (id >= stringCount) return id; // id ngoài bảng: get_string trả "" — giữ nguyên hành vi
  let n = remap.get(id);
  if (n === undefined) { n = pool.length; remap.set(id, n); const s = strAt(id); pool.push(s); poolLen += s.length + 1; }
  return n;
};
const merged = new Uint32Array(mergedCount * 2);
for (let i = 0; i < mergedCount; i++) { merged[2 * i] = keep(u(mergedPos + i * 8)); merged[2 * i + 1] = keep(u(mergedPos + i * 8 + 4)); }
const common = new Uint32Array(commonCount * 3);
for (let i = 0; i < commonCount * 3; i++) common[i] = keep(u(commonPos + i * 4));

// Bố cục mới: header 48 | chuỗi | bảng offset | merged | common | bảng mục (rỗng)
const offsetsPos = 48 + poolLen;
const newMergedPos = offsetsPos + pool.length * 4;
const newCommonPos = newMergedPos + merged.byteLength;
const sectionsPos = newCommonPos + common.byteLength;
const out = Buffer.alloc(sectionsPos);
out.write('SEAP', 0, 'latin1');
[2, pool.length, mergedCount, commonCount, offsetsPos, newMergedPos, newCommonPos, 0, sectionsPos].forEach((v, i) => out.writeUInt32LE(v, 4 + i * 4));
let p = 48;
pool.forEach((s, i) => { out.writeUInt32LE(p - 48, offsetsPos + i * 4); s.copy(out, p); p += s.length + 1; });
Buffer.from(merged.buffer).copy(out, newMergedPos);
Buffer.from(common.buffer).copy(out, newCommonPos);
fs.writeFileSync(dst, out);
console.log(`chuỗi ${stringCount} → ${pool.length}; ${(b.length / 1e6).toFixed(1)} MB → ${(out.length / 1e6).toFixed(1)} MB`);
