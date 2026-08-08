/**
 * Neutron Browser 验证码后端服务
 * - 站长通过 /admin 管理页统一配置 SMTP / 短信服务（普通浏览器用户不可见）
 * - 浏览器调用 /api/verify/send、/api/verify/check 收发验证码
 * - 验证码由服务端生成存储（10 分钟过期，校验通过即作废）
 *
 * 启动：npm start  （默认端口 3000，可用环境变量 PORT 修改）
 * 部署：可本地常驻运行，或部署到 Render / Railway / Vercel 等支持 Node 的平台
 */
const express = require('express');
const nodemailer = require('nodemailer');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');
const CODE_TTL = 10 * 60 * 1000; // 验证码 10 分钟有效

// ==================== 配置读写 ====================
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}
function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
}

let config = loadConfig();
if (!config.adminToken) {
  config.adminToken = crypto.randomBytes(16).toString('hex');
  config.verifyEmail = { enabled: false, host: '', port: 465, user: '', pass: '', from: '' };
  config.verifySms = { enabled: false, provider: 'twilio', sid: '', token: '', fromNumber: '' };
  saveConfig(config);
  console.log('====================================================');
  console.log('[VerifyServer] 首次启动已生成管理令牌（登录 /admin 使用）：');
  console.log('  ' + config.adminToken);
  console.log('====================================================');
}

/**
 * 云端模式：环境变量优先覆盖 config.json
 * （云端实例磁盘不持久，推荐用环境变量配置；本地仍可用 /admin 管理页写 config.json）
 * 支持：ADMIN_TOKEN、VERIFY_EMAIL_ENABLED/HOST/PORT/USER/PASS/FROM、VERIFY_SMS_ENABLED/SID/TOKEN/FROM
 */
function applyEnvOverrides(cfg) {
  if (process.env.ADMIN_TOKEN) cfg.adminToken = process.env.ADMIN_TOKEN;
  if (!cfg.verifyEmail) cfg.verifyEmail = { enabled: false, host: '', port: 465, user: '', pass: '', from: '' };
  if (!cfg.verifySms) cfg.verifySms = { enabled: false, provider: 'twilio', sid: '', token: '', fromNumber: '' };
  const env = process.env;
  if (env.VERIFY_EMAIL_ENABLED !== undefined) cfg.verifyEmail.enabled = env.VERIFY_EMAIL_ENABLED === 'true';
  if (env.VERIFY_EMAIL_HOST !== undefined) cfg.verifyEmail.host = env.VERIFY_EMAIL_HOST;
  if (env.VERIFY_EMAIL_PORT !== undefined) cfg.verifyEmail.port = Number(env.VERIFY_EMAIL_PORT) || 465;
  if (env.VERIFY_EMAIL_USER !== undefined) cfg.verifyEmail.user = env.VERIFY_EMAIL_USER;
  if (env.VERIFY_EMAIL_PASS !== undefined) cfg.verifyEmail.pass = env.VERIFY_EMAIL_PASS;
  if (env.VERIFY_EMAIL_FROM !== undefined) cfg.verifyEmail.from = env.VERIFY_EMAIL_FROM;
  if (env.VERIFY_SMS_ENABLED !== undefined) cfg.verifySms.enabled = env.VERIFY_SMS_ENABLED === 'true';
  if (env.VERIFY_SMS_SID !== undefined) cfg.verifySms.sid = env.VERIFY_SMS_SID;
  if (env.VERIFY_SMS_TOKEN !== undefined) cfg.verifySms.token = env.VERIFY_SMS_TOKEN;
  if (env.VERIFY_SMS_FROM !== undefined) cfg.verifySms.fromNumber = env.VERIFY_SMS_FROM;
  return cfg;
}
config = applyEnvOverrides(config);

// ==================== 验证码存储 ====================
const codeStore = new Map();

// ==================== 发送逻辑 ====================
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()); }
function isPhone(v) { return /^1\d{10}$/.test(String(v || '').trim()); }

async function sendEmail(cfg, to, code) {
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: Number(cfg.port) || 465,
    secure: Number(cfg.port) === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transporter.sendMail({
    from: cfg.from || cfg.user,
    to,
    subject: '【Neutron Browser】登录验证码',
    text: `您的验证码是：${code}，10 分钟内有效。请勿泄露给他人。`,
    html:
      `<div style="font-family: Arial, 'Microsoft YaHei', sans-serif; max-width: 420px; margin: 0 auto; padding: 24px; border: 1px solid #e8eaed; border-radius: 12px;">
         <div style="text-align: center; margin-bottom: 16px;">
           <div style="display: inline-block; width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6a9bff, #1a5dff); color: #fff; font-size: 20px; line-height: 44px; text-align: center;">N</div>
         </div>
         <div style="text-align: center; font-size: 15px; color: #202124; margin-bottom: 16px;">Neutron Browser 登录验证码</div>
         <div style="text-align: center; font-size: 13px; color: #5f6368; margin-bottom: 16px;">您正在登录 Neutron Browser，请输入以下验证码：</div>
         <div style="text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a73e8; margin: 20px 0;">${code}</div>
         <div style="text-align: center; font-size: 12px; color: #80868b;">验证码 10 分钟内有效，请勿泄露给他人。</div>
       </div>`,
  });
}

