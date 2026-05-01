# Pawse

**一只住在你桌面上的小狗，提醒你休息、喝水、保持专注。**

<!-- 在这里放一张截图或 GIF -->
<!-- ![Pawse Demo](docs/demo.gif) -->

Pawse 是一个 macOS 桌面宠物应用。一只透明的、始终置顶的小狗会待在你的屏幕上，在你需要的时候温柔地提醒你该休息了。

## 功能

- **休息提醒** — 定时提醒你站起来活动一下，小狗会跑过整个屏幕引起你的注意
- **喝水提醒** — 别忘了喝水
- **专注模式** — 检测你当前在用的 app，如果你在刷社交媒体，小狗会来提醒你回去工作
- **多种宠物外观** — 目前有线条小狗和金毛 puppy 两种风格
- **中文 / English** — 支持中英文切换
- **本地数据** — 所有设置和统计数据保存在本地，不联网

## 安装

### 下载 DMG（推荐）

从 [Releases](../../releases) 页面下载最新的 `.dmg` 文件，拖入 Applications 即可使用。

> 首次打开时 macOS 可能提示"无法验证开发者"，请在 系统设置 → 隐私与安全性 中允许打开。
> 专注模式需要授予 Accessibility 权限。

### 从源码运行

```bash
git clone https://github.com/zebangeth/Pawse.git
cd Pawse
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build        # 编译（含类型检查）
pnpm dist         # 编译 + 打包为 .dmg
```

## 技术栈

- Electron + electron-vite
- React 19 + TypeScript
- electron-store（本地持久化）
- electron-builder（打包分发）

## 项目结构

```
src/main/       主进程：窗口管理、托盘菜单、定时器、持久化、专注检测
src/preload/    IPC 桥接层
src/renderer/   React UI（宠物窗口 + 设置窗口）
src/shared/     共享类型、默认配置、i18n、宠物外观定义
pet_assets/     宠物动画素材（GIF）
```

## 开发路线

- [ ] 更多宠物外观
- [ ] 声音效果
- [ ] 开机自启
- [ ] 多显示器适配优化

## 许可

源代码基于 [MIT License](LICENSE)。宠物动画素材有独立的授权说明，详见 [ASSET_LICENSE.md](ASSET_LICENSE.md)。

---

<details>
<summary><b>English</b></summary>

**A tiny desktop dog that helps you pause before you burn out.**

Pawse is a macOS desktop pet app. A transparent, always-on-top dog lives on your screen and gently reminds you to take breaks, drink water, and stay focused.

### Features

- **Break reminders** — timed nudges to get up and move; the dog runs across your screen to get your attention
- **Hydration reminders** — don't forget to drink water
- **Focus mode** — detects what app you're using; if you're on social media, the dog will nudge you back to work
- **Multiple pet styles** — line-drawing dog and golden retriever puppy
- **Chinese / English UI**
- **Local-only data** — settings and stats stay on your machine

### Install

Download the latest `.dmg` from [Releases](../../releases), or run from source:

```bash
git clone https://github.com/zebangeth/Pawse.git
cd Pawse
pnpm install
pnpm dev
```

### License

Source code under [MIT License](LICENSE). Pet animation assets have separate licensing; see [ASSET_LICENSE.md](ASSET_LICENSE.md).

</details>
