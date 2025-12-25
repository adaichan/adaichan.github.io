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
      <div class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <h2>🔐 需要登录</h2>
            <p>请登录后访问网站内容</p>
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
          
          <div class="auth-divider">
            <span>或者</span>
          </div>
          
          <button class="auth-anonymous" id="auth-anonymous-btn" style="display: ${AUTH_CONFIG.allowAnonymous ? 'block' : 'none'}">
            匿名访问
          </button>
          
          <div class="auth-footer">
            <p>登录即表示同意我们的使用条款</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 绑定事件
    setupAuthEvents();
  }

  // 隐藏登录遮罩层
  function hideLoginOverlay() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  // 设置认证事件
  function setupAuthEvents() {
    const form = document.getElementById('auth-form');
    const submitBtn = document.getElementById('auth-submit-btn');
    const anonymousBtn = document.getElementById('auth-anonymous-btn');
    const errorDiv = document.getElementById('auth-error');

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




