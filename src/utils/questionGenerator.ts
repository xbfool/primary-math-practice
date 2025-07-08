import { Question, QuestionConfig, OperationType, DifficultyLevel } from '@/types';

// 难度配置映射
const DIFFICULTY_CONFIG = {
  [DifficultyLevel.BEGINNER]: {
    [OperationType.ADDITION]: { min: 1, max: 10 },
    [OperationType.SUBTRACTION]: { min: 1, max: 10 },
    [OperationType.MULTIPLICATION]: { min: 1, max: 5 },
    [OperationType.DIVISION]: { min: 2, max: 10 }
  },
  [DifficultyLevel.BASIC]: {
    [OperationType.ADDITION]: { min: 1, max: 20 },
    [OperationType.SUBTRACTION]: { min: 1, max: 20 },
    [OperationType.MULTIPLICATION]: { min: 1, max: 10 },
    [OperationType.DIVISION]: { min: 2, max: 20 }
  },
  [DifficultyLevel.INTERMEDIATE]: {
    [OperationType.ADDITION]: { min: 10, max: 100 },
    [OperationType.SUBTRACTION]: { min: 10, max: 100 },
    [OperationType.MULTIPLICATION]: { min: 2, max: 12 },
    [OperationType.DIVISION]: { min: 2, max: 100 }
  },
  [DifficultyLevel.ADVANCED]: {
    [OperationType.ADDITION]: { min: 100, max: 1000 },
    [OperationType.SUBTRACTION]: { min: 100, max: 1000 },
    [OperationType.MULTIPLICATION]: { min: 10, max: 99 },
    [OperationType.DIVISION]: { min: 10, max: 1000 }
  },
  [DifficultyLevel.EXPERT]: {
    [OperationType.ADDITION]: { min: 100, max: 9999 },
    [OperationType.SUBTRACTION]: { min: 100, max: 9999 },
    [OperationType.MULTIPLICATION]: { min: 10, max: 999 },
    [OperationType.DIVISION]: { min: 10, max: 9999 }
  }
};

// 运算符映射
const OPERATOR_SYMBOLS = {
  [OperationType.ADDITION]: '+',
  [OperationType.SUBTRACTION]: '-',
  [OperationType.MULTIPLICATION]: '×',
  [OperationType.DIVISION]: '÷'
};

export class QuestionGenerator {
  /**
   * 生成随机数字
   */
  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成加法题目
   */
  private generateAddition(difficulty: DifficultyLevel): Question {
    const config = DIFFICULTY_CONFIG[difficulty][OperationType.ADDITION];
    const operand1 = this.generateRandomNumber(config.min, config.max);
    const operand2 = this.generateRandomNumber(config.min, config.max);
    
    return {
      id: this.generateId(),
      operationType: OperationType.ADDITION,
      difficulty,
      operand1,
      operand2,
      operator: OPERATOR_SYMBOLS[OperationType.ADDITION],
      correctAnswer: operand1 + operand2,
      createdAt: new Date()
    };
  }

  /**
   * 生成减法题目（确保结果为正数）
   */
  private generateSubtraction(difficulty: DifficultyLevel): Question {
    const config = DIFFICULTY_CONFIG[difficulty][OperationType.SUBTRACTION];
    const operand1 = this.generateRandomNumber(config.min, config.max);
    const operand2 = this.generateRandomNumber(config.min, Math.min(operand1, config.max));
    
    return {
      id: this.generateId(),
      operationType: OperationType.SUBTRACTION,
      difficulty,
      operand1,
      operand2,
      operator: OPERATOR_SYMBOLS[OperationType.SUBTRACTION],
      correctAnswer: operand1 - operand2,
      createdAt: new Date()
    };
  }

  /**
   * 生成乘法题目
   */
  private generateMultiplication(difficulty: DifficultyLevel): Question {
    const config = DIFFICULTY_CONFIG[difficulty][OperationType.MULTIPLICATION];
    const operand1 = this.generateRandomNumber(config.min, config.max);
    const operand2 = this.generateRandomNumber(config.min, config.max);
    
    return {
      id: this.generateId(),
      operationType: OperationType.MULTIPLICATION,
      difficulty,
      operand1,
      operand2,
      operator: OPERATOR_SYMBOLS[OperationType.MULTIPLICATION],
      correctAnswer: operand1 * operand2,
      createdAt: new Date()
    };
  }

  /**
   * 生成除法题目（确保结果为整数）
   */
  private generateDivision(difficulty: DifficultyLevel): Question {
    const config = DIFFICULTY_CONFIG[difficulty][OperationType.DIVISION];
    
    // 先生成商和除数，再计算被除数，确保整除
    const quotient = this.generateRandomNumber(config.min, config.max);
    const divisor = this.generateRandomNumber(2, Math.min(config.max, 12));
    const dividend = quotient * divisor;
    
    return {
      id: this.generateId(),
      operationType: OperationType.DIVISION,
      difficulty,
      operand1: dividend,
      operand2: divisor,
      operator: OPERATOR_SYMBOLS[OperationType.DIVISION],
      correctAnswer: quotient,
      createdAt: new Date()
    };
  }

  /**
   * 生成单个题目
   */
  generateQuestion(operationType: OperationType, difficulty: DifficultyLevel): Question {
    switch (operationType) {
      case OperationType.ADDITION:
        return this.generateAddition(difficulty);
      case OperationType.SUBTRACTION:
        return this.generateSubtraction(difficulty);
      case OperationType.MULTIPLICATION:
        return this.generateMultiplication(difficulty);
      case OperationType.DIVISION:
        return this.generateDivision(difficulty);
      default:
        throw new Error(`不支持的运算类型: ${operationType}`);
    }
  }

  /**
   * 批量生成题目
   */
  generateQuestions(config: QuestionConfig): Question[] {
    const questions: Question[] = [];
    
    for (let i = 0; i < config.count; i++) {
      questions.push(this.generateQuestion(config.operationType, config.difficulty));
    }
    
    return questions;
  }

  /**
   * 生成混合题目集合
   */
  generateMixedQuestions(
    difficulty: DifficultyLevel, 
    count: number, 
    operations: OperationType[] = [OperationType.ADDITION, OperationType.SUBTRACTION]
  ): Question[] {
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomOperation = operations[Math.floor(Math.random() * operations.length)];
      questions.push(this.generateQuestion(randomOperation, difficulty));
    }
    
    // 打乱题目顺序
    return this.shuffleArray(questions);
  }

  /**
   * 打乱数组顺序
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 获取难度描述
   */
  getDifficultyDescription(difficulty: DifficultyLevel): string {
    const descriptions = {
      [DifficultyLevel.BEGINNER]: '初级 - 10以内运算',
      [DifficultyLevel.BASIC]: '基础 - 20以内运算',
      [DifficultyLevel.INTERMEDIATE]: '中级 - 100以内运算',
      [DifficultyLevel.ADVANCED]: '高级 - 大数运算',
      [DifficultyLevel.EXPERT]: '专家 - 复杂运算'
    };
    return descriptions[difficulty];
  }

  /**
   * 获取运算类型描述
   */
  getOperationDescription(operation: OperationType): string {
    const descriptions = {
      [OperationType.ADDITION]: '加法',
      [OperationType.SUBTRACTION]: '减法',
      [OperationType.MULTIPLICATION]: '乘法',
      [OperationType.DIVISION]: '除法'
    };
    return descriptions[operation];
  }
}

// 导出默认实例
export const questionGenerator = new QuestionGenerator(); 