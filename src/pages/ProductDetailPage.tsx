import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Share2, 
  Star,
  MapPin,
  Sparkles,
  Award,
  Truck,
  Shield,
  QrCode,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { products } from '@/data/mockData'
import { formatPrice } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find(p => p.id === id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-500 mb-4">商品不存在</p>
          <Button asChild>
            <Link to="/products">返回商品列表</Link>
          </Button>
        </div>
      </div>
    )
  }

  const relatedProducts = products.filter(
    p => p.heritage.id === product.heritage.id && p.id !== product.id
  ).slice(0, 4)

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* 面包屑 */}
      <div className="bg-ink-50 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-ink-400 hover:text-primary-600">首页</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <Link to="/products" className="text-ink-400 hover:text-primary-600">臻选好物</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-ink-600 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* 产品详情 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* 左侧图片 */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-ink-100"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* VR体验入口 */}
              {product.vrExperienceId && (
                <Link
                  to={`/vr/${product.vrExperienceId}`}
                  className="absolute bottom-4 right-4"
                >
                  <Button variant="heritage" className="shadow-heritage">
                    <Sparkles className="w-4 h-4 mr-2" />
                    VR体验
                  </Button>
                </Link>
              )}

              {/* 二维码提示 */}
              <div className="absolute bottom-4 left-4 glass-card rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="w-5 h-5 text-primary-600" />
                  <span className="text-ink-600">扫码开启文化之旅</span>
                </div>
              </div>
            </motion.div>

            {/* 缩略图 */}
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary-500 shadow-lg'
                      : 'border-transparent hover:border-ink-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="national">
                {product.heritage.level === 'national' ? '国家级' : '省级'}非遗
              </Badge>
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="heritage">{tag}</Badge>
              ))}
            </div>

            {/* 标题 */}
            <h1 className="text-2xl lg:text-3xl font-bold text-ink-900">
              {product.name}
            </h1>

            {/* 简介 */}
            <p className="text-ink-500 leading-relaxed">
              {product.description}
            </p>

            {/* 产地与评分 */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-ink-500">
                <MapPin className="w-4 h-4" />
                {product.origin}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-heritage-500 fill-heritage-500" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-ink-400">({product.reviews}条评价)</span>
              </div>
              <span className="text-ink-400">{product.sales}人已购买</span>
            </div>

            {/* 价格 */}
            <div className="bg-gradient-to-r from-primary-50 to-heritage-50 rounded-2xl p-6">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-ink-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="danger">
                      省 ¥{product.originalPrice - product.price}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-heritage-600 mt-2">
                🎁 购买即获非遗碎片奖励，集齐可兑换专属徽章
              </p>
            </div>

            {/* 关联非遗 */}
            <div className="bg-white rounded-2xl border border-heritage-200 p-4">
              <div className="flex items-center gap-4">
                <img
                  src={product.heritage.images[0]}
                  alt={product.heritage.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-heritage-500" />
                    <span className="font-bold text-ink-900">{product.heritage.name}</span>
                  </div>
                  <p className="text-sm text-ink-500 line-clamp-1">
                    {product.heritage.description}
                  </p>
                </div>
                <Link to="/heritage">
                  <Button variant="outline-heritage" size="sm">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>

            {/* 规格信息 */}
            <div className="space-y-3">
              <h3 className="font-bold text-ink-900">规格参数</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.specifications.map((spec) => (
                  <div key={spec.label} className="flex text-sm">
                    <span className="w-24 text-ink-400">{spec.label}</span>
                    <span className="text-ink-700">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 服务保障 */}
            <div className="flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-nature-500" />
                <span>包邮</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-nature-500" />
                <span>正品保障</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-nature-500" />
                <span>非遗认证</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button
                variant="outline-heritage"
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex-shrink-0"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-shrink-0"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="heritage" size="lg" className="flex-1">
                了解非遗故事
              </Button>
            </div>
          </div>
        </div>

        {/* 传承人故事 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-ink-900 mb-8">传承人故事</h2>
          <Card variant="heritage" className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <img
                src={product.heritage.inheritor.avatar}
                alt={product.heritage.inheritor.name}
                className="w-32 h-32 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-ink-900">
                    {product.heritage.inheritor.name}
                  </h3>
                  <Badge variant="heritage">{product.heritage.inheritor.title}</Badge>
                </div>
                <p className="text-ink-500 leading-relaxed mb-4">
                  {product.heritage.inheritor.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.heritage.inheritor.achievements.map((achievement) => (
                    <Badge key={achievement} variant="outline">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 相关商品 */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-ink-900 mb-8">相关推荐</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`}>
                  <Card variant="heritage" className="group overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-ink-900 line-clamp-2 mb-2 group-hover:text-primary-600">
                        {p.name}
                      </h3>
                      <span className="font-bold text-primary-600">
                        {formatPrice(p.price)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
