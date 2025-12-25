/**
 * 腾讯云开发客户端初始化
 * 在 HTML 中引入此文件后，可以使用 window.cloudbase 访问云开发服务
 */

// 使用 CDN 方式引入（推荐，无需打包）
(function() {
  // 从配置中获取环境 ID（需要替换为实际值）
  const ENV_ID = 'adaichan-5gawyyw4c644abc4'; // 请替换为你的环境 ID
  
  // 动态加载腾讯云开发 SDK
  const script = document.createElement('script');
  script.src = 'https://imgcache.qq.com/qcloud/tcbjs/1.3.5/tcb.js';
  script.onload = function() {
    // 初始化云开发
    if (typeof tcb !== 'undefined') {
      window.cloudbase = tcb.init({
        env: ENV_ID
      });
      
      console.log('腾讯云开发初始化成功');
      
      // 监听初始化完成事件
      if (typeof window.onCloudbaseReady === 'function') {
        window.onCloudbaseReady(window.cloudbase);
      }
    }
  };
  document.head.appendChild(script);
})();

/**
 * 使用示例：
 * 
 * // 1. 用户认证
 * cloudbase.auth().signInAnonymously().then(() => {
 *   console.log('匿名登录成功');
 * });
 * 
 * // 2. 数据库操作
 * const db = cloudbase.database();
 * db.collection('users').add({
 *   name: '用户名',
 *   email: 'user@example.com'
 * });
 * 
 * // 3. 文件上传
 * cloudbase.uploadFile({
 *   cloudPath: 'videos/video.mp4',
 *   filePath: file
 * });
 */


