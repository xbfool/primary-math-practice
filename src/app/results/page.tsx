'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Answer, OperationType, DifficultyLevel } from '@/types';
import { questionGenerator } from '@/utils/questionGenerator';

interface SessionResult {
  questions: Question[];
  answers: Answer[];
  startTime: string;
  endTime: string;
  difficulty: DifficultyLevel;
  operations: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 获取会话数据
    const data = localStorage.getItem('lastSession');
    if (data) {
      const parsedData = JSON.parse(data);
      setSessionData(parsedData);
      
      // 创建Session对象并保存到存储管理器
      const session = {
        id: `session_${Date.now()}`,
        startTime: new Date(parsedData.startTime),
        endTime: new Date(parsedData.endTime),
        difficulty: parsedData.difficulty,
        operationType: parsedData.operations.split(',')[0] as OperationType, // 使用第一个运算类型
        questions: parsedData.questions,
        answers: parsedData.answers,
        score: Math.round((parsedData.answers.filter((a: Answer) => a.isCorrect).length / parsedData.questions.length) * 100),
        accuracy: Math.round((parsedData.answers.filter((a: Answer) => a.isCorrect).length / parsedData.questions.length) * 100),
        averageTime: Math.round(parsedData.answers.reduce((sum: number, a: Answer) => sum + a.timeSpent, 0) / parsedData.answers.length)
      };
      
      // 保存会话和更新进度
      import('@/utils/storageManager').then(({ StorageManager }) => {
        StorageManager.addSessionToHistory(session);
        StorageManager.updateUserProgress(session);
      });
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl text-gray-600">正在分析结果...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">没有找到练习结果</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 计算统计数据
  const totalQuestions = sessionData.questions.length;
  const correctAnswers = sessionData.answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTime = new Date(sessionData.endTime).getTime() - new Date(sessionData.startTime).getTime();
  const averageTime = Math.round(totalTime / totalQuestions / 1000); // 秒

  // 计算得分 (0-100)
  const timeBonus = Math.max(0, 100 - averageTime * 2); // 时间奖励
  const score = Math.round((accuracy * 0.7) + (timeBonus * 0.3));

  // 按运算类型分析
  const operationStats = sessionData.answers.reduce((stats, answer) => {
    const question = sessionData.questions.find(q => q.id === answer.questionId);
    if (question) {
      if (!stats[question.operationType]) {
        stats[question.operationType] = { total: 0, correct: 0 };
      }
      stats[question.operationType].total++;
      if (answer.isCorrect) {
        stats[question.operationType].correct++;
      }
    }
    return stats;
  }, {} as Record<OperationType, { total: number; correct: number }>);

  // 获取评价
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', comment: '优秀！', color: 'text-green-600', emoji: '🌟' };
    if (score >= 80) return { grade: 'A', comment: '很好！', color: 'text-blue-600', emoji: '🎉' };
    if (score >= 70) return { grade: 'B+', comment: '良好！', color: 'text-yellow-600', emoji: '👍' };
    if (score >= 60) return { grade: 'B', comment: '合格！', color: 'text-orange-600', emoji: '😊' };
    return { grade: 'C', comment: '需要加油！', color: 'text-red-600', emoji: '💪' };
  };

  const gradeInfo = getGrade(score);

  // 生成建议
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (accuracy < 70) {
      recommendations.push('建议降低难度，先熟练掌握基础运算');
    }
    if (averageTime > 30) {
      recommendations.push('可以通过多练习来提高计算速度');
    }
    
    // 分析薄弱环节
    Object.entries(operationStats).forEach(([operation, stats]) => {
      const operationAccuracy = (stats.correct / stats.total) * 100;
      if (operationAccuracy < 70) {
        const operationName = questionGenerator.getOperationDescription(operation as OperationType);
        recommendations.push(`${operationName}运算需要加强练习`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('表现很好！可以尝试更高难度的挑战');
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-3">
            <span className="text-4xl">📊</span>
            练习结果
            <span className="text-4xl">🎯</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 总体成绩卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <div className="text-8xl mb-4">{gradeInfo.emoji}</div>
          <h2 className={`text-4xl font-bold mb-2 ${gradeInfo.color}`}>
            {score} 分
          </h2>
          <div className={`text-2xl font-bold mb-4 ${gradeInfo.color}`}>
            {gradeInfo.grade} - {gradeInfo.comment}
          </div>
          <div className="text-gray-600">
            {questionGenerator.getDifficultyDescription(sessionData.difficulty)}
          </div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
            <div className="text-gray-600">答对题数</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-gray-600">正确率</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-purple-600">{formatTime(totalTime)}</div>
            <div className="text-gray-600">总用时</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-orange-600">{averageTime}秒</div>
            <div className="text-gray-600">平均用时</div>
          </div>
        </div>

        {/* 运算类型分析 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            各运算类型表现
          </h3>
          <div className="space-y-4">
            {Object.entries(operationStats).map(([operation, stats]) => {
              const operationAccuracy = Math.round((stats.correct / stats.total) * 100);
              const operationName = questionGenerator.getOperationDescription(operation as OperationType);
              
              return (
                <div key={operation} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-lg">{operationName}</div>
                    <div className="text-gray-600">
                      {stats.correct}/{stats.total} 题
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          operationAccuracy >= 80 ? 'bg-green-500' :
                          operationAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${operationAccuracy}%` }}
                      ></div>
                    </div>
                    <div className="font-bold text-lg w-12 text-right">
                      {operationAccuracy}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 建议和分析 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            个性化建议
          </h3>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-500 mt-1">•</div>
                <div className="text-gray-700">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            再来一次
          </button>
          <button
            onClick={() => {
              const difficultyLevel = accuracy >= 85 ? sessionData.difficulty + 1 : sessionData.difficulty;
              const params = new URLSearchParams({
                difficulty: Math.min(difficultyLevel, 5).toString(),
                operations: sessionData.operations
              });
              router.push(`/practice?${params.toString()}`);
            }}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          >
            {accuracy >= 85 ? '挑战更高难度' : '继续练习'}
          </button>
        </div>

        {/* 错题回顾 */}
        {sessionData.answers.some(a => !a.isCorrect) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              错题回顾
            </h3>
            <div className="space-y-4">
              {sessionData.answers
                .filter(answer => !answer.isCorrect)
                .map((answer, index) => {
                  const question = sessionData.questions.find(q => q.id === answer.questionId);
                  if (!question) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-lg">
                          {question.operand1} {question.operator} {question.operand2} = ?
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-sm text-gray-600">你的答案</div>
                          <div className="text-red-600 font-bold">{answer.userAnswer}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">正确答案</div>
                          <div className="text-green-600 font-bold">{answer.correctAnswer}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 