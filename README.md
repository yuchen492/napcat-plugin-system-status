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
| `/系统状态` | 默认标准触发指令（首选） | 私聊、群聊、自身发送 |
| `#系统状态` | 备用触发前缀 | 私聊、群聊、自身发送 |
| `系统状态` | 无前缀直发（可在 Web 控制台配置） | 私聊、群聊、自身发送 |

> 💡 **提示**：如果开启了仅限管理员白名单（默认开启），只有管理员 QQ 发送指令才会有响应，其他账号发送将保持静默。

---

## ⚙️ 配置文件说明

插件首次运行后会在 NapCat 的配置目录生成配置文件 `napcat-plugin-system-status.json`，也可以直接通过 NapCat WebUI 管理后台的**插件设置**可视化修改：

```json
{
  "whitelist_only": true,
  "admin_users": ["2171129194"],
  "allowed_groups": [],
  "allow_self": true,
  "commands": ["/系统状态", "#系统状态", "系统状态"],
  "show_ip": true,
  "show_location": true,
  "show_city": true,
  "show_load": true,
  "show_virtualization": true,
  "custom_header": "🖥️ 【服务器运行状态】",
  "custom_footer": ""
}
```

### 配置项解析

| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `whitelist_only` | boolean | `true` | 是否仅白名单成员可查询。为 `true` 时阻断未经授权的调用 |
| `admin_users` | string[] | `["2171129194"]` | 管理员 QQ 白名单列表（纯数字字符串） |
| `allowed_groups` | string[] | `[]` | 允许查询的 QQ 群号列表（留空表示任意群内只要管理员发都生效） |
| `allow_self` | boolean | `true` | 是否允许当前 Bot QQ 自身发送消息触发（适配手机端同号控制） |
| `commands` | string[] | `[...]` | 触发命令关键字数组 |
| `show_ip` | boolean | `true` | 是否在卡片中显示脱敏后的公网 IP |
| `show_location` | boolean | `true` | 是否显示所属国家/地区及机房运营商 |
| `show_city` | boolean | `true` | 是否显示精细解析的「当前城市」字段 |
| `show_load` | boolean | `true` | 是否展示 1/5/15 分钟系统负载 |
| `show_virtualization` | boolean | `true` | 是否展示虚拟化架构（KVM / LXC / Docker 等） |
| `custom_header` | string | `🖥️ 【服务器运行状态】` | 卡片顶部自定义标题 |
| `custom_footer` | string | `""` | 卡片底部自定义署名/小尾巴 |

---

## 🛠️ 项目技术栈

- **后端运行时**：Node.js ESM / TypeScript / Vite
- **框架适配**：NapCat Plugin Framework (`napcat-types`)
- **前端 WebUI**：React 18 / TailwindCSS / Lucide Icons / Vite Singlefile
- **硬件与网络采集**：Linux `/proc` 原生采样 + Node.js OS 原生模块 + 外部容灾 GeoIP API

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源发布。欢迎提 PR 或 Issue 共同完善！
