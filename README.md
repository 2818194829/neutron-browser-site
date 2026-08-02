# Neutron Browser 官网

Neutron Browser（`我的开发/02 我的PC浏览器`）的展示官网，纯静态站点（HTML + CSS + JS，无任何依赖、无需构建）。

## 目录结构

```text
03 Neutron浏览器官网/
├── index.html        # 官网主页（单页，锚点导航）
├── css/style.css     # 全部样式（深色科技风 + 渐变主题）
├── js/main.js        # 交互脚本（粒子背景 / 滚动动画 / 预览切换 / 主题联动）
└── assets/icon.png   # 浏览器图标（复制自浏览器项目）
```

## 本地预览

直接用浏览器打开 `index.html` 即可，或：

```bash
cd "03 Neutron浏览器官网"
python -m http.server 8000
# 访问 http://localhost:8000
```

## 页面区块

1. **Hero**：品牌标语 + 浏览器窗口 CSS 模拟（多标签 / 地址栏 / 新标签页）
2. **功能特性**：10 张特性卡片（多标签、下载、主题、扩展、书签历史、置顶、更新、快捷键、安全）
3. **主题系统**：7 种强调色 × 12 套皮肤展示，色板悬停实时联动下方预览条
4. **界面预览**：新标签页 / 下载管理 / 历史 / 书签 / 扩展 5 个内置页面模拟，可切换
5. **技术栈**：Electron、原生 JS、electron-builder、JSON 存储、IPC
6. **下载**：Windows 安装包下载（GitHub Release 直链 v1.8.1，约 77 MB）+ 安装说明
7. **更新日志**：v1.8.1 亮点
8. **CTA + 页脚**：下载引导、GitHub 链接、MIT 协议

## 版本发布后需要更新

发布新版本时同步修改 `index.html` 中的三处：

1. `hero` 区的版本徽章与 `hero__meta`（当前版本号）
2. 下载区按钮的直链：`.../releases/download/vX.Y.Z/Neutron-Browser-Setup-X.Y.Z.exe`
3. 下载卡片中的版本 / 大小文字

## 部署建议

- **GitHub Pages**：把本目录推送到仓库，启用 Pages 即可
- **任意静态托管**：Vercel / Netlify / 云服务器 nginx 均可，纯静态零配置
