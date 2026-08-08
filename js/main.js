/* ============================================================
   Neutron Browser 官网交互脚本
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 1. 背景粒子画布 ---------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const COLORS = ['79,139,255', '124,92,255', '45,212,191'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function initParticles() {
    particles = [];
    const count = Math.min(90, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.2,
      });
    }
  }
  initParticles();

  let raf = null;
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    }
    // 连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = dx * dx + dy * dy;
        if (dist < 120 * 120) {
          const alpha = (1 - Math.sqrt(dist) / 120) * 0.14;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.c},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // 页面隐藏时暂停动画
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      drawParticles();
    }
  });

  /* ---------- 2. 导航栏滚动效果 ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. 滚动显现动画 ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 4. 界面预览：模拟内置页面 ---------- */
  const previewScreen = document.getElementById('previewScreen');
  const previewAddr = document.getElementById('previewAddr');

  const PAGES = {
    newtab: `
      <div class="pg pg--newtab">
        <div class="pg__brand"><img src="assets/icon.png" alt="" /> Neutron Browser</div>
        <div class="pg__search">🔍 搜索或输入网址</div>
        <div class="pg__grid">
          <div class="pg__cell"><span style="--c:#4f8bff">G</span>GitHub</div>
          <div class="pg__cell"><span style="--c:#fb7299">B</span>哔哩哔哩</div>
          <div class="pg__cell"><span style="--c:#34d399">N</span>知乎</div>
          <div class="pg__cell"><span style="--c:#a78bfa">D</span>抖音</div>
          <div class="pg__cell"><span style="--c:#fbbf24">C</span>CSDN</div>
        </div>
      </div>`,
    downloads: `
      <div class="pg">
        <div class="pg__panel-head">
          <h4>⬇ 下载</h4>
          <span class="pg__pill">2 个进行中 · 4 已完成</span>
        </div>
        <div class="pg__list">
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#2563eb">PDF</div>
            <div class="pg__row-main">
              <div class="pg__row-title">Neutron-Browser-User-Guide.pdf</div>
              <div class="pg__row-sub">developer.mozilla.org · 2.4 MB</div>
              <div class="pg__bar"><i style="width:72%"></i></div>
            </div>
            <span class="pg__row-meta">72% · 1.8 MB/s</span>
            <div class="pg__row-actions"><span class="pg__mini-btn">⏸</span><span class="pg__mini-btn">✕</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#0891b2">ZIP</div>
            <div class="pg__row-main">
              <div class="pg__row-title">source-code-v1.10.0.zip</div>
              <div class="pg__row-sub">github.com · 6.8 MB</div>
              <div class="pg__bar"><i style="width:34%"></i></div>
            </div>
            <span class="pg__row-meta">34% · 2.1 MB/s</span>
            <div class="pg__row-actions"><span class="pg__mini-btn">⏸</span><span class="pg__mini-btn">✕</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#059669">EXE</div>
            <div class="pg__row-main">
              <div class="pg__row-title">Neutron-Browser-Setup-1.10.0.exe</div>
              <div class="pg__row-sub">github.com · 77.0 MB</div>
              <div class="pg__bar"><i style="width:100%;background:#34d399"></i></div>
            </div>
            <span class="pg__row-meta">✓ 已完成</span>
            <div class="pg__row-actions"><span class="pg__mini-btn">📂</span></div>
          </div>
        </div>
      </div>`,
    history: `
      <div class="pg">
        <div class="pg__panel-head">
          <h4>🕘 历史记录</h4>
          <span class="pg__pill">今天 · 23 条</span>
        </div>
        <div class="pg__list">
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#4f8bff">G</div>
            <div class="pg__row-main">
              <div class="pg__row-title">GitHub · Where software is built</div>
              <div class="pg__row-sub">github.com · 14:32</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">🗑</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#fb7299">B</div>
            <div class="pg__row-main">
              <div class="pg__row-title">哔哩哔哩 (゜-゜)つロ 干杯~</div>
              <div class="pg__row-sub">www.bilibili.com · 13:57</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">🗑</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#34d399">N</div>
            <div class="pg__row-main">
              <div class="pg__row-title">知乎 - 有问题，就会有答案</div>
              <div class="pg__row-sub">www.zhihu.com · 12:44</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">🗑</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#fbbf24">C</div>
            <div class="pg__row-main">
              <div class="pg__row-title">CSDN - 专业开发者社区</div>
              <div class="pg__row-sub">blog.csdn.net · 11:20</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">🗑</span></div>
          </div>
        </div>
      </div>`,
    bookmarks: `
      <div class="pg">
        <div class="pg__panel-head">
          <h4>⭐ 书签管理器</h4>
          <span class="pg__pill">3 个文件夹 · 16 个书签</span>
        </div>
        <div class="pg__list">
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#8b5cf6">📁</div>
            <div class="pg__row-main">
              <div class="pg__row-title">开发工具</div>
              <div class="pg__row-sub">6 个书签</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">⋯</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#4f8bff">G</div>
            <div class="pg__row-main">
              <div class="pg__row-title">GitHub</div>
              <div class="pg__row-sub">github.com</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">✎</span><span class="pg__mini-btn">🗑</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#fb7299">B</div>
            <div class="pg__row-main">
              <div class="pg__row-title">哔哩哔哩</div>
              <div class="pg__row-sub">www.bilibili.com</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">✎</span><span class="pg__mini-btn">🗑</span></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#34d399">N</div>
            <div class="pg__row-main">
              <div class="pg__row-title">知乎</div>
              <div class="pg__row-sub">www.zhihu.com</div>
            </div>
            <div class="pg__row-actions"><span class="pg__mini-btn">✎</span><span class="pg__mini-btn">🗑</span></div>
          </div>
        </div>
      </div>`,
    extensions: `
      <div class="pg">
        <div class="pg__panel-head">
          <h4>🧩 扩展</h4>
          <span class="pg__pill">2 个已启用</span>
        </div>
        <div class="pg__grid2">
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#ef4444">AB</div>
            <div class="pg__row-main">
              <div class="pg__row-title">Adblock Plus <span class="pg__tag pg__tag--edge">Edge 商店</span></div>
              <div class="pg__row-sub">v3.22 · 广告拦截</div>
            </div>
            <div class="pg__toggle"></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#f97316">uB</div>
            <div class="pg__row-main">
              <div class="pg__row-title">uBlock Origin <span class="pg__tag pg__tag--local">本地加载</span></div>
              <div class="pg__row-sub">v1.57 · 高效拦截</div>
            </div>
            <div class="pg__toggle"></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#10b981">DV</div>
            <div class="pg__row-main">
              <div class="pg__row-title">Dark Reader <span class="pg__tag pg__tag--local">本地加载</span></div>
              <div class="pg__row-sub">v4.9 · 暗色模式</div>
            </div>
            <div class="pg__toggle pg__toggle--off"></div>
          </div>
          <div class="pg__row">
            <div class="pg__row-icon" style="--c:#8b5cf6">+</div>
            <div class="pg__row-main">
              <div class="pg__row-title">安装扩展 (.crx / .zip)</div>
              <div class="pg__row-sub">或从 Edge 扩展商店安装</div>
            </div>
            <div class="pg__mini-btn" style="width:34px;height:19px;display:grid;place-items:center;border-radius:999px;background:var(--accent);color:#fff;font-size:11px">＋</div>
          </div>
        </div>
      </div>`,
  };

  const tabs = document.querySelectorAll('.preview__tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const page = tab.dataset.page;
      previewAddr.textContent = `neutron://${page}`;
      previewScreen.innerHTML = PAGES[page] || PAGES.newtab;
    });
  });
  previewScreen.innerHTML = PAGES.newtab;

  /* ---------- 5. 主题强调色实时联动预览条 ---------- */
  const themeBar = document.getElementById('themeBar');
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach((sw) => {
    sw.addEventListener('mouseenter', () => {
      themeBar.style.setProperty('--accent', sw.style.getPropertyValue('--c'));
      const activeTab = themeBar.querySelector('.theme-bar__tab--active');
      if (activeTab) {
        activeTab.style.background = `linear-gradient(180deg, ${sw.style.getPropertyValue('--c')}40, transparent)`;
      }
    });
    sw.addEventListener('mouseleave', () => {
      themeBar.style.setProperty('--accent', '#4f8bff');
      const activeTab = themeBar.querySelector('.theme-bar__tab--active');
      if (activeTab) activeTab.style.background = '';
    });
  });

  /* ---------- 6. 平滑锚点滚动（兼顾固定导航高度） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
