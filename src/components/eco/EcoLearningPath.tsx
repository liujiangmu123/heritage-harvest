import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Droplets, Leaf, TreeDeciduous, Recycle, Lock, CheckCircle,
  ChevronRight, Award, Play, BookOpen, Clock, Star, X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'

/** 学习模块类型 */
type ModuleCategory = 'water' | 'material' | 'biodiversity' | 'carbon'

/** 难度等级 */
type DifficultyLevel = 'beginner' | 'intermediate' | 'expert'

/** 学习课程 */
interface LearningLesson {
  id: string
  title: string
  description: string
  duration: number // 分钟
  points: number
  completed: boolean
  heritageLink?: string
}

/** 学习模块 */
interface LearningModule {
  id: string
  category: ModuleCategory
  title: string
  subtitle: string
  description: string
  icon: typeof Droplets
  color: string
  bgColor: string
  lessons: LearningLesson[]
  badge: {
    name: string
    icon: string
  }
  unlocked: boolean
  requiredModules?: string[]
}

/** 学习路径数据 */
const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'water-wisdom',
    category: 'water',
    title: '水循环智慧',
    subtitle: '入门模块',
    description: '探索古人如何利用自然水循环，实现可持续农业灌溉。',
    icon: Droplets,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    unlocked: true,
    badge: { name: '水循环守护者', icon: '💧' },
    lessons: [
      {
        id: 'water-1',
        title: '哈尼梯田的水系奥秘',
        description: '了解"森林-村寨-梯田-水系"四素同构生态系统',
        duration: 10,
        points: 20,
        completed: false,
        heritageLink: '/experience/hani-terrace'
      },
      {
        id: 'water-2',
        title: '木刻分水的公平智慧',
        description: '学习传统水资源分配的公平原则',
        duration: 8,
        points: 15,
        completed: false
      },
      {
        id: 'water-3',
        title: '茶园的水土保持',
        description: '探索茶园如何实现水土保持和生态平衡',
        duration: 12,
        points: 25,
        completed: false,
        heritageLink: '/experience/tea-ceremony'
      }
    ]
  },
  {
    id: 'sustainable-materials',
    category: 'material',
    title: '材料可持续',
    subtitle: '进阶模块',
    description: '认识传统工艺中使用的天然可降解材料及其环保价值。',
    icon: Leaf,
    color: 'text-eco-600',
    bgColor: 'bg-eco-50',
    unlocked: false,
    requiredModules: ['water-wisdom'],
    badge: { name: '材料环保家', icon: '🌿' },
    lessons: [
      {
        id: 'material-1',
        title: '以竹代塑的智慧',
        description: '了解竹编如何替代塑料制品',
        duration: 10,
        points: 20,
        completed: false,
        heritageLink: '/experience/bamboo-weaving'
      },
      {
        id: 'material-2',
        title: '天然染料的奥秘',
        description: '探索蜡染中植物染料的环保特性',
        duration: 12,
        points: 25,
        completed: false,
        heritageLink: '/experience/batik'
      },
      {
        id: 'material-3',
        title: '泥土的生命循环',
        description: '认识泥塑天然材料的可降解特性',
        duration: 8,
        points: 15,
        completed: false,
        heritageLink: '/experience/fengxiang-clay'
      },
      {
        id: 'material-4',
        title: '纸艺的可持续之道',
        description: '了解传统纸张的环保属性',
        duration: 10,
        points: 20,
        completed: false,
        heritageLink: '/experience/paper-cutting'
      }
    ]
  },
  {
    id: 'biodiversity',
    category: 'biodiversity',
    title: '生物多样性',
    subtitle: '进阶模块',
    description: '探索传统农业如何维护生态平衡和生物多样性。',
    icon: TreeDeciduous,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    unlocked: false,
    requiredModules: ['water-wisdom'],
    badge: { name: '生态守护者', icon: '🌳' },
    lessons: [
      {
        id: 'bio-1',
        title: '梯田生态系统',
        description: '了解梯田如何成为生物多样性的家园',
        duration: 15,
        points: 30,
        completed: false,
        heritageLink: '/experience/hani-terrace'
      },
      {
        id: 'bio-2',
        title: '茶园的生态平衡',
        description: '探索有机茶园的自然害虫控制',
        duration: 12,
        points: 25,
        completed: false,
        heritageLink: '/experience/tea-ceremony'
      },
      {
        id: 'bio-3',
        title: '竹林的碳汇功能',
        description: '认识竹林在碳循环中的重要作用',
        duration: 10,
        points: 20,
        completed: false
      }
    ]
  },
  {
    id: 'carbon-neutral',
    category: 'carbon',
    title: '碳中和实践',
    subtitle: '专家模块',
    description: '学习如何在日常生活中践行低碳理念，实现碳中和目标。',
    icon: Recycle,
    color: 'text-carbon-600',
    bgColor: 'bg-carbon-50',
    unlocked: false,
    requiredModules: ['sustainable-materials', 'biodiversity'],
    badge: { name: '碳中和先锋', icon: '🌍' },
    lessons: [
      {
        id: 'carbon-1',
        title: '低碳云游的价值',
        description: '了解数字旅游如何减少碳排放',
        duration: 10,
        points: 20,
        completed: false
      },
      {
        id: 'carbon-2',
        title: '循环经济的智慧',
        description: '学习皮影戏中"物尽其用"的理念',
        duration: 12,
        points: 25,
        completed: false,
        heritageLink: '/experience/shadow-puppet'
      },
      {
        id: 'carbon-3',
        title: '绿色消费指南',
        description: '掌握选择生态产品的方法',
        duration: 15,
        points: 30,
        completed: false,
        heritageLink: '/marketplace'
      },
      {
        id: 'carbon-4',
        title: '个人碳足迹管理',
        description: '学习追踪和减少个人碳排放',
        duration: 12,
        points: 25,
        completed: false
      }
    ]
  }
]

