'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProgress, Session, OperationType, DifficultyLevel } from '@/types';
import { StorageManager } from '@/utils/storageManager';
import { questionGenerator } from '@/utils/questionGenerator';

export default function ReportPage() {
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [sessionsHistory, setSessionsHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取用户数据
    const progress = StorageManager.getUserProgress();
    const sessions = StorageManager.getSessionsHistory();
    
    setUserProgress(progress);
    setSessionsHistory(sessions);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-xl text-gray-600">正在生成学习报告...</p>
        </div>
      </div>
    );
  }

  if (!userProgress || sessionsHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">还没有学习记录</h2>
          <p className="text-gray-600 mb-6">开始你的第一次数学练习吧！</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            开始练习
          </button>
        </div>
      </div>
    );
  }

  // 生成学习报告
  const learningReport = StorageManager.generateLearningReport();

  // 计算最近7天的活动
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const dailyActivity = last7Days.map(dateStr => {
    const sessionsOnDate = sessionsHistory.filter(session => 
      new Date(session.startTime).toDateString() === dateStr
    );
    return {
      date: dateStr,
      sessionCount: sessionsOnDate.length,
      totalQuestions: sessionsOnDate.reduce((sum, session) => sum + session.questions.length, 0),
      avgAccuracy: sessionsOnDate.length > 0 
        ? Math.round(sessionsOnDate.reduce((sum, session) => sum + session.accuracy, 0) / sessionsOnDate.length)
        : 0
    };
  });

  // 获取等级
  const getLevel = (totalQuestions: number) => {
    if (totalQuestions < 50) return { level: '新手', emoji: '🌱', color: 'text-green-600' };
    if (totalQuestions < 200) return { level: '学徒', emoji: '📚', color: 'text-blue-600' };
    if (totalQuestions < 500) return { level: '熟练', emoji: '⭐', color: 'text-yellow-600' };
    if (totalQuestions < 1000) return { level: '专家', emoji: '🏆', color: 'text-orange-600' };
    return { level: '大师', emoji: '👑', color: 'text-purple-600' };
  };

  const levelInfo = getLevel(userProgress.totalQuestions);

  // 格式化时间
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
  };

  // 获取趋势描述
  const getTrendDescription = (trend: string) => {
    switch (trend) {
      case 'improving': return { text: '进步中', emoji: '📈', color: 'text-green-600' };
      case 'declining': return { text: '需努力', emoji: '📉', color: 'text-red-600' };
      default: return { text: '稳定', emoji: '📊', color: 'text-blue-600' };
    }
  };

  const trendInfo = getTrendDescription(learningReport.improvementTrend);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 返回
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">📈</span>
                学习报告
                <span className="text-4xl">🎯</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 总体概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">{levelInfo.emoji}</div>
            <div className={`text-2xl font-bold mb-2 ${levelInfo.color}`}>
              {levelInfo.level}
            </div>
            <div className="text-gray-600">当前等级</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {learningReport.streakDays}天
            </div>
            <div className="text-gray-600">连续学习</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round(userProgress.overallAccuracy)}%
            </div>
            <div className="text-gray-600">总体正确率</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">{trendInfo.emoji}</div>
            <div className={`text-2xl font-bold mb-2 ${trendInfo.color}`}>
              {trendInfo.text}
            </div>
            <div className="text-gray-600">学习趋势</div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 学习统计 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              学习统计
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">总练习次数</span>
                <span className="font-bold text-blue-600">{userProgress.totalSessions}次</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">总题目数量</span>
                <span className="font-bold text-green-600">{userProgress.totalQuestions}题</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">答对题目</span>
                <span className="font-bold text-purple-600">{userProgress.totalCorrect}题</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">总练习时间</span>
                <span className="font-bold text-orange-600">
                  {formatTime(learningReport.totalPracticeTime)}
                </span>
              </div>
            </div>
          </div>

          {/* 运算类型分析 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              运算类型熟练度
            </h3>
            <div className="space-y-4">
              {Object.entries(userProgress.strengthsByOperation).map(([operation, strength]) => {
                const operationName = questionGenerator.getOperationDescription(operation as OperationType);
                const avgTime = userProgress.averageTimeByOperation[operation as OperationType];
                
                return (
                  <div key={operation} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{operationName}</span>
                      <span className="text-sm text-gray-600">
                        {Math.round(strength)}% • 平均{Math.round(avgTime)}秒
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          strength >= 80 ? 'bg-green-500' :
                          strength >= 60 ? 'bg-yellow-500' :
                          strength >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(strength, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 最近7天活动 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            最近7天活动
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {dailyActivity.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
              const isToday = day.date === new Date().toDateString();
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">{dayName}</div>
                  <div 
                    className={`w-full h-16 rounded-lg flex items-center justify-center text-sm font-bold ${
                      day.sessionCount === 0 
                        ? 'bg-gray-100 text-gray-400' 
                        : day.sessionCount === 1
                        ? 'bg-blue-100 text-blue-600'
                        : day.sessionCount === 2
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    title={`${day.sessionCount}次练习, ${day.totalQuestions}题, ${day.avgAccuracy}%正确率`}
                  >
                    {day.sessionCount > 0 ? day.sessionCount : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>无练习</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>1次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>2次</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-100 rounded"></div>
              <span>3次+</span>
            </div>
          </div>
        </div>

        {/* 智能推荐 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            智能推荐
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-3">推荐难度</h4>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {questionGenerator.getDifficultyDescription(userProgress.recommendedDifficulty)}
              </div>
              <p className="text-blue-700 text-sm">
                根据你的当前水平，建议练习这个难度
              </p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-lg">
              <h4 className="font-bold text-green-800 mb-3">重点练习</h4>
              <div className="space-y-2">
                {userProgress.recommendedOperations.map(operation => (
                  <div key={operation} className="font-bold text-green-600">
                    {questionGenerator.getOperationDescription(operation)}
                  </div>
                ))}
              </div>
              <p className="text-green-700 text-sm mt-2">
                这些运算类型需要加强练习
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              const params = new URLSearchParams({
                difficulty: userProgress.recommendedDifficulty.toString(),
                operations: userProgress.recommendedOperations.join(',')
              });
              router.push(`/practice?${params.toString()}`);
            }}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            开始推荐练习
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            自定义练习
          </button>
        </div>
      </div>
    </div>
  );
} 