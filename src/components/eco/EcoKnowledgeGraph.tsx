import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ZoomIn, ZoomOut, Maximize2, X, BookOpen,
  Droplets, Leaf, TreeDeciduous, Recycle, Mountain, Home,
  Award, ChevronRight, ExternalLink, Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'

/** 知识节点类型 */
type NodeCategory = 'concept' | 'heritage' | 'practice' | 'material' | 'ecosystem'

/** 知识节点 */
interface KnowledgeNode {
  id: string
  name: string
  category: NodeCategory
  description: string
  icon: typeof Leaf
  color: string
  connections: string[]
  resources?: { title: string; url: string }[]
  explored?: boolean
}

/** 知识图谱数据 */
const KNOWLEDGE_NODES: KnowledgeNode[] = [
  // 核心概念
  {
    id: 'eco-wisdom',
    name: '生态智慧',
    category: 'concept',
    description: '传统非遗中蕴含的人与自然和谐共生的智慧',
    icon: Leaf,
    color: 'bg-eco-500',
    connections: ['sustainable-dev', 'carbon-neutral', 'circular-economy']
  },
  {
    id: 'sustainable-dev',
    name: '可持续发展',
    category: 'concept',
    description: '满足当代需求而不损害后代满足其需求的能力',
    icon: TreeDeciduous,
    color: 'bg-green-500',
    connections: ['eco-wisdom', 'carbon-neutral', 'biodiversity']
  },
  {
    id: 'carbon-neutral',
    name: '碳中和',
    category: 'concept',
    description: '通过减排和碳汇实现二氧化碳净零排放',
    icon: Recycle,
    color: 'bg-carbon-500',
    connections: ['sustainable-dev', 'forest-carbon', 'low-carbon-travel']
  },
  {
    id: 'circular-economy',
    name: '循环经济',
    category: 'concept',
    description: '资源循环利用，减少废弃物的经济模式',
    icon: Recycle,
    color: 'bg-amber-500',
    connections: ['eco-wisdom', 'bamboo-plastic', 'natural-materials']
  },
  
  // 非遗项目
  {
    id: 'hani-terrace',
    name: '哈尼梯田',
    category: 'heritage',
    description: '世界文化遗产，展示"四素同构"生态农业智慧',
    icon: Mountain,
    color: 'bg-eco-600',
    connections: ['water-cycle', 'biodiversity', 'sustainable-agriculture'],
    resources: [{ title: '哈尼梯田VR体验', url: '/experience/hani-terrace' }]
  },
  {
    id: 'bamboo-weaving',
    name: '藤编工艺',
    category: 'heritage',
    description: '以竹代塑的传统手工艺',
    icon: Leaf,
    color: 'bg-bamboo-500',
    connections: ['bamboo-plastic', 'natural-materials', 'circular-economy'],
    resources: [{ title: '藤编体验', url: '/experience/bamboo-weaving' }]
  },
  {
    id: 'paper-cutting',
    name: '剪纸艺术',
    category: 'heritage',
    description: '使用可降解纸张的传统艺术',
    icon: Leaf,
    color: 'bg-red-500',
    connections: ['natural-materials', 'biodegradable'],
    resources: [{ title: '剪纸体验', url: '/experience/paper-cutting' }]
  },
  {
    id: 'clay-sculpture',
    name: '凤翔泥塑',
    category: 'heritage',
    description: '使用天然黄土的传统工艺',
    icon: Home,
    color: 'bg-amber-600',
    connections: ['natural-materials', 'zero-pollution'],
    resources: [{ title: '泥塑体验', url: '/experience/fengxiang-clay' }]
  },
  {
    id: 'shadow-puppet',
    name: '皮影戏',
    category: 'heritage',
    description: '体现"物尽其用"循环经济理念',
    icon: Home,
    color: 'bg-heritage-500',
    connections: ['circular-economy', 'natural-materials'],
    resources: [{ title: '皮影体验', url: '/experience/shadow-puppet' }]
  },
  {
    id: 'tea-ceremony',
    name: '茶道生态',
    category: 'heritage',
    description: '有机茶园的生态系统与碳汇功能',
    icon: Leaf,
    color: 'bg-green-600',
    connections: ['forest-carbon', 'biodiversity', 'organic-farming'],
    resources: [{ title: '茶道体验', url: '/experience/tea-ceremony' }]
  },
  {
    id: 'batik',
    name: '蜡染工艺',
    category: 'heritage',
    description: '使用天然植物染料的传统染色技艺',
    icon: Droplets,
    color: 'bg-indigo-500',
    connections: ['natural-dye', 'water-protection'],
    resources: [{ title: '蜡染体验', url: '/experience/batik' }]
  },
  
  // 生态实践
  {
    id: 'bamboo-plastic',
    name: '以竹代塑',
    category: 'practice',
    description: '用竹制品替代塑料制品，减少塑料污染',
    icon: Leaf,
    color: 'bg-bamboo-600',
    connections: ['bamboo-weaving', 'circular-economy', 'plastic-reduction']
  },
  {
    id: 'low-carbon-travel',
    name: '低碳云游',
    category: 'practice',
    description: '通过数字体验替代实地旅行，减少碳排放',
    icon: Mountain,
    color: 'bg-sky-500',
    connections: ['carbon-neutral', 'digital-heritage']
  },
  {
    id: 'organic-farming',
    name: '有机种植',
    category: 'practice',
    description: '不使用化学农药和化肥的农业方式',
    icon: Leaf,
    color: 'bg-green-500',
    connections: ['tea-ceremony', 'biodiversity', 'soil-health']
  },
  
  // 材料
  {
    id: 'natural-materials',
    name: '天然材料',
    category: 'material',
    description: '来自自然、可降解的传统材料',
    icon: Leaf,
    color: 'bg-amber-500',
    connections: ['bamboo-weaving', 'clay-sculpture', 'paper-cutting', 'biodegradable']
  },
  {
    id: 'natural-dye',
    name: '天然染料',
    category: 'material',
    description: '从植物中提取的环保染料',
    icon: Droplets,
    color: 'bg-indigo-600',
    connections: ['batik', 'water-protection']
  },
  {
    id: 'biodegradable',
    name: '可降解材料',
    category: 'material',
    description: '能被自然分解的环保材料',
    icon: Recycle,
    color: 'bg-eco-500',
    connections: ['natural-materials', 'paper-cutting', 'plastic-reduction']
  },
  
  // 生态系统
  {
    id: 'water-cycle',
    name: '水循环系统',
    category: 'ecosystem',
    description: '自然界水的循环利用系统',
    icon: Droplets,
    color: 'bg-blue-500',
    connections: ['hani-terrace', 'sustainable-agriculture']
  },
  {
    id: 'biodiversity',
    name: '生物多样性',
    category: 'ecosystem',
    description: '生态系统中物种的多样性',
    icon: TreeDeciduous,
    color: 'bg-green-600',
    connections: ['hani-terrace', 'tea-ceremony', 'sustainable-dev']
  },
  {
    id: 'forest-carbon',
    name: '森林碳汇',
    category: 'ecosystem',
    description: '森林吸收和储存二氧化碳的能力',
    icon: TreeDeciduous,
    color: 'bg-green-700',
    connections: ['carbon-neutral', 'tea-ceremony', 'hani-terrace']
  }
]

