import type { StepHistoryItem } from '../types/cube';

interface StatusPanelProps {
  stepCount: number;
  score: number;
  correctStickers: number;
  totalStickers: number;
  timeLeft: number;
  history: StepHistoryItem[];
}

export function StatusPanel({
  stepCount,
  score,
  correctStickers,
  totalStickers,
  timeLeft,
  history,
}: StatusPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        width: 'min(94vw, 860px)',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '20px',
        padding: '16px 24px',
        boxShadow:
          '0 20px 40px -12px rgba(15, 23, 42, 0.1), 0 1px 3px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        color: '#1e293b',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* 1. 完成度セクション */}
      <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              letterSpacing: '0.02em',
            }}
          >
            完成度
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}
          >
            {correctStickers} / {totalStickers}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: score === 100 ? '#16a34a' : '#2563eb',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {score}%
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>一致</span>
        </div>

        {/* プログレスバー */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              width: `${score}%`,
              height: '100%',
              background:
                score === 100
                  ? '#16a34a'
                  : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              borderRadius: '999px',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      {/* 区切り線 */}
      <div
        style={{
          width: '1px',
          height: '48px',
          background: '#e2e8f0',
          display: 'block',
        }}
      />

      {/* 2. カウントダウン & 手数 */}
      <div
        style={{
          flex: '0 1 180px',
          minWidth: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '4px',
          }}
        >
          次回回転まで
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0f172a',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {timeLeft}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>秒</span>
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '4px',
            fontFamily: 'monospace',
          }}
        >
          累計: <strong>{stepCount.toLocaleString()}</strong> 手
        </div>
      </div>

      {/* 区切り線 */}
      <div
        style={{
          width: '1px',
          height: '48px',
          background: '#e2e8f0',
          display: 'block',
        }}
      />

      {/* 3. 完成度の推移 (ステップごとの%推移) */}
      <div style={{ flex: '1.5 1 260px', minWidth: '240px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>完成度の推移（直近）</span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>新 → 旧</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {history.length === 0 ? (
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>計算中...</span>
          ) : (
            history.slice(0, 5).map((item, idx) => {
              const isLatest = idx === 0;

              return (
                <div
                  key={item.step}
                  style={{
                    flex: '1 0 auto',
                    background: isLatest ? '#eff6ff' : '#f8fafc',
                    border: isLatest
                      ? '1px solid #bfdbfe'
                      : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: '65px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: isLatest ? '#2563eb' : '#94a3b8',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{item.step.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: isLatest ? '#1d4ed8' : '#334155',
                      fontFamily: 'monospace',
                      marginTop: '2px',
                    }}
                  >
                    {item.score}%
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


