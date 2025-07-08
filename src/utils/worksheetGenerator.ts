import jsPDF from 'jspdf';
import { Question, OperationType, DifficultyLevel } from '@/types';
import { questionGenerator } from './questionGenerator';

export interface WorksheetConfig {
  title: string;
  studentName?: string;
  className?: string;
  date?: string;
  difficulty: DifficultyLevel;
  operations: OperationType[];
  questionCount: number;
  layout: 'single' | 'double' | 'triple'; // 每行题目数量
  showAnswers: boolean;
  includeAnswerSheet: boolean;
  fontSize: number;
  margin: number;
}

export class WorksheetGenerator {
  private pdf: jsPDF;
  private config: WorksheetConfig;
  private questions: Question[];

  constructor(config: WorksheetConfig) {
    this.config = config;
    this.pdf = new jsPDF('p', 'mm', 'a4'); // A4纸张，纵向
    this.questions = [];
  }

  /**
   * 生成试卷题目
   */
  private generateQuestions(): void {
    this.questions = questionGenerator.generateMixedQuestions(
      this.config.difficulty,
      this.config.questionCount,
      this.config.operations
    );
  }

  /**
   * 添加试卷头部
   */
  private addHeader(): void {
    const { pdf, config } = this;
    const pageWidth = 210; // A4宽度
    
    // 设置标题
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    // 使用中文兼容的方式计算文本宽度
    const titleWidth = pdf.getTextWidth(config.title) || config.title.length * 10;
    pdf.text(config.title, (pageWidth - titleWidth) / 2, 25);

    // 设置信息行
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 40;
    const leftMargin = config.margin;
    const rightSide = pageWidth - config.margin - 50;

    // 左侧信息
    if (config.studentName) {
      pdf.text(`姓名：${'_'.repeat(20)}`, leftMargin, yPos);
    }
    
    // 右侧信息
    if (config.className) {
      pdf.text(`班级：${config.className}`, rightSide, yPos);
    }
    
    yPos += 8;
    
    // 第二行
    if (config.date) {
      pdf.text(`日期：${config.date}`, leftMargin, yPos);
    }
    
    const difficultyText = questionGenerator.getDifficultyDescription(config.difficulty);
    pdf.text(`难度：${difficultyText}`, rightSide, yPos);
    
    yPos += 8;
    
    // 第三行 - 运算类型和题目数量
    const operationNames = config.operations.map(op => 
      questionGenerator.getOperationDescription(op)
    ).join('、');
    pdf.text(`运算类型：${operationNames}`, leftMargin, yPos);
    pdf.text(`题目数量：${config.questionCount}题`, rightSide, yPos);

    // 分割线
    yPos += 10;
    pdf.setLineWidth(0.5);
    pdf.line(leftMargin, yPos, pageWidth - config.margin, yPos);
  }

  /**
   * 添加试卷题目
   */
  private addQuestions(): void {
    const { pdf, config, questions } = this;
    const pageWidth = 210;
    const pageHeight = 297;
    
    pdf.setFontSize(config.fontSize);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 70; // 从头部下方开始
    let questionNum = 1;
    
    const questionsPerRow = this.getQuestionsPerRow();
    const columnWidth = (pageWidth - 2 * config.margin) / questionsPerRow;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const col = i % questionsPerRow;
      const xPos = config.margin + col * columnWidth;
      
      // 检查是否需要换页
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 30;
      }
      
      // 题目编号
      const questionText = `${questionNum}. ${question.operand1} ${question.operator} ${question.operand2} = `;
      pdf.text(questionText, xPos, yPos);
      
      // 答案区域（下划线或答案）
      const questionWidth = pdf.getTextWidth(questionText) || questionText.length * 4;
      const answerX = xPos + questionWidth;
      
      if (config.showAnswers) {
        pdf.text(question.correctAnswer.toString(), answerX, yPos);
      } else {
        // 画下划线作为答题区域
        const underlineWidth = Math.max(20, question.correctAnswer.toString().length * 8);
        pdf.line(answerX, yPos + 2, answerX + underlineWidth, yPos + 2);
      }
      
      questionNum++;
      
      // 如果是行的最后一个，换行
      if ((i + 1) % questionsPerRow === 0) {
        yPos += this.getLineSpacing();
      }
    }
  }

  /**
   * 添加答案页
   */
  private addAnswerSheet(): void {
    if (!this.config.includeAnswerSheet || this.config.showAnswers) return;
    
    const { pdf, config, questions } = this;
    
    // 新建答案页
    pdf.addPage();
    
    // 答案页标题
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleText = '参考答案';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (210 - titleWidth) / 2, 25);
    
    // 答案列表
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 40;
    const questionsPerRow = 5; // 答案页每行5个
    const columnWidth = (210 - 2 * config.margin) / questionsPerRow;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const col = i % questionsPerRow;
      const xPos = config.margin + col * columnWidth;
      
      if (yPos > 270) {
        pdf.addPage();
        yPos = 30;
      }
      
      const answerText = `${i + 1}. ${question.correctAnswer}`;
      pdf.text(answerText, xPos, yPos);
      
      if ((i + 1) % questionsPerRow === 0) {
        yPos += 12;
      }
    }
  }

  /**
   * 获取每行题目数量
   */
  private getQuestionsPerRow(): number {
    switch (this.config.layout) {
      case 'single': return 1;
      case 'double': return 2;
      case 'triple': return 3;
      default: return 2;
    }
  }

  /**
   * 获取行间距
   */
  private getLineSpacing(): number {
    return this.config.fontSize + 15;
  }

  /**
   * 生成并下载PDF
   */
  public generatePDF(): void {
    // 生成题目
    this.generateQuestions();
    
    // 添加内容
    this.addHeader();
    this.addQuestions();
    this.addAnswerSheet();
    
    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10);
    const difficultyText = questionGenerator.getDifficultyDescription(this.config.difficulty);
    const fileName = `数学练习题_${difficultyText}_${this.config.questionCount}题_${timestamp}.pdf`;
    
    // 下载PDF
    this.pdf.save(fileName);
  }

  /**
   * 预览PDF数据
   */
  public getPreviewData(): string {
    this.generateQuestions();
    this.addHeader();
    this.addQuestions();
    this.addAnswerSheet();
    
    return this.pdf.output('datauristring');
  }

  /**
   * 获取生成的题目（用于预览）
   */
  public getQuestions(): Question[] {
    if (this.questions.length === 0) {
      this.generateQuestions();
    }
    return this.questions;
  }
}

// 预设配置
export const WORKSHEET_PRESETS = {
  elementary: {
    title: '小学数学练习题',
    difficulty: DifficultyLevel.BEGINNER,
    operations: [OperationType.ADDITION, OperationType.SUBTRACTION],
    questionCount: 20,
    layout: 'double' as const,
    showAnswers: false,
    includeAnswerSheet: true,
    fontSize: 14,
    margin: 20
  },
  intermediate: {
    title: '小学数学练习题（中级）',
    difficulty: DifficultyLevel.INTERMEDIATE,
    operations: [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION],
    questionCount: 25,
    layout: 'double' as const,
    showAnswers: false,
    includeAnswerSheet: true,
    fontSize: 13,
    margin: 20
  },
  advanced: {
    title: '小学数学练习题（高级）',
    difficulty: DifficultyLevel.ADVANCED,
    operations: [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION, OperationType.DIVISION],
    questionCount: 30,
    layout: 'triple' as const,
    showAnswers: false,
    includeAnswerSheet: true,
    fontSize: 12,
    margin: 20
  }
};

export const worksheetGenerator = WorksheetGenerator; 