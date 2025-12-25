# 腾讯云开发配置指南

## 网站权限控制功能

本站已集成权限控制系统，可以限制只有授权用户才能访问网站内容。

### 配置权限控制

打开 `source/js/auth-guard.js`，找到 `AUTH_CONFIG` 配置项：

```javascript
const AUTH_CONFIG = {
  // 是否启用权限控制（设为 false 可禁用）
  enabled: true,
  
  // 是否允许匿名访问
  allowAnonymous: false,
  
  // 白名单用户邮箱（留空允许所有注册用户访问）
  whitelistEmails: ['admin@example.com', 'user@example.com'],
  
  // 简单密码保护模式（不需要云开发认证）
  simplePasswordMode: {
    enabled: false,  // 设为 true 启用简单密码模式
    password: 'your-password'  // 设置访问密码
  }
};
```

### 三种权限控制模式

1. **云开发认证模式**（默认）：用户需要注册/登录腾讯云开发账号
2. **白名单模式**：只有指定邮箱的用户才能访问
3. **简单密码模式**：所有人使用同一个密码访问

### 快速测试

如果只想简单保护网站，可以启用简单密码模式：

```javascript
simplePasswordMode: {
  enabled: true,
  password: '你的密码'
}
```

---

## 第一步：注册腾讯云账号

1. 访问腾讯云官网：https://cloud.tencent.com/
2. 点击右上角"免费注册"
3. 完成注册和实名认证（需要身份证或企业认证）

## 第二步：开通云开发服务

1. 登录腾讯云控制台：https://console.cloud.tencent.com/
2. 在顶部搜索框输入"云开发"或"CloudBase"
3. 点击进入"云开发 CloudBase"服务
4. 如果是首次使用，点击"立即开通"
5. 阅读并同意服务协议

## 第三步：创建环境

1. 在云开发控制台，点击"新建环境"
2. 填写环境信息：
   - **环境名称**：例如 `adaichan-blog`（自定义）
   - **环境 ID**：系统自动生成（例如：`adaichan-blog-xxxxx`）
   - **套餐选择**：选择"基础版"（免费）
   - **地域**：选择离你最近的地域（如：广州、上海）
3. 点击"确定"创建环境
4. 等待环境创建完成（约 1-2 分钟）

## 第四步：获取配置信息

1. 在云开发控制台，点击你创建的环境
2. 进入"环境设置" → "环境信息"
3. 记录以下信息：
   - **环境 ID**（Env ID）：例如 `adaichan-blog-xxxxx`
   - **环境名称**：你设置的环境名称

## 第五步：配置数据库

1. 在云开发控制台，点击"数据库"
2. 点击"新建集合"（集合 = 表）
3. 创建以下集合：

### 用户表（users）
- 集合名称：`users`
- 权限设置：仅创建者可读写

### 游戏分数表（game_scores）
- 集合名称：`game_scores`
- 权限设置：所有用户可读，仅创建者可写

### 音视频表（media_files）
- 集合名称：`media_files`
- 权限设置：所有用户可读，仅创建者可写

## 第六步：配置存储

1. 在云开发控制台，点击"存储"
2. 点击"新建文件夹"
3. 创建以下文件夹：
   - `videos` - 存放视频文件
   - `audios` - 存放音频文件
   - `images` - 存放图片文件

## 第七步：配置身份认证

1. 在云开发控制台，点击"身份认证"
2. 启用"匿名登录"（快速体验）
3. 启用"邮箱登录"（如果需要邮箱注册）
4. 配置登录方式：
   - 匿名登录：开启
   - 邮箱密码：开启（可选）

## 第八步：配置项目文件

1. 打开 `source/js/cloudbase.js`
2. 将 `ENV_ID` 替换为你的环境 ID：
   ```javascript
   const ENV_ID = 'your-env-id'; // 替换为你的实际环境 ID
   ```

3. 打开 `cloudbase.config.js`
4. 将 `envId` 替换为你的环境 ID：
   ```javascript
   envId: 'your-env-id', // 替换为你的实际环境 ID
   ```

## 第九步：在 HTML 中引入

在你的 Hexo 主题模板文件中（如 `themes/matery/layout/_partial/head.ejs`）添加：

```html
<!-- 腾讯云开发 SDK -->
<script src="/js/cloudbase.js"></script>
<script src="/js/auth-example.js"></script>
<script src="/js/database-example.js"></script>
<script src="/js/storage-example.js"></script>
```

或者在需要使用的页面单独引入。

## 第十步：测试连接

1. 重新生成网站：`hexo clean && hexo generate`
2. 启动本地服务器：`hexo server`
3. 打开浏览器控制台（F12）
4. 查看是否有"腾讯云开发初始化成功"的日志
5. 测试匿名登录：
   ```javascript
   window.authManager.signInAnonymously();
   ```

## 常见问题

### Q: 环境 ID 在哪里找？
A: 在云开发控制台 → 环境设置 → 环境信息中可以看到。

### Q: 免费额度是多少？
A: 
- 数据库：1GB 存储空间
- 文件存储：5GB 存储空间
- CDN 流量：2GB/月
- 云函数调用：10万次/月

### Q: 如何查看使用量？
A: 在云开发控制台 → 概览中可以查看各项资源的使用情况。

### Q: 如何配置域名？
A: 在云开发控制台 → 环境设置 → 域名配置中可以配置自定义域名。

## 下一步

配置完成后，你可以：
1. 实现用户注册/登录功能
2. 保存游戏数据
3. 上传和管理音视频文件

参考示例代码文件了解具体使用方法。

---

## 权限控制 API

在浏览器控制台中可以使用以下命令：

```javascript
// 检查是否已登录
window.authGuard.isLoggedIn();

// 获取当前用户信息
window.authGuard.getUser();

// 退出登录
window.authGuard.logout();

// 查看配置
window.authGuard.config;
```

## 相关文件

- `source/js/auth-guard.js` - 权限控制核心逻辑
- `source/js/cloudbase.js` - 腾讯云开发 SDK 初始化
- `source/js/auth-example.js` - 认证示例代码
- `css/auth.css` - 登录界面样式
