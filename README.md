# Infinite Monkey's Cube

「無限の猿定理（Infinite Monkey Theorem）」に着想を得た、30秒ごとにランダムな1手を打ち続けるルービックキューブの自律シミュレーション。

**Demo**: https://kubota0722.github.io/infinite-monkeys-cube-public/

---

## 概要

約4,325京通りの状態空間を持つ3x3ルービックキューブを、一定間隔（30秒）でランダムに回転させ続け、完成を目指すシミュレーションです。

基準日時（Epoch）からの経過時間をもとにシード付き擬似乱数で全手数を算出するため、サーバー通信を行わずにどの端末からアクセスしても同一の盤面・手数が完全に再現されます。

---

## 主な機能

- **決定論的シミュレーション**: 基準時刻とPRNG（擬似乱数生成器）により、端末・時間に関わらず共通の状態を再現
- **3D回転アニメーション**: Three.js / React Three Fiber による滑らかな面の回転
- **完成度トラッキング**: 54枚のステッカーの一致率からゴールへの近さ（%）と直近の推移を算出
- **インタラクティブ視点**: マウスやタッチ操作による360度カメラ回転・ズーム

---

## 技術スタック

- **フレームワーク**: React 19, Vite, TypeScript
- **3Dライブラリ**: Three.js, @react-three/fiber, @react-three/drei
- **スタイル**: Vanilla CSS (Glassmorphism)

---

## 開発環境のセットアップ

### インストール

```bash
git clone https://github.com/kubota0722/infinite-monkeys-cube-public.git
cd infinite-monkeys-cube-public
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```
