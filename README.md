# DeskPet M0/M1

DeskPet 当前只完成 M0/M1：基于 PawPal `v0.1.3` 的 Windows 桌宠壳验证和安全清理。

本阶段保留：

- 透明、无边框、置顶宠物窗口
- 托盘菜单
- 设置窗口
- 休息提醒
- 喝水提醒
- 手动专注计时器
- 本地设置和统计
- Windows 绿色分发优先的 portable/zip 打包配置

本阶段不做：

- M2 自定义素材接入
- 完整 Phase 1
- 应用内 AI 生图
- 双端同步
- 自动专注/分心检测
- 读取前台应用、窗口标题、进程、截图、OCR、键鼠输入
- 默认开机自启、自动更新、提权安装、隐藏后台服务

## 来源

- 上游仓库: `https://github.com/zebangeth/PawPal`
- 导入 tag: `v0.1.3`
- 导入 commit: `7cb44da708f2488d9587140554c486173145907a`
- 源码许可证: MIT，见 [LICENSE](LICENSE)
- 素材授权: 独立风险，见 [ASSET_LICENSE.md](ASSET_LICENSE.md) 和 [docs/pawpal-source-audit.md](docs/pawpal-source-audit.md)

## 开发

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## 检查

```bash
pnpm typecheck
pnpm build
pnpm dist:win
pnpm dist:win:installer
```

`pnpm dist:win` 默认只产出 portable/zip。NSIS installer 需要显式运行 `pnpm dist:win:installer`，只能作为次选，不能作为绿色包默认推荐。

## 文档

- [docs/privacy-and-safety.md](docs/privacy-and-safety.md)
- [docs/pawpal-source-audit.md](docs/pawpal-source-audit.md)
- [docs/dependency-audit.md](docs/dependency-audit.md)
- [specs/deskpet-phase1.md](specs/deskpet-phase1.md)
