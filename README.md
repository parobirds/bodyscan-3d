# BodyScan 3D · 摄像头三维人体建模

基于 React + TypeScript + Vite + Three.js + MediaPipe Pose Landmarker 的纯前端三维人体建模 Web 应用。

打开摄像头，AI 实时识别 33 个人体关键点，30 秒内完成正/侧/背三视角采集，自动构建可交互的三维人体模型并估算身体尺寸。全程本地推理，隐私不上云。

## 功能特性

- **摄像头采集**：浏览器原生 `getUserMedia` + MediaPipe Pose Landmarker (WASM + GPU)
- **姿态识别**：33 个关键点实时推理，骨架叠加显示，置信度颜色映射
- **三视角采集**：正/侧/背三视角状态机，置信度达标 + 稳定 2s 自动捕获
- **三维建模**：Three.js + React Three Fiber 程序化生成人体模型（胶囊体/球体拼接）
- **尺寸估算**：身高、肩宽、臂展、围度（经验公式）、体型分类、BMI
- **数据导出**：JSON 完整数据 / PNG 模型截图
- **历史记录**：localStorage 保存最近 5 次扫描对比

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript + Vite 6 |
| 样式 | Tailwind CSS 3 |
| 状态 | Zustand |
| 路由 | react-router-dom 7 |
| 3D | three + @react-three/fiber + @react-three/drei |
| 姿态识别 | @mediapipe/tasks-vision |
| 图标 | lucide-react |

## 本地开发

**前置要求**：Node.js ≥ 18，pnpm ≥ 9

```bash
pnpm install
pnpm run dev      # 启动开发服务器 http://localhost:5173
pnpm run build    # 生产构建到 dist/
pnpm run preview  # 预览生产构建
```

## 部署

### 方式一：Railway（推荐）

本项目已包含 Railway 部署配置文件：
- [`nixpacks.toml`](./nixpacks.toml) — Nixpacks 构建配置
- [`railway.toml`](./railway.toml) — Railway 服务配置
- [`nginx.conf`](./nginx.conf) — nginx 静态托管配置（含 SPA 路由回退）
- [`Dockerfile`](./Dockerfile) — 可选的 Docker 构建方案

**部署步骤**：

1. 将代码推送到 GitHub 仓库（见下方）
2. 访问 [railway.app](https://railway.app) 并登录
3. 点击 **New Project → Deploy from GitHub repo**
4. 选择你的 `bodyscan-3d` 仓库
5. Railway 会自动检测 `nixpacks.toml` / `railway.toml` 并构建
6. 在服务设置的 **Networking** 中生成公开域名
7. 访问 Railway 提供的 URL 即可使用

> 不需要设置任何环境变量。Railway 会自动注入 `PORT` 环境变量，nginx 会监听该端口。

**一键部署按钮**（推送到 GitHub 后可在 README 中点击）：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### 方式二：Vercel / Netlify / Cloudflare Pages

由于是纯前端静态站点，可直接部署到任何静态托管服务：

```bash
pnpm run build
# 将 dist/ 目录部署到任意静态托管服务
```

| 平台 | 构建命令 | 输出目录 |
|------|----------|----------|
| Vercel | `pnpm run build` | `dist` |
| Netlify | `pnpm run build` | `dist` |
| Cloudflare Pages | `pnpm run build` | `dist` |

### 方式三：Docker

```bash
docker build -t bodyscan-3d .
docker run -p 8080:8080 -e PORT=8080 bodyscan-3d
# 访问 http://localhost:8080
```

## 推送到 GitHub

### 1. 在 GitHub 创建新仓库

访问 [github.com/new](https://github.com/new)，仓库名设为 `bodyscan-3d`，**不要**勾选初始化 README。

### 2. 在本地推送代码

```bash
# 进入项目目录
cd bodyscan-3d

# 添加远程（替换 YOUR_USERNAME）
git remote add origin git@github.com:YOUR_USERNAME/bodyscan-3d.git

# 推送
git push -u origin main
```

> 如果项目代码尚未在本地，请先从沙箱环境同步所有文件到本地，然后执行：
> ```bash
> git init -b main
> git add -A
> git commit -m "feat: BodyScan 3D initial commit"
> git remote add origin git@github.com:YOUR_USERNAME/bodyscan-3d.git
> git push -u origin main
> ```

## 项目结构

```
src/
├── components/
│   ├── Navigation.tsx          # 侧边导航
│   ├── ScanOverlay.tsx         # 摄像头关键点叠加层
│   └── model/
│       ├── HumanModel.tsx      # 三维人体模型（程序化几何体）
│       └── ModelScene.tsx      # R3F Canvas + 灯光/网格/控件
├── hooks/
│   ├── useCamera.ts            # getUserMedia 摄像头管理
│   ├── usePoseLandmarker.ts    # MediaPipe Pose 推理循环
│   └── useScanCapture.ts       # 三视角采集状态机
├── pages/
│   ├── Home.tsx                # 首页
│   ├── Scan.tsx                # 扫描采集页
│   ├── Model.tsx               # 三维建模页
│   └── Report.tsx              # 数据报告页
├── store/scanStore.ts          # Zustand 全局状态
├── types/scan.ts               # 类型定义 + 关键点索引
└── utils/
    ├── measurements.ts         # 尺寸估算算法
    ├── storage.ts              # localStorage 持久化
    └── demoData.ts             # 演示数据
```

## 隐私说明

- 所有摄像头帧仅在本机推理，**不上传任何服务器**
- MediaPipe 模型文件从 Google CDN 加载（首次访问后浏览器缓存）
- 历史记录存于浏览器 localStorage，仅限当前设备
- 无后端服务、无数据库、无追踪

## 浏览器兼容性

- Chrome / Edge 90+（推荐）
- Firefox 88+
- Safari 14+

需要支持 `getUserMedia`、WebGL2、WebAssembly。

## License

MIT
