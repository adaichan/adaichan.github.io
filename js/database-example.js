/**
 * 数据库操作示例代码
 * 演示如何使用腾讯云开发数据库进行增删改查
 */

class DatabaseManager {
  constructor(cloudbase) {
    this.cloudbase = cloudbase;
    this.db = cloudbase.database();
  }

  /**
   * 添加数据
   */
  async add(collection, data) {
    try {
      const result = await this.db.collection(collection).add(data);
      console.log('添加成功', result);
      return result;
    } catch (error) {
      console.error('添加失败', error);
      throw error;
    }
  }

  /**
   * 查询数据
   */
  async query(collection, where = {}) {
    try {
      let query = this.db.collection(collection);
      
      // 添加查询条件
      if (Object.keys(where).length &gt; 0) {
        query = query.where(where);
      }
      
      const result = await query.get();
      console.log('查询成功', result);
      return result.data;
    } catch (error) {
      console.error('查询失败', error);
      throw error;
    }
  }

  /**
   * 更新数据
   */
  async update(collection, docId, data) {
    try {
      const result = await this.db.collection(collection).doc(docId).update(data);
      console.log('更新成功', result);
      return result;
    } catch (error) {
      console.error('更新失败', error);
      throw error;
    }
  }

  /**
   * 删除数据
   */
  async delete(collection, docId) {
    try {
      const result = await this.db.collection(collection).doc(docId).remove();
      console.log('删除成功', result);
      return result;
    } catch (error) {
      console.error('删除失败', error);
      throw error;
    }
  }

  /**
   * 游戏分数保存示例
   */
  async saveGameScore(gameName, score, level = 1) {
    const user = this.cloudbase.auth().getCurrenUser();
    if (!user) {
      throw new Error('请先登录');
    }

    return await this.add('game_scores', {
      user_id: user.uid,
      game_name: gameName,
      score: score,
      level: level,
      created_at: new Date()
    });
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(gameName, limit = 10) {
    return await this.db.collection('game_scores')
      .where({
        game_name: gameName
      })
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
  }
}

// 使用示例
window.onCloudbaseReady = function(cloudbase) {
  window.dbManager = new DatabaseManager(cloudbase);
  
  // 示例：保存游戏分数
  // window.dbManager.saveGameScore('snake', 1000, 5);
  
  // 示例：获取排行榜
  // window.dbManager.getLeaderboard('snake', 10).then(data =&gt; {
  //   console.log('排行榜', data);
  // });
};


