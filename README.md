# napcat-plugin-system-status

<p align="center">
  <img src="https://raw.githubusercontent.com/NapNeko/NapCatQQ/main/static/logo.png" width="120" height="120" alt="NapCat Logo" />
</p>

<h1 align="center">napcat-plugin-system-status</h1>

<p align="center">
  <b>一款专为 NapCatQQ / OneBot11 设计的高颜值、高安全性服务器系统运行状态监控与卡片推送插件。</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NapCat-Plugin-blue?style=flat-square" alt="NapCat" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green?style=flat-square" alt="Node" />
  <img src="https://img.shields.io/badge/License-MIT-orange?style=flat-square" alt="License" />
</p>

---

## ✨ 核心特性

- 🖥️ **全维度系统指标采集**：涵盖操作系统发行版/内核、系统架构、虚拟化类型（物理机 / KVM / LXC / Docker 等）、CPU 占用及核心数、内存使用量/百分比、磁盘占用、系统 Load Average（1/5/15 分钟）以及精准的系统开机运行时长。
- 🌐 **多源地理位置与机房识别**：
  - 具备多级双接口容错探针（优先高精度中文地理 API，秒级降级备用源）。
  - 支持 **「当前城市」** 细致提取：精确解析具体省份/地级市；若城市信息缺失或内网环境，自动平滑回退至机房物理节点。
  - 自动识别云厂商机房及自治域网络（如 AS13335、Oracle Cloud、Cloudflare、AWS 等）。
- 🔒 **严格的安全与隐私脱敏**：
  - **IP 智能脱敏**：IPv4 严格按 `xxx.xxx` 模糊处理（仅保留前两段，如 `140.245.xxx.xxx`），IPv6 自动省略后半段，杜绝核心服务器 IP 泄漏。
  - **白名单机制**：支持设置管理员 QQ 白名单及群白名单。非授权用户触发时**完全静默忽略**，对外不暴露 Bot 与服务器信息。
- 💬 **全双工事件感知（支持 Bot 自身消息）**：
  - 不仅支持群聊与好友私聊触发，更深度兼容 OneBot11 `message_sent` 上报。使用手机端登录同一个 QQ 账号在外直接发送指令，也能无缝触发回复。
- 🎨 **现代双模 WebUI 管理控制台**：
  - 基于 React + TailwindCSS + singlefile 构建，深度嵌入 NapCat 官方 Web 框架。
  - 支持明暗自适应主题、实时状态卡片、一键修改配置与白名单管理。

---

## 📸 效果预览

### QQ 聊天端效果
```text
🖥️ 【服务器运行状态】
━━━━━━━━━━━━━━
⚙️ 系统环境：Linux 7.0.0-1010-oracle (arm64)
🧩 虚拟化架构：KVM (虚拟化)
🌐 所属节点：韩国 江原道 春川 / Oracle Cloud Infrastructure
🏙️ 当前城市：韩国 春川市
📌 节点外网：140.245.xxx.xxx
📊 资源占用：
 • CPU 占用：12.5% (4 核心)
 • 内存占用：1.8 GB / 4.0 GB (45.0%)
 • 磁盘占用：18.2 GB / 50.0 GB (36.4%)
 • 系统负载：0.15, 0.22, 0.18
 • 运行时长：15天 6小时 28分 30秒
━━━━━━━━━━━━━━
```

---

## 🎨 自定义插件头像 / 图标

在 NapCat WebUI 的插件管理页面中，插件卡片右侧会显示插件头像。本插件自带专属小猫官帽头像，如果想要更换为您自己的自定义头像，支持以下两种方式：

### 方式 1：直接放置图片（免重新构建，推荐最简）
NapCat 后端支持自动识别插件配置目录下的图标，直接放置即可即时生效：
1. 将准备好的头像图片重命名为 `icon.png`（建议正方形尺寸，如 256x256 或 512x512）。
2. 将图片上传并放置在 NapCat 插件配置目录下：
   ```bash
   # 典型路径为 napcat 运行目录下的 config/plugins/ 目录：
   napcat/config/plugins/napcat-plugin-system-status/icon.png
   ```
3. 刷新 NapCat WebUI 浏览器页面即可生效。

### 方式 2：源码构建时自定义
如果是拉取源码自行构建插件包：
1. 直接替换项目根目录下的 `icon.png` 为您自己的图标文件。
2. 项目的 `package.json` 已配置 `"icon": "icon.png"`，打包脚本会在执行 `npm run build` 时自动将图标同步至 `dist/` 构建产物中。
3. 将打包好的插件部署到 NapCat 即可。

