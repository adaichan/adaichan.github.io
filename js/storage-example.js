/**
 * 文件存储示例代码
 * 演示如何使用腾讯云开发存储上传和管理文件
 */

class StorageManager {
  constructor(cloudbase) {
    this.cloudbase = cloudbase;
  }

  /**
   * 上传文件
   * @param {File} file - 文件对象
   * @param {string} cloudPath - 云存储路径，如 'videos/video.mp4'
   * @param {Function} onProgress - 上传进度回调
   */
  async uploadFile(file, cloudPath, onProgress) {
    try {
      const result = await this.cloudbase.uploadFile({
        cloudPath: cloudPath,
        filePath: file,
        onUploadProgress: onProgress || function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('上传进度:', percentCompleted + '%');
        }
      });
      
      console.log('上传成功', result);
      
      // 获取文件访问 URL
      const fileUrl = await this.getFileUrl(result.fileID);
      return {
        fileID: result.fileID,
        url: fileUrl
      };
    } catch (error) {
      console.error('上传失败', error);
      throw error;
    }
  }

  /**
   * 获取文件访问 URL
   */
  async getFileUrl(fileID) {
    try {
      const result = await this.cloudbase.getTempFileURL({
        fileList: [fileID]
      });
      return result.fileList[0].tempFileURL;
    } catch (error) {
      console.error('获取文件 URL 失败', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileID) {
    try {
      const result = await this.cloudbase.deleteFile({
        fileList: [fileID]
      });
      console.log('删除成功', result);
      return result;
    } catch (error) {
      console.error('删除失败', error);
      throw error;
    }
  }

  /**
   * 上传视频文件示例
   */
  async uploadVideo(file, onProgress) {
    const user = this.cloudbase.auth().getCurrenUser();
    const userId = user ? user.uid : 'anonymous';
    const timestamp = Date.now();
    const cloudPath = `videos/${userId}/${timestamp}_${file.name}`;
    
    return await this.uploadFile(file, cloudPath, onProgress);
  }

  /**
   * 上传音频文件示例
   */
  async uploadAudio(file, onProgress) {
    const user = this.cloudbase.auth().getCurrenUser();
    const userId = user ? user.uid : 'anonymous';
    const timestamp = Date.now();
    const cloudPath = `audios/${userId}/${timestamp}_${file.name}`;
    
    return await this.uploadFile(file, cloudPath, onProgress);
  }
}

// 使用示例
window.onCloudbaseReady = function(cloudbase) {
  window.storageManager = new StorageManager(cloudbase);
  
  // 示例：上传文件
  // const fileInput = document.getElementById('fileInput');
  // fileInput.addEventListener('change', async (e) =&gt; {
  //   const file = e.target.files[0];
  //   const result = await window.storageManager.uploadVideo(file);
  //   console.log('文件 URL:', result.url);
  // });
};


