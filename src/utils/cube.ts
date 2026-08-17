import * as THREE from 'three';
import type { CubieData, Move } from '../types/cube';
import {
  MOVES,
  EPOCH_START_TIME,
  INTERVAL_MS,
  INTERVAL_SEC,
  FACE_DIRECTIONS,
} from '../constants/cube';

// シード付き擬似乱数
export function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 第N手目の操作を算出
export function getMoveForStep(stepIndex: number): Move {
  const rng = createSeededRandom(stepIndex + 777);
  const moveIndex = Math.floor(rng() * MOVES.length);
  return MOVES[moveIndex];
}

// 27個の初期データを生成
export function createInitialCubies(): CubieData[] {
  const cubies: CubieData[] = [];
  let id = 0;

  // X(-1~1), Y(-1~1), Z(-1~1)のループで27個作る
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          id: id++,
          initialPos: [x, y, z],
          pos: new THREE.Vector3(x, y, z), // 初期位置をセット
          quaternion: new THREE.Quaternion(), // 回転なし
        });
      }
    }
  }
  return cubies;
}

// 事前に計算用の再利用可能なオブジェクトを用意（メモリ再確保をゼロにする）
const reusableRotMatrix = new THREE.Matrix4();
const reusableQuat = new THREE.Quaternion();

export function applySingleMoveInPlace(
  positions: Float32Array,
  quaternions: Float32Array,
  move: Move
) {
  const { axis, layer, dir } = move;
  const angle = (Math.PI / 2) * dir;

  if (axis === 'x') reusableRotMatrix.makeRotationX(angle);
  if (axis === 'y') reusableRotMatrix.makeRotationY(angle);
  if (axis === 'z') reusableRotMatrix.makeRotationZ(angle);

  reusableQuat.setFromRotationMatrix(reusableRotMatrix);
  const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

  // 27個のパーツを走査して更新
  for (let i = 0; i < 27; i++) {
    const posOffset = i * 3;
    const currentLayer = Math.round(positions[posOffset + axisIndex]);

    if (currentLayer === layer) {
      // 1. 位置の更新
      const x = positions[posOffset];
      const y = positions[posOffset + 1];
      const z = positions[posOffset + 2];

      const e = reusableRotMatrix.elements;
      const nx = Math.round(e[0] * x + e[4] * y + e[8] * z + e[12]);
      const ny = Math.round(e[1] * x + e[5] * y + e[9] * z + e[13]);
      const nz = Math.round(e[2] * x + e[6] * y + e[10] * z + e[14]);

      positions[posOffset] = nx;
      positions[posOffset + 1] = ny;
      positions[posOffset + 2] = nz;

      // 2. クォータニオンの合成
      const qOffset = i * 4;
      const qx = quaternions[qOffset];
      const qy = quaternions[qOffset + 1];
      const qz = quaternions[qOffset + 2];
      const qw = quaternions[qOffset + 3];

      const rx = reusableQuat.x,
        ry = reusableQuat.y,
        rz = reusableQuat.z,
        rw = reusableQuat.w;

      const nqx = rx * qw + rw * qx + ry * qz - rz * qy;
      const nqy = ry * qw + rw * qy + rz * qx - rx * qz;
      const nqz = rz * qw + rw * qz + rx * qy - ry * qx;
      const nqw = rw * qw - rx * qx - ry * qy - rz * qz;

      // 毎ステップ長さを 1 に正規化して数値の爆発・NaN化を防止
      const len = Math.hypot(nqx, nqy, nqz, nqw);
      quaternions[qOffset] = nqx / len;
      quaternions[qOffset + 1] = nqy / len;
      quaternions[qOffset + 2] = nqz / len;
      quaternions[qOffset + 3] = nqw / len;
    }
  }
}

// ステッカー向きから完成度を計算する関数
export function calculateCompletionScore(cubies: CubieData[]): {
  score: number;
  correctStickers: number;
  totalStickers: number;
} {
  let correct = 0;
  let total = 0;
  const currentDirection = new THREE.Vector3();

  cubies.forEach((cubie) => {
    const [ix, iy, iz] = cubie.initialPos;

    FACE_DIRECTIONS.forEach(({ axis, dir }) => {
      const isOuterSticker =
        (axis === 'x' && ix === dir) ||
        (axis === 'y' && iy === dir) ||
        (axis === 'z' && iz === dir);

      if (isOuterSticker) {
        total++;
        currentDirection.set(
          axis === 'x' ? dir : 0,
          axis === 'y' ? dir : 0,
          axis === 'z' ? dir : 0
        );
        currentDirection.applyQuaternion(cubie.quaternion);

        const currentVal =
          axis === 'x'
            ? currentDirection.x
            : axis === 'y'
            ? currentDirection.y
            : currentDirection.z;

        if (Math.round(currentVal) === dir) {
          correct++;
        }
      }
    });
  });

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 100;
  return {
    score: percentage,
    correctStickers: correct,
    totalStickers: total,
  };
}

