import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutList,
  Star,
  MapPin,
  Sparkles,
  X,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { products, heritages } from '@/data/mockData'
import { formatPrice } from '@/lib/utils'
import type { ProductCategory } from '@/types'

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'tea', label: '茶叶' },
  { value: 'rice', label: '大米' },
  { value: 'textile', label: '纺织品' },
  { value: 'bamboo', label: '竹制品' },
  { value: 'food', label: '食品' },
  { value: 'craft', label: '手工艺品' },
]

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'sales', label: '销量优先' },
  { value: 'rating', label: '评分优先' },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')
  const [selectedHeritage, setSelectedHeritage] = useState<string | 'all'>('all')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        p => p.name.toLowerCase().includes(query) ||
             p.description.toLowerCase().includes(query) ||
             p.heritage.name.toLowerCase().includes(query)
      )
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // 非遗过滤
    if (selectedHeritage !== 'all') {
      result = result.filter(p => p.heritage.id === selectedHeritage)
    }

    // 排序
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        result.sort((a, b) => b.sales - a.sales)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  }, [searchQuery, selectedCategory, selectedHeritage, sortBy])

  return (
    <div className="min-h-screen pt-20">
      {/* 页面头部 */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-heritage-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="heritage" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              臻选好物
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-ink-900 mb-4">
              非遗文化 · 匠心之选
            </h1>
            <p className="text-ink-500 max-w-2xl mx-auto">
              每一件产品都承载着传承人的匠心与故事，扫码即可开启沉浸式VR体验
            </p>
          </motion.div>

          {/* 搜索栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                type="text"
                placeholder="搜索非遗好物、传承故事..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-ink-200 bg-white shadow-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-ink-100"
                >
                  <X className="w-4 h-4 text-ink-400" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏筛选 - 桌面端 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* 分类筛选 */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-ink-900 mb-4">商品分类</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 非遗筛选 */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-ink-900 mb-4">关联非遗</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedHeritage('all')}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                      selectedHeritage === 'all'
                        ? 'bg-heritage-100 text-heritage-700 font-medium'
                        : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    全部非遗
                  </button>
                  {heritages.map((heritage) => (
                    <button
                      key={heritage.id}
                      onClick={() => setSelectedHeritage(heritage.id)}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                        selectedHeritage === heritage.id
                          ? 'bg-heritage-100 text-heritage-700 font-medium'
                          : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={heritage.level === 'national' ? 'national' : 'provincial'}
                          size="sm"
                        >
                          {heritage.level === 'national' ? '国' : '省'}
                        </Badge>
                        <span className="truncate">{heritage.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 产品列表 */}
          <main className="flex-1">
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  筛选
                </button>
                <p className="text-ink-500">
                  共 <span className="font-bold text-ink-900">{filteredProducts.length}</span> 件商品
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* 排序 */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-ink-200 rounded-xl px-4 py-2 pr-10 text-ink-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                </div>

                {/* 视图切换 */}
                <div className="hidden sm:flex items-center border border-ink-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-ink-400 hover:bg-ink-50'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-ink-400 hover:bg-ink-50'}`}
                  >
                    <LayoutList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 产品网格 */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/products/${product.id}`}>
                      <Card variant="heritage" className={`group overflow-hidden ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        <div className={`relative overflow-hidden ${
                          viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-64'
                        }`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge variant="national" size="sm">
                              {product.heritage.level === 'national' ? '国家级' : '省级'}非遗
                            </Badge>
                          </div>
                          {product.vrExperienceId && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="heritage" size="sm">
                                <Sparkles className="w-3 h-3 mr-1" />
                                VR
                              </Badge>
                            </div>
                          )}
                          {product.originalPrice && (
                            <div className="absolute bottom-3 left-3">
                              <Badge variant="danger" size="sm">
                                省 ¥{product.originalPrice - product.price}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-ink-400" />
                            <span className="text-sm text-ink-400">{product.origin}</span>
                          </div>
                          <h3 className="font-bold text-ink-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-ink-500 line-clamp-2 mb-4">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary-600">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-ink-400 line-through ml-2">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-ink-400">
                              <Star className="w-4 h-4 text-heritage-500 fill-heritage-500" />
                              {product.rating}
                              <span className="mx-1">·</span>
                              {product.sales}人购买
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto rounded-full bg-ink-100 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-ink-300" />
                </div>
                <p className="text-ink-500 mb-2">未找到相关商品</p>
                <p className="text-sm text-ink-400">尝试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 移动端筛选抽屉 */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">筛选</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-lg hover:bg-ink-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 分类 */}
              <div className="mb-6">
                <h3 className="font-bold text-ink-900 mb-4">商品分类</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 非遗 */}
              <div className="mb-6">
                <h3 className="font-bold text-ink-900 mb-4">关联非遗</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedHeritage('all')
                      setIsFilterOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                      selectedHeritage === 'all'
                        ? 'bg-heritage-100 text-heritage-700 font-medium'
                        : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    全部非遗
                  </button>
                  {heritages.map((heritage) => (
                    <button
                      key={heritage.id}
                      onClick={() => {
                        setSelectedHeritage(heritage.id)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                        selectedHeritage === heritage.id
                          ? 'bg-heritage-100 text-heritage-700 font-medium'
                          : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {heritage.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="heritage"
                className="w-full"
                onClick={() => setIsFilterOpen(false)}
              >
                确认筛选
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
