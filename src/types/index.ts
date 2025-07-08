// 运算类型
export enum OperationType {
  ADDITION = 'addition',      // 加法
  SUBTRACTION = 'subtraction', // 减法
  MULTIPLICATION = 'multiplication', // 乘法
  DIVISION = 'division'        // 除法
}

// 难度等级
export enum DifficultyLevel {
  BEGINNER = 1,    // 初级: 10以内加减法
  BASIC = 2,       // 基础: 20以内加减法
  INTERMEDIATE = 3, // 中级: 100以内加减法，简单乘除法
  ADVANCED = 4,    // 高级: 大数运算，复杂乘除法
  EXPERT = 5       // 专家: 混合运算
}

// 题目结构
export interface Question {
  id: string;
  operationType: OperationType;
  difficulty: DifficultyLevel;
  operand1: number;
  operand2: number;
  operator: string;
  correctAnswer: number;
  createdAt: Date;
}

// 答题记录
export interface Answer {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // 答题用时（毫秒）
  timestamp: Date;
}

// 练习会话
export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  difficulty: DifficultyLevel;
  operationType: OperationType;
  questions: Question[];
  answers: Answer[];
  score: number;
  accuracy: number; // 正确率
  averageTime: number; // 平均答题时间
}

// 用户进度统计
export interface UserProgress {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  strengthsByOperation: Record<OperationType, number>; // 各运算类型的熟练度
  strengthsByDifficulty: Record<DifficultyLevel, number>; // 各难度的掌握程度
  averageTimeByOperation: Record<OperationType, number>; // 各运算类型的平均用时
  recentSessions: Session[];
  recommendedDifficulty: DifficultyLevel;
  recommendedOperations: OperationType[];
  lastActiveDate: Date;
}

// 评估结果
export interface Assessment {
  date: Date;
  overallScore: number; // 综合评分 (0-100)
  strengths: OperationType[]; // 擅长的运算类型
  weaknesses: OperationType[]; // 薄弱的运算类型
  recommendations: Recommendation[];
  progressTrend: 'improving' | 'stable' | 'declining';
}

// 推荐建议
export interface Recommendation {
  type: 'practice' | 'review' | 'challenge';
  operationType: OperationType;
  difficulty: DifficultyLevel;
  reason: string;
  priority: number; // 优先级 1-5
}

// 用户设置
export interface UserSettings {
  name: string;
  grade: number; // 年级
  questionsPerSession: number; // 每次练习题目数量
  timeLimit: number; // 答题时限（秒）
  enableSound: boolean; // 是否开启音效
  enableAnimation: boolean; // 是否开启动画
  theme: 'light' | 'dark' | 'colorful';
}

// 题目生成配置
export interface QuestionConfig {
  operationType: OperationType;
  difficulty: DifficultyLevel;
  count: number;
  minValue?: number;
  maxValue?: number;
  allowNegative?: boolean;
  allowDecimals?: boolean;
} 