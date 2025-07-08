'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question, Answer, OperationType, DifficultyLevel } from '@/types';
import { questionGenerator } from '@/utils/questionGenerator';

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取配置
  const difficulty = parseInt(searchParams.get('difficulty') || '1') as DifficultyLevel;
  const operationsString = searchParams.get('operations') || '';
  const operations = useMemo(() => 
    operationsString.split(',') as OperationType[], 
    [operationsString]
  );

  // 状态管理
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 使用 useRef 来保存当前题目开始时间，避免重复渲染
  const questionStartTimeRef = useRef<Date>(new Date());

  const totalQuestions = 10; // 每次练习10道题

  // 初始化题目
  useEffect(() => {
    if (operations.length > 0) {
      const generatedQuestions = questionGenerator.generateMixedQuestions(
        difficulty,
        totalQuestions,
        operations
      );
      setQuestions(generatedQuestions);
      setIsLoading(false);
      setStartTime(new Date());
      questionStartTimeRef.current = new Date();
    }
  }, [difficulty, operations]);

  // 获取当前题目
  const currentQuestion = questions[currentQuestionIndex];

  // 提交答案
  const submitAnswer = useCallback(() => {
    if (!currentQuestion || userAnswer === '') return;

    const now = new Date();
    const timeSpent = now.getTime() - questionStartTimeRef.current.getTime();
    const numericAnswer = parseFloat(userAnswer);
    const correct = numericAnswer === currentQuestion.correctAnswer;

    const answer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: numericAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: correct,
      timeSpent,
      timestamp: now
    };

    setAnswers(prev => [...prev, answer]);
    setIsCorrect(correct);
    setShowFeedback(true);

    // 3秒后自动进入下一题
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }, [currentQuestion, userAnswer]);

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      questionStartTimeRef.current = new Date();
    } else {
      // 练习结束，跳转到结果页面
      finishPractice();
    }
  };

  // 完成练习
  const finishPractice = () => {
    const sessionData = {
      questions,
      answers,
      startTime,
      endTime: new Date(),
      difficulty,
      operations: operations.join(',')
    };

    // 将结果存储到 localStorage
    localStorage.setItem('lastSession', JSON.stringify(sessionData));
    router.push('/results');
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showFeedback) {
        submitAnswer();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [submitAnswer, showFeedback]);

  // 格式化时间
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // 计算进度
  const progress = ((currentQuestionIndex + (showFeedback ? 1 : 0)) / totalQuestions) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧮</div>
          <p className="text-xl text-gray-600">正在准备题目...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">题目加载失败</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部信息栏 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 返回
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                {questionGenerator.getDifficultyDescription(difficulty)}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                题目 {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">
                用时: {formatTime(new Date().getTime() - startTime.getTime())}
              </div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {!showFeedback ? (
            // 答题界面
            <>
              <div className="mb-8">
                <div className="text-6xl font-bold text-gray-800 mb-6">
                  {currentQuestion.operand1} {currentQuestion.operator} {currentQuestion.operand2} = ?
                </div>
                
                <div className="max-w-md mx-auto">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="输入答案"
                    className="w-full text-3xl text-center border-2 border-gray-300 rounded-lg p-4 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={submitAnswer}
                  disabled={userAnswer === ''}
                  className={`px-8 py-3 rounded-lg text-xl font-bold transition-all ${
                    userAnswer === ''
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                  }`}
                >
                  提交答案
                </button>
              </div>

              <p className="text-gray-500 mt-4">按 Enter 键快速提交</p>
            </>
          ) : (
            // 反馈界面
            <div className="text-center">
              <div className={`text-8xl mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? '🎉' : '😅'}
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '答对了！' : '再想想...'}
              </h2>
              
              <div className="text-2xl text-gray-600 mb-6">
                {currentQuestion.operand1} {currentQuestion.operator} {currentQuestion.operand2} = {currentQuestion.correctAnswer}
              </div>

              {!isCorrect && (
                <div className="text-lg text-gray-600 mb-4">
                  你的答案: {userAnswer}
                </div>
              )}

              <div className="text-gray-500">
                {currentQuestionIndex < questions.length - 1 
                  ? '2秒后自动进入下一题...' 
                  : '即将显示结果...'}
              </div>
            </div>
          )}
        </div>

        {/* 答题提示 */}
        {!showFeedback && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm text-gray-600">仔细计算，不要着急</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-sm text-gray-600">
                本题用时: {formatTime(new Date().getTime() - questionStartTimeRef.current.getTime())}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm text-gray-600">
                正确率: {answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 