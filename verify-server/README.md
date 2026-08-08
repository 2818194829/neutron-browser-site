# Neutron Browser 验证码后端服务

Neutron Browser 的验证码统一由本服务发送与校验，**站长在本服务的管理页配置发件渠道（SMTP 邮箱 / Twilio 短信），浏览器用户无需（也不可）配置**。

## 快速开始（本地）

```bash
cd verify-server
npm install
npm start
```

- 服务地址：`http://localhost:3000`
- 站长管理页：`http://localhost:3000/admin`（首次启动时终端会打印管理令牌，用它登录）
- 首次启动自动生成 `config.json`（含管理令牌 + 空配置），请妥善保管令牌

## 配置发送渠道（站长）

登录 `/admin` 管理页：

1. **邮箱验证码（SMTP）**：启用 → 填 SMTP 服务器/端口/发件账号/授权码 → 「发送测试邮件」验证
   - QQ 邮箱：`smtp.qq.com:465`，授权码在 mail.qq.com → 设置 → 账户 → 开启 POP3/SMTP 获取
   - 163/126/Gmail 同理
2. **手机短信验证码（Twilio）**：启用 → 填 Account SID / Auth Token / 发送号码（E.164）→ 测试
   - 国内大厂短信一般需企业认证；个人可选 Twilio（按条付费）

## 让浏览器连上本服务

在浏览器设置数据（`settings.json`）中设置 `verifyServerUrl` 为本服务地址：

```json
{ "verifyServerUrl": "http://localhost:3000" }
```

或修改浏览器 `src/main/verifyCode.js` 中的 `DEFAULT_SERVER` 后重新打包。

## 部署到云端（Render 免费计划，推荐）

> 注意：官网本身是 GitHub Pages（纯静态，不能跑后端）。验证码后端需部署到支持 Node 的平台，推荐 **Render 免费计划**（无需信用卡）。

**步骤：**
1. 把 `verify-server` 目录推到你的 GitHub 仓库（`config.json` 已被 `.gitignore` 排除，不会提交）
2. 打开 [render.com](https://render.com) 注册/登录 → New → **Blueprint**（或 New Web Service）
3. 选择该仓库 → Render 识别 `render.yaml` → 创建服务（免费计划）
4. 部署完成后，在服务页 **Environment** 里填写环境变量（`sync:false` 的项）：
   - `ADMIN_TOKEN`：你的管理令牌（任意长随机串，登录 `/admin` 用）
   - 邮箱：`VERIFY_EMAIL_ENABLED=true`、`VERIFY_EMAIL_HOST=smtp.qq.com`、`VERIFY_EMAIL_PORT=465`、`VERIFY_EMAIL_USER=你的邮箱`、`VERIFY_EMAIL_PASS=授权码`、`VERIFY_EMAIL_FROM`（可选）
   - 短信（可选）：`VERIFY_SMS_ENABLED`、`VERIFY_SMS_SID`、`VERIFY_SMS_TOKEN`、`VERIFY_SMS_FROM`
5. 保存并重新部署 → 得到线上地址 `https://xxx.onrender.com`
6. 把浏览器 `verifyServerUrl` 指向它（`settings.json` 或改 `src/main/verifyCode.js` 的 `DEFAULT_SERVER` 后重新打包）

**云端配置两种方式（任选）：**
- **环境变量**（推荐，云端）：Render Dashboard Environment 填写，稳定持久，见上
- **管理页**（本地）：`/admin` 写入 `config.json`；云端实例磁盘不持久，重启会被环境变量覆盖

**注意：** 验证码存于进程内存，重启清空（免费实例休眠后会清空，可接受）。免费实例约 15 分钟无访问会休眠，再次访问自动唤醒（首次约 30s）。

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/verify/send` | 发送验证码（浏览器调用，body: `{account}`） |
| POST | `/api/verify/check` | 校验验证码（body: `{account, code}`） |
| GET | `/api/admin/config?token=` | 获取当前配置（脱敏） |
| POST | `/api/admin/config?token=` | 保存配置（`******` 表示不修改密码） |
| POST | `/api/admin/test?token=` | 测试发送 |
| GET | `/admin` | 站长管理页 |
