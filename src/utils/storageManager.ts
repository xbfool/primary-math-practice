import { 
  UserProgress, 
  UserSettings, 
  Session, 
  Assessment, 
  OperationType, 
  DifficultyLevel 
} from '@/types';

export class StorageManager {
  private static readonly KEYS = {
    USER_PROGRESS: 'math_learn_user_progress',
    USER_SETTINGS: 'math_learn_user_settings',
    SESSIONS_HISTORY: 'math_learn_sessions_history',
    ASSESSMENTS: 'math_learn_assessments'
  };

  /**
   * 获取用户进度
   */
  static getUserProgress(): UserProgress | null {
    try {
      const data = localStorage.getItem(this.KEYS.USER_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取用户进度失败:', error);
      return null;
    }
  }

  /**
   * 保存用户进度
   */
  static saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(this.KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('保存用户进度失败:', error);
    }
  }

  /**
   * 初始化用户进度
   */
  static initializeUserProgress(): UserProgress {
    const defaultProgress: UserProgress = {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      strengthsByOperation: {
        [OperationType.ADDITION]: 0,
        [OperationType.SUBTRACTION]: 0,
        [OperationType.MULTIPLICATION]: 0,
        [OperationType.DIVISION]: 0
      },
      strengthsByDifficulty: {
        [DifficultyLevel.BEGINNER]: 0,
        [DifficultyLevel.BASIC]: 0,
        [DifficultyLevel.INTERMEDIATE]: 0,
        [DifficultyLevel.ADVANCED]: 0,
        [DifficultyLevel.EXPERT]: 0
      },
      averageTimeByOperation: {
        [OperationType.ADDITION]: 0,
        [OperationType.SUBTRACTION]: 0,
        [OperationType.MULTIPLICATION]: 0,
        [OperationType.DIVISION]: 0
      },
      recentSessions: [],
      recommendedDifficulty: DifficultyLevel.BEGINNER,
      recommendedOperations: [OperationType.ADDITION],
      lastActiveDate: new Date()
    };

    this.saveUserProgress(defaultProgress);
    return defaultProgress;
  }