/** 难度等级配置 */
const DIFFICULTY_CONFIG: Record<DifficultyLevel, { name: string; color: string; modules: string[] }> = {
  beginner: {
    name: '入门',
    color: 'text-eco-600 bg-eco-100',
    modules: ['water-wisdom']
  },
  intermediate: {
    name: '进阶',
    color: 'text-amber-600 bg-amber-100',
    modules: ['sustainable-materials', 'biodiversity']
  },
  expert: {
    name: '专家',
    color: 'text-heritage-600 bg-heritage-100',
    modules: ['carbon-neutral']
  }
}

interface EcoLearningPathProps {
  className?: string
  onModuleComplete?: (moduleId: string) => void
}

function EcoLearningPath({ className = '', onModuleComplete }: EcoLearningPathProps) {
  const [modules, setModules] = useState<LearningModule[]>(LEARNING_MODULES)
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null)
  const { addPoints, totalPoints } = useGreenPointsStore()

  // 计算总体进度
  const overallProgress = useMemo(() => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const completedLessons = modules.reduce(
      (sum, m) => sum + m.lessons.filter(l => l.completed).length, 0
    )
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  }, [modules])

  // 检查模块是否可解锁
  const canUnlockModule = (module: LearningModule): boolean => {
    if (module.unlocked) return true
    if (!module.requiredModules) return true
    
    return module.requiredModules.every(reqId => {
      const reqModule = modules.find(m => m.id === reqId)
      return reqModule && reqModule.lessons.every(l => l.completed)
    })
  }

  // 获取模块进度
  const getModuleProgress = (module: LearningModule): number => {
    const completed = module.lessons.filter(l => l.completed).length
    return module.lessons.length > 0 ? Math.round((completed / module.lessons.length) * 100) : 0
  }

  // 完成课程
  const completeLesson = (moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(module => {
      if (module.id !== moduleId) return module
      
      const updatedLessons = module.lessons.map(lesson => {
        if (lesson.id !== lessonId || lesson.completed) return lesson
        
        // 奖励积分
        addPoints({
          type: 'learn',
          points: lesson.points,
          description: `完成课程: ${lesson.title}`,
          relatedId: lessonId
        })
        
        return { ...lesson, completed: true }
      })
      
      return { ...module, lessons: updatedLessons }
    }))

    // 检查模块是否完成
    setTimeout(() => {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        const allCompleted = module.lessons.every(l => 
          l.id === lessonId ? true : l.completed
        )
        if (allCompleted && onModuleComplete) {
          onModuleComplete(moduleId)
        }
      }
      
      // 解锁依赖此模块的其他模块
      setModules(prev => prev.map(m => ({
        ...m,
        unlocked: canUnlockModule(m)
      })))
    }, 100)
  }

  // 获取难度等级
  const getDifficultyLevel = (moduleId: string): DifficultyLevel => {
    for (const [level, config] of Object.entries(DIFFICULTY_CONFIG)) {
      if (config.modules.includes(moduleId)) {
        return level as DifficultyLevel
      }
    }
    return 'beginner'
  }

  // 检查是否完成所有模块
  const allModulesCompleted = modules.every(m => 
    m.lessons.every(l => l.completed)
  )

  return (
    <div className={`${className}`}>
      {/* 头部进度 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">生态学习路径</h2>
            <p className="text-ink-500">循序渐进，掌握完整的环保知识体系</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-eco-600">{overallProgress}%</div>
            <div className="text-sm text-ink-500">总体进度</div>
          </div>
        </div>
        
        {/* 总进度条 */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-eco-500 via-bamboo-500 to-heritage-500"
          />
        </div>

        {/* 完成提示 */}
        {allModulesCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-eco-50 to-bamboo-50 rounded-xl border border-eco-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-eco-500 rounded-full flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <div className="font-bold text-eco-800">恭喜！你已成为"生态智慧大师"</div>
                <div className="text-sm text-eco-600">完成所有学习路径，获得专属称号和纪念NFT</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 难度等级说明 */}
      <div className="flex gap-4 mb-6">
        {Object.entries(DIFFICULTY_CONFIG).map(([level, config]) => (
          <div key={level} className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.name}
            </span>
          </div>
        ))}
      </div>

      {/* 学习模块网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon
          const progress = getModuleProgress(module)
          const isUnlocked = module.unlocked || canUnlockModule(module)
          const difficulty = getDifficultyLevel(module.id)
          const diffConfig = DIFFICULTY_CONFIG[difficulty]

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isUnlocked 
                    ? 'border-eco-200 hover:border-eco-400' 
                    : 'opacity-60 border-gray-200'
                } ${progress === 100 ? 'ring-2 ring-eco-500 ring-offset-2' : ''}`}
                onClick={() => isUnlocked && setSelectedModule(module)}
              >
                <CardContent className="p-6">
                  {/* 模块头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl ${module.bgColor} flex items-center justify-center`}>
                      {isUnlocked ? (
                        <Icon className={`w-7 h-7 ${module.color}`} />
                      ) : (
                        <Lock className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={diffConfig.color}>{diffConfig.name}</Badge>
                      {progress === 100 && (
                        <Badge variant="eco" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          已完成
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 模块信息 */}
                  <h3 className="text-lg font-bold text-ink-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-ink-500 mb-4 line-clamp-2">{module.description}</p>

                  {/* 课程数量和时长 */}
                  <div className="flex items-center gap-4 text-sm text-ink-500 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{module.lessons.length} 课程</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{module.lessons.reduce((sum, l) => sum + l.duration, 0)} 分钟</span>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-500">学习进度</span>
                      <span className={module.color}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${module.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
                        style={{ 
                          background: progress > 0 
                            ? `linear-gradient(90deg, ${module.color.includes('blue') ? '#3b82f6' : module.color.includes('eco') ? '#22c55e' : module.color.includes('green') ? '#16a34a' : '#64748b'} 0%, ${module.color.includes('blue') ? '#60a5fa' : module.color.includes('eco') ? '#4ade80' : module.color.includes('green') ? '#22c55e' : '#94a3b8'} 100%)`
                            : undefined
                        }}
                      />
                    </div>
                  </div>

                  {/* 徽章预览 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{module.badge.icon}</span>
                      <span className={progress === 100 ? 'text-eco-600 font-medium' : 'text-ink-400'}>
                        {module.badge.name}
                      </span>
                    </div>
                    {isUnlocked && (
                      <ChevronRight className={`w-5 h-5 ${module.color}`} />
                    )}
                  </div>

                  {/* 解锁提示 */}
                  {!isUnlocked && module.requiredModules && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-ink-400">
                        需先完成: {module.requiredModules.map(id => 
                          modules.find(m => m.id === id)?.title
                        ).join('、')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* 模块详情弹窗 */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 模块头部 */}
              <div className={`${selectedModule.bgColor} p-6 rounded-t-2xl`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <selectedModule.icon className={`w-8 h-8 ${selectedModule.color}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-ink-900">{selectedModule.title}</h2>
                      <p className="text-ink-600">{selectedModule.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center hover:bg-white/80"
                  >
                    <X className="w-5 h-5 text-ink-600" />
                  </button>
                </div>
                <p className="mt-4 text-ink-600">{selectedModule.description}</p>
              </div>

              {/* 课程列表 */}
              <div className="p-6">
                <h3 className="font-bold text-ink-900 mb-4">课程列表</h3>
                <div className="space-y-3">
                  {selectedModule.lessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border transition-all ${
                        lesson.completed 
                          ? 'bg-eco-50 border-eco-200' 
                          : 'bg-white border-gray-200 hover:border-eco-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* 状态图标 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          lesson.completed 
                            ? 'bg-eco-500 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {lesson.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* 课程信息 */}
                        <div className="flex-1">
                          <h4 className="font-medium text-ink-900">{lesson.title}</h4>
                          <p className="text-sm text-ink-500 mt-1">{lesson.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-ink-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration} 分钟
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              +{lesson.points} 积分
                            </span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <Badge variant="eco">已完成</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="eco"
                              onClick={() => {
                                setSelectedLesson(lesson)
                                // 模拟完成课程
                                setTimeout(() => {
                                  completeLesson(selectedModule.id, lesson.id)
                                  setSelectedLesson(null)
                                }, 1000)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Play className="w-4 h-4" />
                              开始
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 模块徽章 */}
                <div className="mt-6 p-4 bg-gradient-to-r from-eco-50 to-bamboo-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedModule.badge.icon}</div>
                    <div>
                      <div className="font-bold text-ink-900">{selectedModule.badge.name}</div>
                      <div className="text-sm text-ink-500">
                        {getModuleProgress(selectedModule) === 100 
                          ? '🎉 已获得此徽章！' 
                          : '完成所有课程后获得此徽章'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 学习中提示 */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm"
            >
              <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-eco-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">学习中...</h3>
              <p className="text-ink-500 mb-4">{selectedLesson.title}</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                  className="h-full bg-eco-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export default EcoLearningPath
