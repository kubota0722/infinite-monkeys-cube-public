import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import type { CubieData } from '../types/cube';
import { COLORS } from '../constants/cube';

interface CubieMeshProps {
  cubie: CubieData;
}

export const CubieMesh = forwardRef<THREE.Mesh, CubieMeshProps>(function CubieMesh(
  { cubie },
  ref
) {
  const [ix, iy, iz] = cubie.initialPos;

  // 初期値が外側に面していた部分だけ色を塗り、内側は黒にする
  const materials = useMemo(() => {
    const createMat = (color: string) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.1,
      });

    return [
      createMat(ix === 1 ? COLORS.right : COLORS.inner),
      createMat(ix === -1 ? COLORS.left : COLORS.inner),
      createMat(iy === 1 ? COLORS.top : COLORS.inner),
      createMat(iy === -1 ? COLORS.bottom : COLORS.inner),
      createMat(iz === 1 ? COLORS.front : COLORS.inner),
      createMat(iz === -1 ? COLORS.back : COLORS.inner),
    ];
  }, [ix, iy, iz]);

  return (
    <mesh
      ref={ref}
      position={cubie.pos}
      quaternion={cubie.quaternion}
      material={materials}
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} />
    </mesh>
  );
});

