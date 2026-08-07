# Neutron Browser 官网

Neutron Browser（`我的开发/02 我的PC浏览器`）的展示官网，纯静态站点（HTML + CSS + JS，无任何依赖、无需构建）。

## 🌐 线上地址（已部署）

> **https://2818194829.github.io/neutron-browser-site/**

- 托管：GitHub Pages（免费）
- 仓库：https://github.com/2818194829/neutron-browser-site
- 部署方式：`main` 分支根目录直接发布

## 本地开发与更新流程

修改代码后，本地预览确认无误，然后推送即可自动发布（GitHub Pages 约 1-2 分钟生效）：

```bash
cd "03 Neutron浏览器官网"
git add -A
git commit -m "update site"
git push origin main
```

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
6. **下载**：Windows 安装包下载（GitHub Release 直链 v1.8.3，约 77 MB）+ 安装说明
7. **更新日志**：v1.8.3 亮点
8. **CTA + 页脚**：下载引导、GitHub 链接、MIT 协议

## 版本发布后需要更新

发布新版本时同步修改 `index.html` 中的三处：

1. `hero` 区的版本徽章与 `hero__meta`（当前版本号）
2. 下载区按钮的直链：`.../releases/download/vX.Y.Z/Neutron-Browser-Setup-X.Y.Z.exe`
3. 下载卡片中的版本 / 大小文字

## 部署（已完成）

当前使用 **GitHub Pages** 免费部署：

1. 新建仓库 `neutron-browser-site` 并推送 `main` 分支
2. 仓库 Settings → Pages → Source 选择 `main` / root（或通过 API 开启）
3. 生成网址：`https://2818194829.github.io/neutron-browser-site/`

如需自定义域名：购买域名后，在仓库 Pages 设置里添加 CNAME（如 `www.xxx.cn` → `2818194829.github.io`），并把域名写入仓库根目录 `CNAME` 文件即可。