const tempQuat = new THREE.Quaternion();
const tempDirVec = new THREE.Vector3();

// Float32Array 配列から高速に完成度スコアを計算
export function calculateScoreFromQuaternions(quaternions: Float32Array): number {
  let correct = 0;
  let total = 0;
  let id = 0;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const qOffset = id * 4;
        tempQuat.set(
          quaternions[qOffset],
          quaternions[qOffset + 1],
          quaternions[qOffset + 2],
          quaternions[qOffset + 3]
        );

        FACE_DIRECTIONS.forEach(({ axis, dir }) => {
          const isOuter =
            (axis === 'x' && x === dir) ||
            (axis === 'y' && y === dir) ||
            (axis === 'z' && z === dir);

          if (isOuter) {
            total++;
            tempDirVec.set(
              axis === 'x' ? dir : 0,
              axis === 'y' ? dir : 0,
              axis === 'z' ? dir : 0
            );
            tempDirVec.applyQuaternion(tempQuat);

            const currentVal =
              axis === 'x'
                ? tempDirVec.x
                : axis === 'y'
                ? tempDirVec.y
                : tempDirVec.z;

            if (Math.round(currentVal) === dir) {
              correct++;
            }
          }
        });
        id++;
      }
    }
  }
  return total > 0 ? Math.round((correct / total) * 100) : 100;
}


// 1手目から現在までの全手を100%正確にシミュレート
export function restoreExactStateFromEpoch() {
  const now = Date.now();
  const elapsed = Math.max(0, now - EPOCH_START_TIME);
  const totalSteps = Math.floor(elapsed / INTERVAL_MS);
  const secondsIntoCurrentStep = Math.floor((elapsed % INTERVAL_MS) / 1000);
  const currentStepTimeLeft = INTERVAL_SEC - secondsIntoCurrentStep;

  // 高速な連続メモリ配列（Float32Array）を作成
  const positions = new Float32Array(27 * 3);
  const quaternions = new Float32Array(27 * 4);

  let id = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        positions[id * 3] = x;
        positions[id * 3 + 1] = y;
        positions[id * 3 + 2] = z;
        quaternions[id * 4 + 3] = 1; // w = 1 (回転なし)
        id++;
      }
    }
  }

  // 直近5手分の履歴を計算するためのバッファ
  const historyStartStep = Math.max(0, totalSteps - 5);
  const historyScores: { step: number; score: number }[] = [];

  // 1手目から全手数を一瞬で完全計算（数十万手でも数ミリ秒）
  for (let i = 0; i < totalSteps; i++) {
    const move = getMoveForStep(i);
    applySingleMoveInPlace(positions, quaternions, move);

    if (i >= historyStartStep) {
      const score = calculateScoreFromQuaternions(quaternions);
      historyScores.push({ step: i + 1, score });
    }
  }

  // 計算結果を React Three Fiber 用のオブジェクト配列に変換
  const finalCubies: CubieData[] = [];
  id = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        finalCubies.push({
          id: id,
          initialPos: [x, y, z],
          pos: new THREE.Vector3(positions[id * 3], positions[id * 3 + 1], positions[id * 3 + 2]),
          quaternion: new THREE.Quaternion(
            quaternions[id * 4],
            quaternions[id * 4 + 1],
            quaternions[id * 4 + 2],
            quaternions[id * 4 + 3]
          ).normalize(),
        });
        id++;
      }
    }
  }

  return {
    initialCubies: finalCubies,
    currentStep: totalSteps,
    initialTimeLeft: currentStepTimeLeft,
    initialHistory: historyScores.reverse(),
  };
}


// 指定した手をキューブレット配列に適用する関数
export function applyMoveToCubies(cubies: CubieData[], move: Move): CubieData[] {
  const { axis, layer, dir } = move;
  const angle = (Math.PI / 2) * dir;
  const rotMatrix = new THREE.Matrix4();

  if (axis === 'x') rotMatrix.makeRotationX(angle);
  if (axis === 'y') rotMatrix.makeRotationY(angle);
  if (axis === 'z') rotMatrix.makeRotationZ(angle);

  const rotQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

  return cubies.map((c) => {
    if (Math.round(c.pos[axis]) === layer) {
      const newPos = c.pos.clone().applyMatrix4(rotMatrix);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      const newQuat = rotQuat.clone().multiply(c.quaternion).normalize();
      return { ...c, pos: newPos, quaternion: newQuat };
    }
    return c;
  });
}

