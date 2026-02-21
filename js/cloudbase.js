/**
 * 腾讯云开发客户端初始化
 */

(function() {
  // 环境 ID
  const ENV_ID = 'adaichan-5gawyyw4c644abc4';
  const REGION = 'ap-shanghai'; // 地域，根据你的环境选择
  
  // 标记 SDK 是否已加载
  window.cloudbaseReady = false;
  window.cloudbaseCallbacks = [];
  
  // 等待 cloudbase 就绪的函数
  window.waitForCloudbase = function(callback) {
    if (window.cloudbaseReady && window.app) {
      callback(window.app);
    } else {
      window.cloudbaseCallbacks.push(callback);
    }
  };
  
  // 动态加载腾讯云开发 SDK（使用官方最新 CDN）
  const script = document.createElement('script');
  script.src = 'https://static.cloudbase.net/cloudbase-js-sdk/latest/cloudbase.full.js?v=1';
  
  script.onerror = function() {
    console.error('腾讯云开发 SDK 加载失败');
    window.cloudbaseReady = false;
  };
  
  script.onload = function() {
    try {
      // 使用官方推荐的初始化方式
      if (typeof cloudbase !== 'undefined') {
        window.app = cloudbase.init({
          env: ENV_ID,
          region: REGION
        });
        
        // 兼容旧代码
        window.cloudbase = window.app;
        
        window.cloudbaseReady = true;
        console.log('腾讯云开发初始化成功');
        
        // 执行所有等待的回调
        window.cloudbaseCallbacks.forEach(function(cb) {
          try {
            cb(window.app);
          } catch (e) {
            console.error('Cloudbase callback error:', e);
          }
        });
        window.cloudbaseCallbacks = [];
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('cloudbaseReady', { detail: window.app }));
        
      } else {
        console.error('cloudbase 对象未定义');
      }
    } catch (error) {
      console.error('腾讯云开发初始化失败:', error);
    }
  };
  
  document.head.appendChild(script);
})();
