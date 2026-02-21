/**
 * 用户认证示例代码
 * 演示如何使用腾讯云开发进行用户注册、登录等操作
 */

class AuthManager {
  constructor(cloudbase) {
    this.cloudbase = cloudbase;
    this.auth = cloudbase.auth();
  }

  /**
   * 邮箱注册
   */
  async signUpWithEmail(email, password) {
    try {
      const result = await this.auth.signUpWithEmailAndPassword(email, password);
      console.log('注册成功', result);
      return result;
    } catch (error) {
      console.error('注册失败', error);
      throw error;
    }
  }

  /**
   * 邮箱登录
   */
  async signInWithEmail(email, password) {
    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('登录成功', result);
      return result;
    } catch (error) {
      console.error('登录失败', error);
      throw error;
    }
  }

  /**
   * 匿名登录（快速体验）
   */
  async signInAnonymously() {
    try {
      const result = await this.auth.signInAnonymously();
      console.log('匿名登录成功', result);
      return result;
    } catch (error) {
      console.error('匿名登录失败', error);
      throw error;
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return this.auth.getCurrenUser();
  }

  /**
   * 退出登录
   */
  async signOut() {
    try {
      await this.auth.signOut();
      console.log('退出登录成功');
    } catch (error) {
      console.error('退出登录失败', error);
      throw error;
    }
  }
}

// 使用示例
window.onCloudbaseReady = function(cloudbase) {
  window.authManager = new AuthManager(cloudbase);
  
  // 示例：匿名登录
  // window.authManager.signInAnonymously();
};