/** 类别配置 */
const CATEGORY_CONFIG: Record<NodeCategory, { name: string; color: string }> = {
  concept: { name: '核心概念', color: 'bg-eco-100 text-eco-700' },
  heritage: { name: '非遗项目', color: 'bg-heritage-100 text-heritage-700' },
  practice: { name: '生态实践', color: 'bg-blue-100 text-blue-700' },
  material: { name: '环保材料', color: 'bg-amber-100 text-amber-700' },
  ecosystem: { name: '生态系统', color: 'bg-green-100 text-green-700' }
}

interface EcoKnowledgeGraphProps {
  className?: string
}

export default function EcoKnowledgeGraph({ className = '' }: EcoKnowledgeGraphProps) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>(KNOWLEDGE_NODES)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<NodeCategory | 'all'>('all')
  const [zoom, setZoom] = useState(1)
  const [exploredNodes, setExploredNodes] = useState<Set<string>>(new Set())
  
  const { addPoints } = useGreenPointsStore()
  const { updateKnowledgeGraphProgress } = useEcoAchievementStore()
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 过滤节点
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || node.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [nodes, searchQuery, filterCategory])
  
  // 计算探索进度
  const explorationProgress = useMemo(() => {
    return Math.round((exploredNodes.size / nodes.length) * 100)
  }, [exploredNodes, nodes])
  
  // 更新探索进度
  useEffect(() => {
    updateKnowledgeGraphProgress(explorationProgress)
  }, [explorationProgress, updateKnowledgeGraphProgress])
  
  // 选择节点
  const selectNode = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node)
    
    if (!exploredNodes.has(node.id)) {
      setExploredNodes(prev => new Set([...prev, node.id]))
      
      // 首次探索奖励积分
      addPoints({
        type: 'learn',
        points: 5,
        description: `探索知识节点: ${node.name}`,
        relatedId: node.id
      })
    }
  }, [exploredNodes, addPoints])
  
  // 获取连接的节点
  const getConnectedNodes = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return []
    return nodes.filter(n => node.connections.includes(n.id))
  }, [nodes])
  
  // 计算节点位置（简单的力导向布局模拟）
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const centerX = 400
    const centerY = 300
    const radius = 250
    
    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI
      const categoryOffset = Object.keys(CATEGORY_CONFIG).indexOf(node.category) * 20
      positions[node.id] = {
        x: centerX + (radius + categoryOffset) * Math.cos(angle),
        y: centerY + (radius + categoryOffset) * Math.sin(angle)
      }
    })
    
    return positions
  }, [filteredNodes])

  return (
    <div className={`${className}`}>
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">生态知识图谱</h2>
            <p className="text-ink-500">探索生态知识之间的关联网络</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="eco">
              已探索 {exploredNodes.size}/{nodes.length}
            </Badge>
            <Badge variant="outline">
              {explorationProgress}%
            </Badge>
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <Input
              placeholder="搜索知识节点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterCategory === 'all' ? 'eco' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('all')}
            >
              全部
            </Button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={filterCategory === key ? 'eco' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(key as NodeCategory)}
              >
                {config.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 图谱可视化 */}
        <div className="lg:col-span-2">
          <Card className="p-4 overflow-hidden">
            {/* 缩放控制 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-ink-500">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(1)}
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                重置
              </Button>
            </div>
            
            {/* 图谱画布 */}
            <div 
              ref={containerRef}
              className="relative bg-gradient-to-br from-eco-50 to-bamboo-50 rounded-xl overflow-auto"
              style={{ height: '500px' }}
            >
              <svg
                width={800 * zoom}
                height={600 * zoom}
                className="absolute inset-0"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                {/* 连接线 */}
                {filteredNodes.map(node => 
                  node.connections.map(connId => {
                    const connNode = filteredNodes.find(n => n.id === connId)
                    if (!connNode || !nodePositions[node.id] || !nodePositions[connId]) return null
                    
                    const pos1 = nodePositions[node.id]
                    const pos2 = nodePositions[connId]
                    
                    const isHighlighted = selectedNode && 
                      (selectedNode.id === node.id || selectedNode.id === connId)
                    
                    return (
                      <line
                        key={`${node.id}-${connId}`}
                        x1={pos1.x}
                        y1={pos1.y}
                        x2={pos2.x}
                        y2={pos2.y}
                        stroke={isHighlighted ? '#22c55e' : '#d1d5db'}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={isHighlighted ? '' : '4'}
                        opacity={isHighlighted ? 1 : 0.5}
                      />
                    )
                  })
                )}
              </svg>
              
              {/* 节点 */}
              {filteredNodes.map(node => {
                const pos = nodePositions[node.id]
                if (!pos) return null
                
                const isSelected = selectedNode?.id === node.id
                const isConnected = selectedNode?.connections.includes(node.id)
                const isExplored = exploredNodes.has(node.id)
                
                return (
                  <motion.button
                    key={node.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                      isSelected ? 'z-20' : isConnected ? 'z-10' : 'z-0'
                    }`}
                    style={{ 
                      left: pos.x * zoom, 
                      top: pos.y * zoom 
                    }}
                    onClick={() => selectNode(node)}
                  >
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${node.color} text-white shadow-lg
                      ${isSelected ? 'ring-4 ring-eco-300 ring-offset-2' : ''}
                      ${isConnected ? 'ring-2 ring-eco-200' : ''}
                      ${isExplored ? '' : 'opacity-70'}
                      transition-all
                    `}>
                      <node.icon className="w-6 h-6" />
                    </div>
                    <div className={`
                      absolute top-full left-1/2 -translate-x-1/2 mt-1
                      text-xs font-medium whitespace-nowrap
                      ${isSelected || isConnected ? 'text-ink-900' : 'text-ink-500'}
                    `}>
                      {node.name}
                    </div>
                    {isExplored && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-eco-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* 节点详情 */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${selectedNode.color} flex items-center justify-center text-white`}>
                  <selectedNode.icon className="w-7 h-7" />
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-5 h-5 text-ink-600" />
                </button>
              </div>
              
              <Badge className={CATEGORY_CONFIG[selectedNode.category].color}>
                {CATEGORY_CONFIG[selectedNode.category].name}
              </Badge>
              
              <h3 className="text-xl font-bold text-ink-900 mt-3 mb-2">{selectedNode.name}</h3>
              <p className="text-ink-600 mb-4">{selectedNode.description}</p>
              
              {/* 关联节点 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-ink-700 mb-2">关联知识</h4>
                <div className="flex flex-wrap gap-2">
                  {getConnectedNodes(selectedNode.id).map(connNode => (
                    <button
                      key={connNode.id}
                      onClick={() => selectNode(connNode)}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-ink-600 hover:bg-eco-100 hover:text-eco-700 transition-colors"
                    >
                      {connNode.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 学习资源 */}
              {selectedNode.resources && selectedNode.resources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-700 mb-2">学习资源</h4>
                  <div className="space-y-2">
                    {selectedNode.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        className="flex items-center gap-2 p-3 bg-eco-50 rounded-lg text-eco-700 hover:bg-eco-100 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="flex-1">{resource.title}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-eco-500" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">选择一个节点</h3>
              <p className="text-sm text-ink-500">
                点击图谱中的节点查看详细信息和关联知识
              </p>
            </Card>
          )}
          
          {/* 探索进度 */}
          <Card className="p-4">
            <h4 className="font-medium text-ink-900 mb-3">探索进度</h4>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-500">已探索节点</span>
                <span className="text-eco-600 font-medium">{exploredNodes.size}/{nodes.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${explorationProgress}%` }}
                  className="h-full bg-eco-500"
                />
              </div>
            </div>
            
            {explorationProgress >= 50 && (
              <div className="mt-3 p-3 bg-eco-50 rounded-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-eco-600" />
                <span className="text-sm text-eco-700">
                  {explorationProgress >= 100 ? '🎉 已解锁"知识探索者"徽章！' : '继续探索解锁徽章'}
                </span>
              </div>
            )}
          </Card>
          
          {/* 图例 */}
          <Card className="p-4">
            <h4 className="font-medium text-ink-900 mb-3">图例</h4>
            <div className="space-y-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${config.color.split(' ')[0].replace('100', '500')}`} />
                  <span className="text-sm text-ink-600">{config.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
