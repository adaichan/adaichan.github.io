/**
 * 网站权限控制守卫
 * 用于保护网站内容，只有登录用户才能访问
 */

(function() {
  'use strict';

  // 配置项
  const AUTH_CONFIG = {
    // 是否启用权限控制
    enabled: true,
    
    // 免登录可访问的页面路径（正则匹配）
    publicPaths: [
      /^\/login\/?$/,
      /^\/register\/?$/,
      /^\/404\/?$/
    ],
    
    // 登录页面路径
    loginPath: '/login/',
    
    // 登录后重定向的路径
    afterLoginPath: '/',
    
    // 登录状态存储的 key
    storageKey: 'adai_auth_state',
    
    // 是否允许匿名访问（设为 false 则必须注册登录）
    allowAnonymous: false,
    
    // 白名单用户列表（只有这些用户可以访问，留空表示允许所有注册用户）
    whitelist: ['adaichan', 'amadhatter'],
    
    // 简单密码保护模式（如果启用，不需要腾讯云开发认证）
    simplePasswordMode: {
      enabled: false,
      password: '' // 设置访问密码
    },
    
    // 登录页背景音乐配置
    bgm: {
      enabled: true,
      // 使用在线音乐链接（推荐使用免费音效网站的链接）
      // 示例：轻音乐/钢琴曲等
      url: 'https://music.163.com/song/media/outer/url?id=2730699305.mp3',
      volume: 0.6  // 音量 0-1
    }
  };

  // 存储登录状态
  function setAuthState(state) {
    try {
      localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('无法保存登录状态', e);
    }
  }

  // 获取登录状态
  function getAuthState() {
    try {
      const state = localStorage.getItem(AUTH_CONFIG.storageKey);
      return state ? JSON.parse(state) : null;
    } catch (e) {
      return null;
    }
  }

  // 清除登录状态
  function clearAuthState() {
    try {
      localStorage.removeItem(AUTH_CONFIG.storageKey);
    } catch (e) {
      console.error('无法清除登录状态', e);
    }
  }

  // 检查当前页面是否是公开页面
  function isPublicPath() {
    const currentPath = window.location.pathname;
    return AUTH_CONFIG.publicPaths.some(pattern => pattern.test(currentPath));
  }

  // 检查用户是否在白名单中
  function isUserWhitelisted(email) {
    if (AUTH_CONFIG.whitelist.length === 0) {
      return true; // 白名单为空，允许所有用户
    }
    return AUTH_CONFIG.whitelist.includes(email);
  }

  // 显示登录遮罩层
  function showLoginOverlay() {
    // 如果已存在，不重复创建
    if (document.getElementById('auth-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <!-- 流星雨效果 -->
      <div class="meteor-shower">
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
        <div class="meteor"></div>
      </div>
      
      <!-- 浮动光球 -->
      <div class="floating-orbs">
        <div class="orb"></div>
        <div class="orb"></div>
        <div class="orb"></div>
      </div>
      
      <!-- 萤火虫 -->
      <div class="fireflies">
        <div class="firefly"></div>
        <div class="firefly"></div>
        <div class="firefly"></div>
        <div class="firefly"></div>
        <div class="firefly"></div>
        <div class="firefly"></div>
      </div>
      
      <!-- 烟花画布 -->
      <canvas class="fireworks-canvas" id="auth-fireworks"></canvas>
      
      <div class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <div class="auth-logo">
              <div class="logo-ring"></div>
              <div class="logo-ring"></div>
              <div class="logo-icon">✦</div>
            </div>
            <h2>Welcome</h2>
          </div>
          
          <form id="auth-form" class="auth-form">
            <div class="form-group">
              <label for="auth-username">用户名</label>
              <input type="text" id="auth-username" placeholder="请输入用户名" required>
            </div>
            <div class="form-group">
              <label for="auth-password">密码</label>
              <input type="password" id="auth-password" placeholder="请输入密码" required>
            </div>
            <div class="form-error" id="auth-error"></div>
            <button type="submit" class="auth-submit" id="auth-submit-btn">登录</button>
          </form>
          
          <button class="auth-anonymous" id="auth-anonymous-btn" style="display: ${AUTH_CONFIG.allowAnonymous ? 'block' : 'none'}">
            匿名访问
          </button>
        </div>
        
        <!-- 背景音乐控制 -->
        <div class="auth-music-control" style="display: ${AUTH_CONFIG.bgm.enabled ? 'flex' : 'none'}">
          <audio id="auth-bgm" loop src="${AUTH_CONFIG.bgm.url}"></audio>
          <button type="button" id="music-toggle" class="music-btn" title="播放/暂停音乐">
            <span class="music-icon">♪</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 绑定事件
    setupAuthEvents();
    
    // 初始化烟花动画
    initFireworks();
  }

  // 隐藏登录遮罩层
  function hideLoginOverlay() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
      // 停止背景音乐
      const bgm = document.getElementById('auth-bgm');
      if (bgm) {
        bgm.pause();
      }
      // 停止烟花动画
      if (window.fireworksAnimation) {
        window.fireworksAnimation.pause();
        window.fireworksAnimation = null;
      }
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  // 初始化烟花动画
  function initFireworks() {
    const canvas = document.getElementById('auth-fireworks');
    if (!canvas || typeof anime === 'undefined') return;

    const ctx = canvas.getContext('2d');
    let numberOfParticules = 30;
    const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C', '#FF6B9D', '#C44569', '#F8B500'];

    // 设置画布大小
    function setCanvasSize() {
      canvas.width = 2 * window.innerWidth;
      canvas.height = 2 * window.innerHeight;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(2, 2);
    }

    setCanvasSize();
    
    // 防抖处理resize事件
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setCanvasSize, 250);
    });

    // 创建粒子方向
    function setParticuleDirection(p) {
      const angle = anime.random(0, 360) * Math.PI / 180;
      const value = anime.random(50, 180);
      const radius = [-1, 1][anime.random(0, 1)] * value;
      return {
        x: p.x + radius * Math.cos(angle),
        y: p.y + radius * Math.sin(angle)
      };
    }

    // 创建粒子
    function createParticule(x, y) {
      const p = {
        x: x,
        y: y,
        color: colors[anime.random(0, colors.length - 1)],
        radius: anime.random(16, 32),
        endPos: null,
        draw: function() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      };
      p.endPos = setParticuleDirection(p);
      return p;
    }

    // 创建圆形
    function createCircle(x, y) {
      const p = {
        x: x,
        y: y,
        color: '#F00',
        radius: 0.1,
        alpha: 0.5,
        lineWidth: 6,
        draw: function() {
          ctx.globalAlpha = this.alpha;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
          ctx.lineWidth = this.lineWidth;
          ctx.strokeStyle = this.color;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      };
      return p;
    }

    // 渲染粒子
    function renderParticule(anim) {
      for (let i = 0; i < anim.animatables.length; i++) {
        anim.animatables[i].target.draw();
      }
    }

    // 动画粒子
    function animateParticules(x, y) {
      const circle = createCircle(x, y);
      const particules = [];
      for (let i = 0; i < numberOfParticules; i++) {
        particules.push(createParticule(x, y));
      }

      anime.timeline().add({
        targets: particules,
        x: function(p) { return p.endPos.x; },
        y: function(p) { return p.endPos.y; },
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: 'easeOutExpo',
        update: renderParticule
      }).add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: 'linear',
          duration: anime.random(600, 800)
        },
        duration: anime.random(1200, 1800),
        easing: 'easeOutExpo',
        update: renderParticule,
        offset: 0
      });
    }

    // 清除画布
    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 创建持续渲染循环
    window.fireworksAnimation = anime({
      duration: Infinity,
      update: clearCanvas
    });

    // 自动播放烟花
    function autoFireworks() {
      // 随机位置
      const x = anime.random(100, window.innerWidth - 100);
      const y = anime.random(100, window.innerHeight - 100);
      animateParticules(x, y);
    }

    // 初始播放几个烟花
    setTimeout(() => {
      autoFireworks();
      setTimeout(autoFireworks, 500);
      setTimeout(autoFireworks, 1000);
    }, 500);

    // 定时自动播放烟花（每2-4秒一次）
    function scheduleNextFirework() {
      const delay = anime.random(2000, 4000);
      setTimeout(() => {
        autoFireworks();
        scheduleNextFirework();
      }, delay);
    }

    scheduleNextFirework();
  }

  // 背景音乐控制
  function setupBgmControl() {
    const bgm = document.getElementById('auth-bgm');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn ? musicBtn.querySelector('.music-icon') : null;
    
    if (!bgm || !musicBtn) return;

    let isPlaying = false;

    // 尝试自动播放（可能被浏览器阻止）
    const tryAutoPlay = function() {
      bgm.volume = AUTH_CONFIG.bgm.volume || 0.3; // 使用配置的音量
      bgm.play().then(function() {
        isPlaying = true;
        musicBtn.classList.add('playing');
        if (musicIcon) musicIcon.textContent = '🎶';
      }).catch(function() {
        // 自动播放被阻止，等待用户点击
        isPlaying = false;
        musicBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🎵';
      });
    };

    // 页面加载后尝试自动播放
    setTimeout(tryAutoPlay, 500);

    // 点击切换播放/暂停
    musicBtn.addEventListener('click', function() {
      if (isPlaying) {
        bgm.pause();
        isPlaying = false;
        musicBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🎵';
      } else {
        bgm.play().then(function() {
          isPlaying = true;
          musicBtn.classList.add('playing');
          if (musicIcon) musicIcon.textContent = '🎶';
        }).catch(function(err) {
          console.log('播放失败:', err);
        });
      }
    });

    // 用户首次交互后尝试播放
    document.addEventListener('click', function firstClick() {
      if (!isPlaying) {
        tryAutoPlay();
      }
      document.removeEventListener('click', firstClick);
    }, { once: true });
  }

  // 设置认证事件
  function setupAuthEvents() {
    const form = document.getElementById('auth-form');
    const submitBtn = document.getElementById('auth-submit-btn');
    const anonymousBtn = document.getElementById('auth-anonymous-btn');
    const errorDiv = document.getElementById('auth-error');

    // 背景音乐控制
    setupBgmControl();

    // 表单提交
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;

      errorDiv.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = '登录中...';

      try {
        if (!window.app) {
          throw new Error('云服务未初始化，请稍后再试');
        }

        const auth = window.app.auth();
        
        // 使用用户名密码登录（官方 API）
        const result = await auth.signIn({
          username: username,
          password: password
        });

        // 检查白名单（使用用户名）
        if (!isUserWhitelisted(username)) {
          await auth.signOut();
          throw new Error('您没有访问权限，请联系管理员');
        }

        // 保存登录状态
        setAuthState({
          username: username,
          isLoggedIn: true,
          loginTime: Date.now()
        });

        hideLoginOverlay();
        console.log('认证成功');

      } catch (error) {
        console.error('认证失败', error);
        errorDiv.textContent = error.message || '认证失败，请重试';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
      }
    });

    // 匿名访问
    if (anonymousBtn) {
      anonymousBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = '正在进入...';

        try {
          if (window.app) {
            const auth = window.app.auth();
            await auth.signInAnonymously();
          }

          setAuthState({
            isLoggedIn: true,
            isAnonymous: true,
            loginTime: Date.now()
          });

          hideLoginOverlay();

        } catch (error) {
          console.error('匿名登录失败', error);
          errorDiv.textContent = error.message || '匿名登录失败';
        } finally {
          this.disabled = false;
          this.textContent = '匿名访问';
        }
      });
    }
  }

  // 简单密码验证模式
  function showSimplePasswordDialog() {
    if (document.getElementById('auth-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <h2>🔐 请输入访问密码</h2>
            <p>本站需要密码才能访问</p>
          </div>
          
          <form id="simple-auth-form" class="auth-form">
            <div class="form-group">
              <label for="simple-password">访问密码</label>
              <input type="password" id="simple-password" placeholder="请输入访问密码" required autofocus>
            </div>
            <div class="form-error" id="simple-auth-error"></div>
            <button type="submit" class="auth-submit">进入网站</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 绑定事件
    const form = document.getElementById('simple-auth-form');
    const errorDiv = document.getElementById('simple-auth-error');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('simple-password').value;
      
      if (password === AUTH_CONFIG.simplePasswordMode.password) {
        setAuthState({
          isLoggedIn: true,
          isSimpleAuth: true,
          loginTime: Date.now()
        });
        hideLoginOverlay();
      } else {
        errorDiv.textContent = '密码错误，请重试';
      }
    });
  }

  // 主要的认证检查函数
  async function checkAuth() {
    // 如果未启用权限控制，直接返回
    if (!AUTH_CONFIG.enabled) return;

    // 如果是公开页面，不需要认证
    if (isPublicPath()) return;

    // 简单密码模式
    if (AUTH_CONFIG.simplePasswordMode.enabled) {
      const authState = getAuthState();
      if (!authState || !authState.isLoggedIn) {
        showSimplePasswordDialog();
      }
      return;
    }

    // 检查本地存储的登录状态
    const authState = getAuthState();
    if (authState && authState.isLoggedIn) {
      // 验证 session 是否仍然有效（可选：检查登录时间）
      const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 天
      if (Date.now() - authState.loginTime < sessionDuration) {
        return; // 已登录，允许访问
      }
    }

    // 等待云开发初始化
    if (!window.appReady || typeof window.app === 'undefined') {
      // 等待云开发 SDK 加载完成
      await new Promise(resolve => {
        // 如果有 waitForCloudbase 函数，使用它
        if (typeof window.waitForCloudbase === 'function') {
          window.waitForCloudbase(resolve);
        } else {
          // 否则使用轮询方式
          const checkInterval = setInterval(() => {
            if (window.appReady && typeof window.app !== 'undefined') {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // 超时处理（10秒）
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 10000);
        }
      });
    }

    // 检查腾讯云开发的登录状态
    if (window.app) {
      try {
        const auth = window.app.auth();
        const loginState = await auth.getLoginState();
        
        if (loginState) {
          // 已登录
          const user = await auth.getCurrenUser();
          const email = user && user.email;
          
          // 检查白名单
          if (isUserWhitelisted(email)) {
            setAuthState({
              email: email,
              isLoggedIn: true,
              loginTime: Date.now()
            });
            return;
          }
        }
      } catch (error) {
        console.error('检查登录状态失败', error);
      }
    }

    // 未登录，显示登录界面
    showLoginOverlay();
  }

  // 退出登录函数（供外部调用）
  window.authGuard = {
    logout: async function() {
      try {
        if (window.app) {
          const auth = window.app.auth();
          await auth.signOut();
        }
        clearAuthState();
        showLoginOverlay();
      } catch (error) {
        console.error('退出登录失败', error);
      }
    },
    
    isLoggedIn: function() {
      const state = getAuthState();
      return state && state.isLoggedIn;
    },
    
    getUser: function() {
      return getAuthState();
    },
    
    config: AUTH_CONFIG
  };

  // 页面加载时执行认证检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();