---

## 🚀 安装部署

### 方法一：直接下载 Release 成品安装（推荐）

1. 前往 GitHub Releases 页面，下载最新的 `napcat-plugin-system-status-vX.X.X.zip`。
2. 解压压缩包到 NapCat 的 `plugins` 目录下：
   ```bash
   # 宿主机部署通常位于：
   cd /path/to/napcat/plugins/
   mkdir -p napcat-plugin-system-status
   unzip napcat-plugin-system-status-v1.0.1.zip -d napcat-plugin-system-status/

   # 如果是 Docker 部署：
   docker cp napcat-plugin-system-status.zip <napcat容器名>:/app/napcat/plugins/
   docker exec -it <napcat容器名> sh -c "cd /app/napcat/plugins && unzip napcat-plugin-system-status.zip -d napcat-plugin-system-status"
   ```
3. 重启 NapCat 实例，或在 NapCat WebUI 插件管理界面点击重新加载插件即可。

### 方法二：从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/yuchenfan46/napcat-plugin-system-status.git
cd napcat-plugin-system-status

# 2. 安装构建依赖
npm install
cd src/webui && npm install && cd ../..

# 3. 编译插件与 WebUI
npm run build

# 4. 构建完成后，dist/ 目录即为可部署的完整插件包
```

---

## 📖 使用与指令说明

### 1. 触发指令

| 指令格式 | 说明 | 适用范围 |
| :--- | :--- | :--- |
| `/系统状态` | 默认指令，触发推送当前服务器系统状态面板 | 群聊 / 好友私聊 / Bot自身发送 |
| `自定义指令` | 可在 WebUI 控制台或配置文件中自定义指令前缀 | 群聊 / 好友私聊 / Bot自身发送 |

### 2. 权限说明
- **管理员白名单**：在配置中加入指定 QQ 号，未在白名单内的非授权人员发送指令将完全无任何反馈。
- **自身消息触发**：即便账号在其他客户端登录发送指令，只要配置了 `respond_self: true`，Bot 也会正常捕捉并响应。

---

## ⚙️ 配置文件说明

配置文件路径位于 NapCat 配置目录：`config/plugins/napcat-plugin-system-status/config.json`

```json
{
  "enabled": true,
  "command_prefix": "/系统状态",
  "respond_self": true,
  "whitelist_only": true,
  "whitelist_users": ["12345678"],
  "whitelist_groups": [],
  "show_cpu_model": true,
  "show_kernel": true,
  "show_load": true,
  "show_uptime": true,
  "show_ip": true,
  "show_location": true,
  "show_city": true,
  "show_virt": true,
  "debug": false
}
```

---

## 📄 License

MIT License © 2026 YunBai

---

## ❓ 常见问题：提示 `not in official plugin whitelist` 无法加载？

若在 NapCat 启动日志中出现类似以下警告并导致插件被跳过：
```text
[WARN] [PluginLoader] Rejected napcat-plugin-system-status (napcat-plugin-system-status): not in official plugin whitelist
```

### 🔍 原因说明
这是 **NapCat 官方在近期最新版本中引入的插件 ID 白名单限制**。官方默认仅允许加载内置指定的官方插件，导致非白名单内的第三方插件被拦截。

### 🛠️ 解决方案（任选其一）

#### 方案 A：解除 NapCat 核心的白名单限制（彻底放行所有第三方插件，推荐）
- **Docker 容器环境**：
  ```bash
  docker exec -it <你的napcat容器名> sed -i 's/return "not in official plugin whitelist"/return null/g' /app/napcat/napcat.mjs
  docker restart <你的napcat容器名>
  ```
- **源码 / 单文件运行环境**：
  在 `napcat.mjs` 中搜索 `not in official plugin whitelist`，将该行返回值修改为 `return null;` 后重启 NapCat 即可。

#### 方案 B：借用官方白名单插件 ID（免改核心）
如果你的 NapCat 中未安装官方的 `napcat-plugin-cleaner`，可以直接借用该 ID 伪装放行：
1. 进入 plugins 插件目录，将本插件目录重命名为 `napcat-plugin-cleaner`；
2. 打开插件目录下的 `package.json`，将 `"name": "napcat-plugin-system-status"` 改为 `"name": "napcat-plugin-cleaner"`；
3. 重启 NapCat 即可正常加载。
