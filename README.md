# minigames

> 一分支一游戏：每个分支是一个独立小游戏。当前默认分支 `framework` 是基于 Pixi v8 的小游戏框架 demo。

同一份源码构建三端：**H5 / 微信小游戏 / 抖音小游戏**。CI 完成构建后把产物上传到 Cloudflare R2，并将元数据上报给发布中控台；发布动作由人在中控台发起，不跟着 commit 走。

## 分支

| 分支 | 内容 |
| --- | --- |
| `framework`（默认） | Pixi v8 + 平台适配层的小游戏框架 demo |
| 其他 | 每个游戏一个分支。构建参数（游戏 slug、上传目录）是每次构建的输入，不绑在仓库配置上 |

## 技术栈

- [Pixi v8](https://pixijs.com/) + TypeScript + Vite 5
- 平台适配层 `src/platform/`：编译期按 `__PLATFORM__`（`web` / `wechat` / `douyin`）注入，业务代码不写平台分支
- Vitest / ESLint / Prettier

## 本地开发

```bash
npm ci
npm run dev            # H5 开发服务器
npm run build:h5       # 只构建 H5
npm run build:wechat   # 只构建微信小游戏
npm run build:douyin   # 只构建抖音小游戏
npm run build          # 类型检查 + 构建全部三端
npm run test           # Vitest
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
```

小游戏产物在 `dist/<platform>/`：`game.js` + `game.json` + `project.config.json`（微信另有 `project.private.config.json`），用对应平台的开发者工具直接打开该目录。小游戏主包超过 4MB 时构建脚本会告警。

## 发布流水线

定义在 [.github/workflows/release.yml](.github/workflows/release.yml)。职责边界：**CI 只构建与登记，发布由人在中控台发起**。

### 触发

| 方式 | 说明 |
| --- | --- |
| 手动（workflow_dispatch） | `game_slug`（必填，中控台登记的游戏 slug）、`upload_dir`（可选，bucket 内目录，留空按 `游戏/平台/` 组织）、`platform`（all / h5 / wechat / douyin）、`upload`（取消勾选只构建并把 zip 挂成 Actions artifact，不碰 R2 与中控台） |
| 推标签 | tag 名即游戏来源：`<game-slug>-v<版本>`（例如 `demo-v1.0.1`）构建全部平台，游戏取自 tag 名；纯 `v1.0.1` 不触发 |

### 流程（按平台并行，互不连坐）

`vite build` → 在产物目录内打 zip（`game.js` 在压缩包根层，开发者工具直接识别）→ 计算 sha256 / size → 上传 R2 → 按公开地址回读 200 校验 → `POST /api/ci/builds` 上报中控台。上报幂等键是 `game + packageType + buildId`：重跑同一次构建覆盖既有记录，不会堆积重复条目。

### 凭据与配置

- **R2 五件套**（account_id / bucket / public_base_url / access_key_id / secret_access_key）不存本仓库：CI 用 [lyzz0612/shared-workflows](https://github.com/lyzz0612/shared-workflows) 的 `fetch-secrets@v1` 凭 GitHub OIDC 从 [Secret Gate](https://secret-gate.skyup.top)（源码 [lyzz0612/secret-gate](https://github.com/lyzz0612/secret-gate)）拉取 `cf/r2` 组，写入 `CF_R2_*` 环境变量并在日志中打码。首次运行会自动登记为 guest 并在导出处失败——去 gate 后台把本仓库身份提级 normal 并授权 `cf/r2` 组，再跑即绿。
- 本仓库只需要两个配置：

| 类型 | 名称 | 用途 |
| --- | --- | --- |
| Variable | `CONSOLE_URL` | 发布中控台地址 |
| Secret | `CONSOLE_CI_KEY` | 中控台「设置 → CI key」的值 |

## 许可

MIT（[package.json](package.json) 声明；暂无独立 LICENSE 文件）。
