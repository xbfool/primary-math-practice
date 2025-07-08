'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OperationType, DifficultyLevel, UserProgress } from '@/types';
import { StorageManager } from '@/utils/storageManager';
import { questionGenerator } from '@/utils/questionGenerator';

export default function Home() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  const [selectedOperations, setSelectedOperations] = useState<OperationType[]>([OperationType.ADDITION]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    // 获取用户进度和推荐
    const progress = StorageManager.getUserProgress();
    if (progress && progress.totalSessions > 0) {
      setUserProgress(progress);
      setShowRecommendation(true);
      // 应用推荐设置作为默认值
      setSelectedDifficulty(progress.recommendedDifficulty);
      setSelectedOperations(progress.recommendedOperations);
    }
  }, []);

  const difficultyOptions = [
    { level: DifficultyLevel.BEGINNER, name: '初级', description: '10以内加减法', color: 'bg-green-500' },
    { level: DifficultyLevel.BASIC, name: '基础', description: '20以内加减法', color: 'bg-blue-500' },
    { level: DifficultyLevel.INTERMEDIATE, name: '中级', description: '100以内运算', color: 'bg-yellow-500' },
    { level: DifficultyLevel.ADVANCED, name: '高级', description: '大数运算', color: 'bg-orange-500' },
    { level: DifficultyLevel.EXPERT, name: '专家', description: '复杂运算', color: 'bg-red-500' }
  ];

  const operationOptions = [
    { type: OperationType.ADDITION, name: '加法', symbol: '+', color: 'bg-green-100 border-green-300' },
    { type: OperationType.SUBTRACTION, name: '减法', symbol: '-', color: 'bg-blue-100 border-blue-300' },
    { type: OperationType.MULTIPLICATION, name: '乘法', symbol: '×', color: 'bg-purple-100 border-purple-300' },
    { type: OperationType.DIVISION, name: '除法', symbol: '÷', color: 'bg-pink-100 border-pink-300' }
  ];

  const handleOperationToggle = (operation: OperationType) => {
    setSelectedOperations(prev => {
      if (prev.includes(operation)) {
        return prev.filter(op => op !== operation);
      } else {
        return [...prev, operation];
      }
    });
  };

  const startPractice = () => {
    if (selectedOperations.length === 0) {
      alert('请至少选择一种运算类型！');
      return;
    }

    const params = new URLSearchParams({
      difficulty: selectedDifficulty.toString(),
      operations: selectedOperations.join(',')
    });

    router.push(`/practice?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-3">
            <span className="text-4xl">🧮</span>
            小学数学练习
            <span className="text-4xl">📚</span>
          </h1>
          <p className="text-center text-gray-600 mt-2">让数学变得简单有趣！</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 欢迎卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎来到数学练习世界！ 🌟</h2>
            <p className="text-gray-600 text-lg">选择你的挑战难度和运算类型，开始你的数学冒险吧！</p>
          </div>
        </div>

        {/* 智能推荐卡片 */}
        {showRecommendation && userProgress && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <span className="text-2xl">🤖</span>
                智能推荐
                <span className="text-2xl">✨</span>
              </h3>
              <p className="text-gray-600">根据你的学习情况，为你量身定制的练习方案</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold text-gray-800">推荐难度</div>
                <div className="text-blue-600 font-bold">
                  {questionGenerator.getDifficultyDescription(userProgress.recommendedDifficulty)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl mb-2">🔢</div>
                <div className="font-bold text-gray-800">重点练习</div>
                <div className="text-green-600 font-bold">
                  {userProgress.recommendedOperations.map(op => 
                    questionGenerator.getOperationDescription(op)
                  ).join('、')}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-gray-800">总体正确率</div>
                <div className="text-purple-600 font-bold">
                  {Math.round(userProgress.overallAccuracy)}%
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    difficulty: userProgress.recommendedDifficulty.toString(),
                    operations: userProgress.recommendedOperations.join(',')
                  });
                  router.push(`/practice?${params.toString()}`);
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg font-bold"
              >
                🚀 开始推荐练习
              </button>
              <p className="text-sm text-gray-600 mt-2">或者继续自定义练习设置</p>
            </div>
          </div>
        )}

        {/* 难度选择 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            选择难度等级
            {showRecommendation && (
              <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                已应用推荐设置
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {difficultyOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => setSelectedDifficulty(option.level)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  selectedDifficulty === option.level
                    ? 'border-blue-500 bg-blue-50 transform scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${option.color} mx-auto mb-3`}></div>
                <h4 className="font-bold text-lg text-gray-800">{option.name}</h4>
                <p className="text-gray-600 text-sm mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 运算类型选择 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔢</span>
            选择运算类型（可多选）
            {showRecommendation && (
              <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                推荐重点练习
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {operationOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleOperationToggle(option.type)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  selectedOperations.includes(option.type)
                    ? 'border-blue-500 bg-blue-50 transform scale-105'
                    : `border-gray-200 ${option.color} hover:scale-105`
                }`}
              >
                <div className="text-4xl font-bold text-gray-700 mb-2">{option.symbol}</div>
                <h4 className="font-bold text-lg text-gray-800">{option.name}</h4>
              </button>
            ))}
          </div>
          {selectedOperations.length === 0 && (
            <p className="text-red-500 text-sm mt-4 text-center">请至少选择一种运算类型</p>
          )}
        </div>

        {/* 开始按钮 */}
        <div className="text-center space-y-4">
          <button
            onClick={startPractice}
            disabled={selectedOperations.length === 0}
            className={`px-12 py-4 rounded-full text-xl font-bold transition-all duration-200 ${
              selectedOperations.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🚀 开始练习
          </button>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/report')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              📊 学习报告
            </button>
            <button
              onClick={() => router.push('/worksheet')}
              className="px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all flex items-center gap-2"
            >
              📄 生成试卷
            </button>
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="font-bold text-gray-800 mb-2">智能评估</h4>
            <p className="text-gray-600 text-sm">实时分析你的表现，提供个性化建议</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="font-bold text-gray-800 mb-2">进度追踪</h4>
            <p className="text-gray-600 text-sm">记录每次练习，见证你的成长</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">📄</div>
            <h4 className="font-bold text-gray-800 mb-2">试卷生成</h4>
            <p className="text-gray-600 text-sm">制作A4打印试卷，支持自定义难度布局</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🎮</div>
            <h4 className="font-bold text-gray-800 mb-2">趣味学习</h4>
            <p className="text-gray-600 text-sm">寓教于乐，让数学变得有趣</p>
          </div>
        </div>
      </div>
    </div>
  );
}
