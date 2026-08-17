import * as THREE from 'three';

export interface CubieData {
  id: number; // ピース固有の番号(0~26)
  initialPos: [number, number, number]; // 生まれた時の初期位置、ピースの色を決めるためだけに使う
  pos: THREE.Vector3; // 現在の3次元位置 (x, y, z)
  quaternion: THREE.Quaternion; // 現在の回転情報 向き・回転
}

export interface Move {
  name: string;
  axis: 'x' | 'y' | 'z';
  layer: number;
  dir: number;
}

export interface StepHistoryItem {
  step: number;
  score: number;
}