  /**
   * 更新用户进度
   */
  static updateUserProgress(session: Session): void {
    let progress = this.getUserProgress();
    if (!progress) {
      progress = this.initializeUserProgress();
    }

    // 更新基本统计
    progress.totalSessions += 1;
    progress.totalQuestions += session.questions.length;
    progress.totalCorrect += session.answers.filter(a => a.isCorrect).length;
    progress.overallAccuracy = (progress.totalCorrect / progress.totalQuestions) * 100;

    // 更新各运算类型的熟练度
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      if (question) {
        const currentStrength = progress.strengthsByOperation[question.operationType];
        const newStrength = answer.isCorrect 
          ? Math.min(100, currentStrength + 5) 
          : Math.max(0, currentStrength - 2);
        progress.strengthsByOperation[question.operationType] = newStrength;

        // 更新平均用时
        const currentAvgTime = progress.averageTimeByOperation[question.operationType];
        const answerTime = answer.timeSpent / 1000; // 转换为秒
        progress.averageTimeByOperation[question.operationType] = 
          currentAvgTime === 0 ? answerTime : (currentAvgTime + answerTime) / 2;
      }
    });

    // 更新难度熟练度
    const difficultyStrength = progress.strengthsByDifficulty[session.difficulty];
    const sessionAccuracy = session.accuracy;
    progress.strengthsByDifficulty[session.difficulty] = 
      (difficultyStrength + sessionAccuracy) / 2;

    // 更新推荐难度
    progress.recommendedDifficulty = this.calculateRecommendedDifficulty(progress);

    // 更新推荐运算类型
    progress.recommendedOperations = this.calculateRecommendedOperations(progress);

    // 添加到最近会话（保留最新10个）
    progress.recentSessions = [session, ...progress.recentSessions].slice(0, 10);

    // 更新最后活跃时间
    progress.lastActiveDate = new Date();

    this.saveUserProgress(progress);
  }

  /**
   * 计算推荐难度
   */
  private static calculateRecommendedDifficulty(progress: UserProgress): DifficultyLevel {
    const currentDifficulty = progress.recommendedDifficulty;
    const currentStrength = progress.strengthsByDifficulty[currentDifficulty];

    if (currentStrength >= 80 && currentDifficulty < DifficultyLevel.EXPERT) {
      return currentDifficulty + 1;
    } else if (currentStrength < 60 && currentDifficulty > DifficultyLevel.BEGINNER) {
      return currentDifficulty - 1;
    }

    return currentDifficulty;
  }

  /**
   * 计算推荐运算类型
   */
  private static calculateRecommendedOperations(progress: UserProgress): OperationType[] {
    const operations = Object.entries(progress.strengthsByOperation)
      .sort(([,a], [,b]) => a - b) // 按熟练度升序排序
      .slice(0, 2) // 取最薄弱的两个
      .map(([operation]) => operation as OperationType);

    return operations.length > 0 ? operations : [OperationType.ADDITION];
  }

  /**
   * 获取用户设置
   */
  static getUserSettings(): UserSettings | null {
    try {
      const data = localStorage.getItem(this.KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return null;
    }
  }

  /**
   * 保存用户设置
   */
  static saveUserSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(this.KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存用户设置失败:', error);
    }
  }

  /**
   * 初始化用户设置
   */
  static initializeUserSettings(): UserSettings {
    const defaultSettings: UserSettings = {
      name: '小朋友',
      grade: 1,
      questionsPerSession: 10,
      timeLimit: 60,
      enableSound: true,
      enableAnimation: true,
      theme: 'colorful'
    };

    this.saveUserSettings(defaultSettings);
    return defaultSettings;
  }

  /**
   * 获取历史会话
   */
  static getSessionsHistory(): Session[] {
    try {
      const data = localStorage.getItem(this.KEYS.SESSIONS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取历史会话失败:', error);
      return [];
    }
  }

  /**
   * 添加会话到历史记录
   */
  static addSessionToHistory(session: Session): void {
    try {
      const history = this.getSessionsHistory();
      const updatedHistory = [session, ...history].slice(0, 50); // 保留最新50个会话
      localStorage.setItem(this.KEYS.SESSIONS_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('添加会话到历史记录失败:', error);
    }
  }

  /**
   * 获取评估记录
   */
  static getAssessments(): Assessment[] {
    try {
      const data = localStorage.getItem(this.KEYS.ASSESSMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取评估记录失败:', error);
      return [];
    }
  }

  /**
   * 添加评估记录
   */
  static addAssessment(assessment: Assessment): void {
    try {
      const assessments = this.getAssessments();
      const updatedAssessments = [assessment, ...assessments].slice(0, 20); // 保留最新20个评估
      localStorage.setItem(this.KEYS.ASSESSMENTS, JSON.stringify(updatedAssessments));
    } catch (error) {
      console.error('添加评估记录失败:', error);
    }
  }

  /**
   * 生成学习报告
   */
  static generateLearningReport(): {
    totalPracticeTime: number;
    mostPracticedOperation: OperationType;
    improvementTrend: 'improving' | 'stable' | 'declining';
    streakDays: number;
  } {
    const progress = this.getUserProgress();
    const sessions = this.getSessionsHistory();

    if (!progress || sessions.length === 0) {
      return {
        totalPracticeTime: 0,
        mostPracticedOperation: OperationType.ADDITION,
        improvementTrend: 'stable',
        streakDays: 0
      };
    }

    // 计算总练习时间
    const totalPracticeTime = sessions.reduce((total, session) => {
      const sessionTime = session.endTime ? 
        new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : 0;
      return total + sessionTime;
    }, 0);

    // 找出最常练习的运算类型
    const operationCounts = sessions.reduce((counts, session) => {
      counts[session.operationType] = (counts[session.operationType] || 0) + 1;
      return counts;
    }, {} as Record<OperationType, number>);

    const mostPracticedOperation = Object.entries(operationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as OperationType || OperationType.ADDITION;

    // 计算改进趋势
    const recentSessions = sessions.slice(0, 5);
    const oldSessions = sessions.slice(5, 10);
    
    const recentAvgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length || 0;
    const oldAvgAccuracy = oldSessions.reduce((sum, s) => sum + s.accuracy, 0) / oldSessions.length || 0;

    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvgAccuracy > oldAvgAccuracy + 5) {
      improvementTrend = 'improving';
    } else if (recentAvgAccuracy < oldAvgAccuracy - 5) {
      improvementTrend = 'declining';
    }

    // 计算连续学习天数
    const streakDays = this.calculateStreakDays(sessions);

    return {
      totalPracticeTime,
      mostPracticedOperation,
      improvementTrend,
      streakDays
    };
  }

  /**
   * 计算连续学习天数
   */
  private static calculateStreakDays(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toDateString();
    
    // 按日期分组会话
    const sessionsByDate = sessions.reduce((groups, session) => {
      const date = new Date(session.startTime).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
      return groups;
    }, {} as Record<string, Session[]>);

    let streakDays = 0;
    let currentDate = new Date(today);

    // 向前检查连续的学习日
    while (true) {
      const dateStr = currentDate.toDateString();
      if (sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakDays;
  }

  /**
   * 清除所有数据
   */
  static clearAllData(): void {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  /**
   * 导出数据
   */
  static exportData(): string {
    try {
      const data = {
        progress: this.getUserProgress(),
        settings: this.getUserSettings(),
        sessions: this.getSessionsHistory(),
        assessments: this.getAssessments(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      return '';
    }
  }

  /**
   * 导入数据
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.progress) this.saveUserProgress(data.progress);
      if (data.settings) this.saveUserSettings(data.settings);
      if (data.sessions) {
        localStorage.setItem(this.KEYS.SESSIONS_HISTORY, JSON.stringify(data.sessions));
      }
      if (data.assessments) {
        localStorage.setItem(this.KEYS.ASSESSMENTS, JSON.stringify(data.assessments));
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

// 导出默认实例方法
export const storageManager = StorageManager; 