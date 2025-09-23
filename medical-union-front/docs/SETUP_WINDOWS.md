# Windows 环境快速配置（medical-union-front）

这个文档说明如何在 Windows 环境中快速配置并运行前端开发服务器。仓库包含一个辅助脚本 `scripts/setup-windows.ps1`，用于自动化依赖安装与生成示例环境文件。

步骤

1. 克隆仓库并进入项目目录：

```powershell
git clone <your-repo-url> medical-union-front
cd medical-union-front
```

2. 运行配置脚本（PowerShell）

```powershell
# 在项目根目录运行
.\scripts\setup-windows.ps1
```

脚本完成后会提示你如何启动 mock server 与开发服务器：

- 在单独终端中启动 mock server：

```powershell
npm run mock
```

- 在另一终端中启动 dev server：

```powershell
npm run dev
```

可选：同时启动（不推荐在同一终端中交互）

```powershell
Start-Process -NoNewWindow -FilePath 'cmd' -ArgumentList '/c npm run mock'
npm run dev
```

说明

- 该项目使用 Vite；默认 dev 端口由 Vite 决定（通常是 5173），mock server 在本项目使用 `json-server`，监听 4000 端口（脚本和 .env.local 中推荐）。
- 脚本会在没有 `.env.local` 时生成一个示例文件：`VITE_API_BASE_URL=http://localhost:4000`。

如需把启动逻辑放入单个命令（跨平台），建议添加 `concurrently` 或 `npm-run-all` 等辅助工具。
