import { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';

import type { CubieData, Move, StepHistoryItem } from './types/cube';
import { EPOCH_START_TIME, INTERVAL_MS, INTERVAL_SEC } from './constants/cube';
import {
  restoreExactStateFromEpoch,
  getMoveForStep,
  calculateCompletionScore,
} from './utils/cube';
import { AnimatedRubiksCube } from './components/AnimatedRubiksCube';
import { StatusPanel } from './components/StatusPanel';

export default function App() {
  // 初回マウント時に現在時刻から復元
  const initialData = useMemo(() => restoreExactStateFromEpoch(), []);

  // 27個のピースの状態 ReactのState
  const [cubies, setCubies] = useState<CubieData[]>(initialData.initialCubies);

  // タイマーと自動回転に関するState
  const [stepCount, setStepCount] = useState<number>(initialData.currentStep);
  const [timeLeft, setTimeLeft] = useState<number>(initialData.initialTimeLeft);
  const [stepHistory, setStepHistory] = useState<StepHistoryItem[]>(
    initialData.initialHistory
  );

  // アニメーション中の手を管理するState
  const [activeMove, setActiveMove] = useState<Move | null>(null);

  const lastExecutedStepRef = useRef<number>(initialData.currentStep);

  // 実時間同期タイマーループ
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, now - EPOCH_START_TIME);
      const currentGlobalStep = Math.floor(elapsed / INTERVAL_MS);
      const remainingSeconds =
        INTERVAL_SEC - Math.floor((elapsed % INTERVAL_MS) / 1000);

      setTimeLeft(remainingSeconds);

      // 30秒の境界を迎えた瞬間にアニメーションを発火
      if (currentGlobalStep > lastExecutedStepRef.current) {
        const nextMove = getMoveForStep(lastExecutedStepRef.current);
        setActiveMove(nextMove);
        setStepCount(currentGlobalStep);
        lastExecutedStepRef.current = currentGlobalStep;
      }
    }, 250); // 0.25秒間隔で同期
    return () => clearInterval(timer);
  }, []);

  // アニメーション完了時のコールバック
  const handleAnimationEnd = useCallback(
    (updatedCubies: CubieData[]) => {
      setCubies(updatedCubies);
      setActiveMove(null);

      // 完成度推移の更新
      const { score: newScore } = calculateCompletionScore(updatedCubies);
      setStepHistory((prev) => [
        { step: lastExecutedStepRef.current, score: newScore },
        ...prev.slice(0, 4),
      ]);
    },
    []
  );


  // 現在の完成度（一致率スコア）の計算
  const { score, correctStickers, totalStickers } = useMemo(() => {
    return calculateCompletionScore(cubies);
  }, [cubies]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background:
          'radial-gradient(circle at 50% 30%, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 左上のミニマルヘッダー (案1) */}
      <header
        style={{
          position: 'absolute',
          top: '28px',
          left: '32px',
          zIndex: 10,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Infinite Monkey's Cube
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500',
            letterSpacing: '0.01em',
            margin: '4px 0 0 0',
          }}
        >
          A continuous random walk to solve the 3x3 Rubik's cube
        </p>
      </header>

      {/* 画面下部のモダンステータスバー */}
      <StatusPanel

        stepCount={stepCount}
        score={score}
        correctStickers={correctStickers}
        totalStickers={totalStickers}
        timeLeft={timeLeft}
        history={stepHistory}
      />

      {/* 3Dキャンバス */}
      <Canvas camera={{ position: [4.8, 3.8, 5.8], fov: 45 }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.6} />
        <directionalLight position={[-10, 10, -8]} intensity={0.9} />
        <directionalLight position={[0, -10, 0]} intensity={0.4} />

        <Suspense fallback={null}>
          <AnimatedRubiksCube
            cubies={cubies}
            currentMove={activeMove}
            onAnimationEnd={handleAnimationEnd}
          />
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.3}
            scale={7}
            blur={2.2}
            far={3.5}
            color="#334155"
          />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={4} maxDistance={20} />
      </Canvas>
    </div>
  );
}