function sendSmsViaTwilio(cfg, to, code) {
  return new Promise((resolve, reject) => {
    const accountSid = String(cfg.sid || '').trim();
    const authToken = String(cfg.token || '').trim();
    const from = String(cfg.fromNumber || '').trim();
    const body = `【Neutron Browser】您的验证码是 ${code}，10 分钟内有效。`;
    const payload = new URLSearchParams({ To: to, From: from, Body: body }).toString();
    const req = https.request({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error('短信发送失败（HTTP ' + res.statusCode + '）'));
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/** 实际发送（配置是否就绪由调用方判断） */
async function doSend(account, code) {
  if (isEmail(account)) {
    await sendEmail(config.verifyEmail, account, code);
  } else {
    const to = account.startsWith('+') ? account : '+86' + account;
    await sendSmsViaTwilio(config.verifySms, to, code);
  }
}

/** 校验是否已配置对应渠道 */
function channelReady(account) {
  if (isEmail(account)) {
    const c = config.verifyEmail || {};
    return !!(c.enabled && c.host && c.user && c.pass);
  }
  const c = config.verifySms || {};
  return !!(c.enabled && c.sid && c.token && c.fromNumber);
}

// ==================== Web 服务 ====================
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// 站长管理页（/admin → admin.html）
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ---- 浏览器调用：发送验证码 ----
app.post('/api/verify/send', async (req, res) => {
  const account = String((req.body && req.body.account) || '').trim();
  if (!isEmail(account) && !isPhone(account)) {
    return res.json({ ok: false, error: '请输入正确的手机号或邮箱' });
  }
  if (!channelReady(account)) {
    return res.json({ ok: false, error: isEmail(account) ? '邮箱验证码未启用，请联系管理员' : '短信验证码未启用，请联系管理员' });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    await doSend(account, code);
  } catch (e) {
    console.error('[VerifyServer] 发送失败:', e && e.message);
    return res.json({ ok: false, error: '验证码发送失败：' + ((e && e.message) || '未知错误') });
  }
  codeStore.set(account, { code, expireAt: Date.now() + CODE_TTL });
  console.log('[VerifyServer] 验证码已发送至', account);
  res.json({ ok: true, account });
});

// ---- 浏览器调用：校验验证码 ----
app.post('/api/verify/check', (req, res) => {
  const account = String((req.body && req.body.account) || '').trim();
  const code = String((req.body && req.body.code) || '').trim();
  const entry = codeStore.get(account);
  if (!entry || Date.now() > entry.expireAt) {
    codeStore.delete(account);
    return res.json({ ok: false });
  }
  if (String(entry.code) !== code) {
    return res.json({ ok: false });
  }
  codeStore.delete(account);
  res.json({ ok: true });
});

// ---- 站长管理：获取配置（敏感项脱敏） ----
app.get('/api/admin/config', (req, res) => {
  if (req.query.token !== config.adminToken) return res.status(403).json({ ok: false, error: '管理令牌无效' });
  const c = JSON.parse(JSON.stringify(config));
  if (c.verifyEmail) c.verifyEmail.pass = c.verifyEmail.pass ? '******' : '';
  if (c.verifySms) c.verifySms.token = c.verifySms.token ? '******' : '';
  res.json({ ok: true, config: c });
});

// ---- 站长管理：保存配置（****** 表示保持不变） ----
app.post('/api/admin/config', (req, res) => {
  if (req.query.token !== config.adminToken) return res.status(403).json({ ok: false, error: '管理令牌无效' });
  const body = req.body || {};
  const email = Object.assign({}, config.verifyEmail, body.verifyEmail || {});
  if (email.pass === '******') email.pass = config.verifyEmail.pass;
  const sms = Object.assign({}, config.verifySms, body.verifySms || {});
  if (sms.token === '******') sms.token = config.verifySms.token;
  config.verifyEmail = email;
  config.verifySms = sms;
  saveConfig(config);
  res.json({ ok: true });
});

// ---- 站长管理：测试发送 ----
app.post('/api/admin/test', async (req, res) => {
  if (req.query.token !== config.adminToken) return res.status(403).json({ ok: false, error: '管理令牌无效' });
  const account = String((req.body && req.body.account) || '').trim();
  if (!isEmail(account) && !isPhone(account)) return res.json({ ok: false, error: '请输入正确的手机号或邮箱' });
  if (!channelReady(account)) {
    return res.json({ ok: false, error: isEmail(account) ? '邮箱验证码未启用或配置不完整' : '短信验证码未启用或配置不完整' });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    await doSend(account, code);
  } catch (e) {
    return res.json({ ok: false, error: '测试发送失败：' + ((e && e.message) || '未知错误') });
  }
  res.json({ ok: true, message: '已发送，请查收（测试验证码：' + code + '）' });
});

app.listen(PORT, () => {
  console.log('[VerifyServer] 验证码后端已启动: http://localhost:' + PORT);
  console.log('[VerifyServer] 站长管理页: http://localhost:' + PORT + '/admin');
});
