/**
 * 生态知识问答组件
 * 支持 inline, modal, hotspot 三种模式
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Lightbulb, Award, ChevronRight } from 'lucide-react'
import { EcoQuestion, QuizCategory, QuizResult } from '@/types/eco'
import { 
  getRandomQuestions, 
  categoryNames, 
  categoryIcons, 
  difficultyPoints 
} from '@/data/ecoQuizData'
import { addLearnPoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { cn } from '@/lib/utils'

interface EcoQuizProps {
  mode?: 'inline' | 'modal' | 'hotspot'
  category?: QuizCategory
  questionCount?: number
  questions?: EcoQuestion[]
  onComplete?: (result: QuizResult) => void
  onClose?: () => void
  isOpen?: boolean
  className?: string
}

export default function EcoQuiz({
  mode = 'inline',
  category,
  questionCount = 5,
  questions: providedQuestions,
  onComplete,
  onClose,
  isOpen = true,
  className
}: EcoQuizProps) {
  const [questions] = useState<EcoQuestion[]>(() => 
    providedQuestions || getRandomQuestions(questionCount, category)
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(index)
    setShowExplanation(true)
    
    if (index === currentQuestion.correctIndex) {
      const points = difficultyPoints[currentQuestion.difficulty]
      setCorrectCount(prev => prev + 1)
      setTotalPoints(prev => prev + points)
      addLearnPoints(
        `答对问题：${currentQuestion.question.slice(0, 20)}...`,
        points
      )
    }
  }, [selectedAnswer, currentQuestion])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // 完成问答
      const result: QuizResult = {
        totalQuestions: questions.length,
        correctAnswers: correctCount + (isCorrect ? 1 : 0),
        pointsEarned: totalPoints + (isCorrect ? difficultyPoints[currentQuestion.difficulty] : 0),
        timeSpent: Math.round((Date.now() - startTime) / 1000)
      }
      
      // 完成奖励
      if (result.correctAnswers >= questions.length * 0.6) {
        addLearnPoints('完成生态问答', POINTS_REWARDS.quiz_complete)
      }
      
      setIsComplete(true)
      onComplete?.(result)
    }
  }, [currentIndex, questions, correctCount, isCorrect, totalPoints, currentQuestion, startTime, onComplete])

  // 问答内容
  const QuizContent = () => (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-eco-500 rounded-full"
          />
        </div>
        <span className="text-sm text-ink-500">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* 类别标签 */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{categoryIcons[currentQuestion.category]}</span>
        <span className="text-sm text-ink-500">{categoryNames[currentQuestion.category]}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          currentQuestion.difficulty === 'easy' && 'bg-eco-100 text-eco-600',
          currentQuestion.difficulty === 'medium' && 'bg-heritage-100 text-heritage-600',
          currentQuestion.difficulty === 'hard' && 'bg-primary-100 text-primary-600'
        )}>
          {currentQuestion.difficulty === 'easy' ? '简单' : 
           currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
        </span>
      </div>

      {/* 问题 */}
      <h3 className="text-lg font-medium text-ink-800">
        {currentQuestion.question}
      </h3>

      {/* 选项 */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={selectedAnswer === null ? { scale: 1.01 } : undefined}
            whileTap={selectedAnswer === null ? { scale: 0.99 } : undefined}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all',
              selectedAnswer === null && 'hover:border-eco-300 hover:bg-eco-50',
              selectedAnswer === index && index === currentQuestion.correctIndex && 
                'border-eco-500 bg-eco-50',
              selectedAnswer === index && index !== currentQuestion.correctIndex && 
                'border-red-500 bg-red-50',
              selectedAnswer !== null && index === currentQuestion.correctIndex && 
                selectedAnswer !== index && 'border-eco-300 bg-eco-50/50',
              selectedAnswer !== null && index !== currentQuestion.correctIndex && 
                selectedAnswer !== index && 'opacity-50',
              selectedAnswer === null && 'border-ink-200 bg-white'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                selectedAnswer === index && index === currentQuestion.correctIndex && 
                  'bg-eco-500 text-white',
                selectedAnswer === index && index !== currentQuestion.correctIndex && 
                  'bg-red-500 text-white',
                selectedAnswer !== null && index === currentQuestion.correctIndex && 
                  selectedAnswer !== index && 'bg-eco-200 text-eco-700',
                (selectedAnswer === null || (selectedAnswer !== index && index !== currentQuestion.correctIndex)) && 
                  'bg-ink-100 text-ink-600'
              )}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {selectedAnswer !== null && index === currentQuestion.correctIndex && (
                <CheckCircle className="w-5 h-5 text-eco-500" />
              )}
              {selectedAnswer === index && index !== currentQuestion.correctIndex && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 解释 */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-xl',
              isCorrect ? 'bg-eco-50 border border-eco-200' : 'bg-heritage-50 border border-heritage-200'
            )}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className={cn(
                'w-5 h-5 mt-0.5',
                isCorrect ? 'text-eco-500' : 'text-heritage-500'
              )} />
              <div>
                <p className={cn(
                  'font-medium mb-1',
                  isCorrect ? 'text-eco-700' : 'text-heritage-700'
                )}>
                  {isCorrect ? '回答正确！' : '回答错误'}
                  {isCorrect && (
                    <span className="ml-2 text-sm">
                      +{difficultyPoints[currentQuestion.difficulty]} 积分
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-600">{currentQuestion.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 下一题按钮 */}
      {showExplanation && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleNext}
          className="w-full py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  )

  // 结果页面
  const ResultContent = () => {
    const finalCorrect = correctCount + (isCorrect ? 1 : 0)
    const finalPoints = totalPoints + (isCorrect ? difficultyPoints[currentQuestion.difficulty] : 0)
    const accuracy = Math.round((finalCorrect / questions.length) * 100)
    
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-eco-100 flex items-center justify-center">
          <Award className="w-10 h-10 text-eco-500" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-ink-800">问答完成！</h3>
          <p className="text-ink-500 mt-1">你的生态知识真棒</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-eco-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-eco-600">{finalCorrect}/{questions.length}</p>
            <p className="text-xs text-ink-500">正确数</p>
          </div>
          <div className="bg-heritage-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-heritage-600">{accuracy}%</p>
            <p className="text-xs text-ink-500">正确率</p>
          </div>
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-primary-600">+{finalPoints}</p>
            <p className="text-xs text-ink-500">获得积分</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium transition-colors"
        >
          完成
        </button>
      </div>
    )
  }

  // Modal 模式
  if (mode === 'modal') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={cn(
                'bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto',
                className
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-ink-800">🌿 生态知识问答</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-ink-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-ink-500" />
                </button>
              </div>
              {isComplete ? <ResultContent /> : <QuizContent />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Hotspot 模式（小型弹出）
  if (mode === 'hotspot') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'bg-white rounded-xl shadow-xl p-4 max-w-sm',
              className
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 hover:bg-ink-100 rounded-full"
            >
              <X className="w-4 h-4 text-ink-400" />
            </button>
            {isComplete ? <ResultContent /> : <QuizContent />}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Inline 模式
  return (
    <div className={cn('bg-white rounded-2xl p-6 border border-ink-100', className)}>
      <h2 className="text-lg font-bold text-ink-800 mb-6">🌿 生态知识问答</h2>
      {isComplete ? <ResultContent /> : <QuizContent />}
    </div>
  )
}
