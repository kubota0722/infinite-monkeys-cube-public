import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CubieData, Move } from '../types/cube';
import { CubieMesh } from './CubieMesh';
import { applyMoveToCubies } from '../utils/cube';

interface AnimatedRubiksCubeProps {
  cubies: CubieData[];
  currentMove: Move | null;
  onAnimationEnd: (updatedCubies: CubieData[]) => void;
}

// 三次ベジェ曲線による滑らかな加減速 (Ease In Out)
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// 毎フレームのガベージコレクションを避けるための再利用オブジェクト
const reusableAxisVec = new THREE.Vector3();
const reusableRotQuat = new THREE.Quaternion();

export function AnimatedRubiksCube({
  cubies,
  currentMove,
  onAnimationEnd,
}: AnimatedRubiksCubeProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const animProgress = useRef(0);
  const activeMoveRef = useRef<Move | null>(null);

  // currentMove が変化したときにアニメーションを開始
  useEffect(() => {
    if (currentMove) {
      animProgress.current = 0;
      activeMoveRef.current = currentMove;
    } else {
      activeMoveRef.current = null;
    }
  }, [currentMove]);

  // Three.js のレンダーループに完全同期した滑らかなアニメーション
  useFrame((_, delta) => {
    const move = activeMoveRef.current;

    if (!move) {
      // 通常時（回転停止中）: React State の位置と回転を反映
      cubies.forEach((cubie, i) => {
        const mesh = meshRefs.current[i];
        if (mesh) {
          mesh.position.copy(cubie.pos);
          mesh.quaternion.copy(cubie.quaternion);
        }
      });
      return;
    }

    const DURATION = 0.35; // アニメーション時間 (秒)
    animProgress.current += delta / DURATION;
    const progress = Math.min(animProgress.current, 1);
    const ease = easeInOutCubic(progress);

    const { axis, layer, dir } = move;
    const currentAngle = (Math.PI / 2) * dir * ease;

    reusableAxisVec.set(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    reusableRotQuat.setFromAxisAngle(reusableAxisVec, currentAngle);

    // 27個のメッシュの姿勢を直接更新
    cubies.forEach((cubie, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      if (Math.round(cubie.pos[axis]) === layer) {
        // 回転対象の9ピース: 回転をリアルタイム適用
        mesh.position.copy(cubie.pos).applyQuaternion(reusableRotQuat);
        mesh.quaternion.copy(reusableRotQuat).multiply(cubie.quaternion);
      } else {
        // 静止層の18ピース: 元の位置・向きを維持
        mesh.position.copy(cubie.pos);
        mesh.quaternion.copy(cubie.quaternion);
      }
    });

    // 回転完了時
    if (progress >= 1) {
      activeMoveRef.current = null;
      animProgress.current = 0;
      const updatedCubies = applyMoveToCubies(cubies, move);
      onAnimationEnd(updatedCubies);
    }
  });

  return (
    <group>
      {cubies.map((cubie, i) => (
        <CubieMesh
          key={cubie.id}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          cubie={cubie}
        />
      ))}
    </group>
  );
}

