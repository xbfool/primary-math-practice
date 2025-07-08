'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OperationType, DifficultyLevel } from '@/types';
import { WorksheetGenerator, WorksheetConfig, WORKSHEET_PRESETS } from '@/utils/worksheetGenerator';
import { questionGenerator } from '@/utils/questionGenerator';

export default function WorksheetPage() {
  const router = useRouter();
  
  // 试卷配置状态
  const [config, setConfig] = useState<WorksheetConfig>({
    title: '小学数学练习题',
    studentName: '',
    className: '',
    date: new Date().toISOString().slice(0, 10),
    difficulty: DifficultyLevel.BEGINNER,
    operations: [OperationType.ADDITION],
    questionCount: 20,
    layout: 'double',
    showAnswers: false,
    includeAnswerSheet: true,
    fontSize: 14,
    margin: 20
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);

  // 难度选项
  const difficultyOptions = [
    { level: DifficultyLevel.BEGINNER, name: '初级', description: '10以内加减法' },
    { level: DifficultyLevel.BASIC, name: '基础', description: '20以内加减法' },
    { level: DifficultyLevel.INTERMEDIATE, name: '中级', description: '100以内运算' },
    { level: DifficultyLevel.ADVANCED, name: '高级', description: '大数运算' },
    { level: DifficultyLevel.EXPERT, name: '专家', description: '复杂运算' }
  ];

  // 运算类型选项
  const operationOptions = [
    { type: OperationType.ADDITION, name: '加法', symbol: '+' },
    { type: OperationType.SUBTRACTION, name: '减法', symbol: '-' },
    { type: OperationType.MULTIPLICATION, name: '乘法', symbol: '×' },
    { type: OperationType.DIVISION, name: '除法', symbol: '÷' }
  ];

  // 布局选项
  const layoutOptions = [
    { value: 'single', name: '单列', description: '每行1题，适合复杂运算' },
    { value: 'double', name: '双列', description: '每行2题，常用布局' },
    { value: 'triple', name: '三列', description: '每行3题，适合简单运算' }
  ];

  // 更新配置
  const updateConfig = (key: keyof WorksheetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 处理运算类型选择
  const handleOperationToggle = (operation: OperationType) => {
    setConfig(prev => ({
      ...prev,
      operations: prev.operations.includes(operation)
        ? prev.operations.filter(op => op !== operation)
        : [...prev.operations, operation]
    }));
  };

  // 应用预设
  const applyPreset = (presetKey: keyof typeof WORKSHEET_PRESETS) => {
    const preset = WORKSHEET_PRESETS[presetKey];
    setConfig(prev => ({
      ...prev,
      ...preset
    }));
  };

  // 生成预览题目
  const generatePreview = () => {
    if (config.operations.length === 0) return;
    
    const generator = new WorksheetGenerator(config);
    const questions = generator.getQuestions();
    setPreviewQuestions(questions.slice(0, 6)); // 只显示前6题作为预览
  };

  // 生成PDF
  const generatePDF = async () => {
    if (config.operations.length === 0) {
      alert('请至少选择一种运算类型！');
      return;
    }

    setIsGenerating(true);
    try {
      const generator = new WorksheetGenerator(config);
      generator.generatePDF();
    } catch (error) {
      console.error('生成PDF失败:', error);
      alert('生成PDF失败，请重试！');
    } finally {
      setIsGenerating(false);
    }
  };

  // 当配置变化时更新预览
  useEffect(() => {
    generatePreview();
  }, [config]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 返回
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">📄</span>
                试卷生成器
                <span className="text-4xl">🖨️</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧配置面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预设模板 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                快速模板
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => applyPreset('elementary')}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  <div className="text-green-600 font-bold text-lg">初级模板</div>
                  <div className="text-gray-600 text-sm">20题 | 加减法 | 双列</div>
                </button>
                <button
                  onClick={() => applyPreset('intermediate')}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="text-blue-600 font-bold text-lg">中级模板</div>
                  <div className="text-gray-600 text-sm">25题 | 加减乘 | 双列</div>
                </button>
                <button
                  onClick={() => applyPreset('advanced')}
                  className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <div className="text-purple-600 font-bold text-lg">高级模板</div>
                  <div className="text-gray-600 text-sm">30题 | 四则运算 | 三列</div>
                </button>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                试卷信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">试卷标题</label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => updateConfig('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                  <input
                    type="date"
                    value={config.date}
                    onChange={(e) => updateConfig('date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">班级（可选）</label>
                  <input
                    type="text"
                    value={config.className}
                    onChange={(e) => updateConfig('className', e.target.value)}
                    placeholder="如：三年级二班"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">题目数量</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={config.questionCount}
                    onChange={(e) => updateConfig('questionCount', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 难度选择 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                难度等级
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.level}
                    onClick={() => updateConfig('difficulty', option.level)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.difficulty === option.level
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-lg">{option.name}</div>
                    <div className="text-gray-600 text-sm">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 运算类型 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔢</span>
                运算类型
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {operationOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleOperationToggle(option.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.operations.includes(option.type)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl font-bold">{option.symbol}</div>
                    <div className="font-medium">{option.name}</div>
                  </button>
                ))}
              </div>
              {config.operations.length === 0 && (
                <p className="text-red-500 text-sm mt-2">请至少选择一种运算类型</p>
              )}
            </div>

            {/* 布局设置 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📐</span>
                版面设置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">题目布局</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {layoutOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateConfig('layout', option.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          config.layout === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{option.name}</div>
                        <div className="text-gray-600 text-xs">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
                    <select
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value={10}>10pt (小)</option>
                      <option value={12}>12pt (中)</option>
                      <option value={14}>14pt (大)</option>
                      <option value={16}>16pt (特大)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">页边距</label>
                    <select
                      value={config.margin}
                      onChange={(e) => updateConfig('margin', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value={15}>15mm (窄)</option>
                      <option value={20}>20mm (标准)</option>
                      <option value={25}>25mm (宽)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showAnswers"
                      checked={config.showAnswers}
                      onChange={(e) => updateConfig('showAnswers', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showAnswers" className="text-sm font-medium text-gray-700">
                      显示答案（生成答案版试卷）
                    </label>
                  </div>
                  
                  {!config.showAnswers && (
                    <div className="flex items-center ml-6">
                      <input
                        type="checkbox"
                        id="includeAnswerSheet"
                        checked={config.includeAnswerSheet}
                        onChange={(e) => updateConfig('includeAnswerSheet', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="includeAnswerSheet" className="text-sm font-medium text-gray-700">
                        附加答案页
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧预览和生成 */}
          <div className="space-y-6">
            {/* 预览区域 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👀</span>
                题目预览
              </h3>
              
              {previewQuestions.length > 0 ? (
                <div className="space-y-3 mb-6">
                  <div className="text-center border-b pb-3">
                    <div className="font-bold text-lg">{config.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {questionGenerator.getDifficultyDescription(config.difficulty)} | {config.questionCount}题
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {previewQuestions.map((question, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>
                          {index + 1}. {question.operand1} {question.operator} {question.operand2} = 
                        </span>
                        {config.showAnswers ? (
                          <span className="font-bold text-blue-600">{question.correctAnswer}</span>
                        ) : (
                          <span className="text-gray-400">______</span>
                        )}
                      </div>
                    ))}
                    {config.questionCount > 6 && (
                      <div className="text-center text-gray-500 text-xs pt-2">
                        ... 还有 {config.questionCount - 6} 题
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  请选择运算类型查看预览
                </div>
              )}

              {/* 生成按钮 */}
              <button
                onClick={generatePDF}
                disabled={isGenerating || config.operations.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                  isGenerating || config.operations.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    生成中...
                  </span>
                ) : (
                  '🖨️ 生成PDF试卷'
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                生成的PDF将自动下载到您的设备
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 