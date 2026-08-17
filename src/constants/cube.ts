import type { Move } from '../types/cube';

// ルービックキューブの標準カラー定義
export const COLORS = {
  right: '#dc2626',  // +X: 赤
  left: '#ea580c',   // -X: オレンジ
  top: '#f8fafc',    // +Y: 白
  bottom: '#eab308', // -Y: 黄
  front: '#16a34a',  // +Z: 緑
  back: '#2563eb',   // -Z: 青
  inner: '#0f172a',  // 内側のプラスチック地（濃い紺/黒）
};

// 6面それぞれの外側を指す方向ベクトルの定義
export const FACE_DIRECTIONS = [
  { axis: 'x' as const, dir: 1 },  // 右面 (+X)
  { axis: 'x' as const, dir: -1 }, // 左面 (-X)
  { axis: 'y' as const, dir: 1 },  // 上面 (+Y)
  { axis: 'y' as const, dir: -1 }, // 下面 (-Y)
  { axis: 'z' as const, dir: 1 },  // 前面 (+Z)
  { axis: 'z' as const, dir: -1 }, // 後面 (-Z)
];

// ルービックキューブの全12パターンの回転定義
export const MOVES: Move[] = [
  { name: 'U (上・時計)', axis: 'y' as const, layer: 1, dir: -1 },
  { name: "U' (上・反時計)", axis: 'y' as const, layer: 1, dir: 1 },
  { name: 'D (下・時計)', axis: 'y' as const, layer: -1, dir: 1 },
  { name: "D' (下・反時計)", axis: 'y' as const, layer: -1, dir: -1 },
  { name: 'R (右・時計)', axis: 'x' as const, layer: 1, dir: -1 },
  { name: "R' (右・反時計)", axis: 'x' as const, layer: 1, dir: 1 },
  { name: 'L (左・時計)', axis: 'x' as const, layer: -1, dir: 1 },
  { name: "L' (左・反時計)", axis: 'x' as const, layer: -1, dir: -1 },
  { name: 'F (前・時計)', axis: 'z' as const, layer: 1, dir: -1 },
  { name: "F' (前・反時計)", axis: 'z' as const, layer: 1, dir: 1 },
  { name: 'B (後・時計)', axis: 'z' as const, layer: -1, dir: 1 },
  { name: "B' (後・反時計)", axis: 'z' as const, layer: -1, dir: -1 },
];

// 基準開始日時
export const EPOCH_START_TIME = new Date('2026-01-01T00:00:00Z').getTime();
export const INTERVAL_SEC = 30;
export const INTERVAL_MS = INTERVAL_SEC * 1000;
