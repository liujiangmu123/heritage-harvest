import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { Button } from '../ui/Button'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function CartSidebar() {
  const { isCartOpen, toggleCart } = useUIStore()
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const totalPrice = getTotalPrice()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 购物车侧边栏 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-ink-900">购物车</h2>
                  <p className="text-sm text-ink-500">{items.length} 件商品</p>
                </div>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 商品列表 */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 rounded-full bg-ink-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-ink-300" />
                  </div>
                  <p className="text-ink-500 mb-2">购物车空空如也</p>
                  <p className="text-sm text-ink-400 mb-6">快去发现非遗好物吧！</p>
                  <Button variant="heritage" onClick={toggleCart}>
                    <Link to="/products" className="flex items-center gap-2">
                      去逛逛 <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 rounded-xl bg-ink-50 group"
                    >
                      {/* 商品图片 */}
                      <Link
                        to={`/products/${item.productId}`}
                        onClick={toggleCart}
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </Link>

                      {/* 商品信息 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={toggleCart}
                          className="font-medium text-ink-900 hover:text-primary-600 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {item.product.heritage && (
                            <span className="badge-heritage text-xs">
                              {item.product.heritage.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary-600">
                            {formatPrice(item.product.price)}
                          </span>

                          {/* 数量控制 */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-ink-200 flex items-center justify-center text-ink-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-ink-200 flex items-center justify-center text-ink-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-ink-300 hover:text-red-500 transition-colors self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部结算 */}
            {items.length > 0 && (
              <div className="border-t border-ink-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">商品合计</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-ink-400">
                  <span className="flex-1 text-center py-2 rounded-lg bg-heritage-50 text-heritage-600">
                    🎁 购买即获非遗碎片奖励
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearCart}
                  >
                    清空购物车
                  </Button>
                  <Button 
                    variant="heritage" 
                    className="flex-1"
                    onClick={() => {
                      alert('订单提交成功！感谢您支持非遗文化传承。')
                      clearCart()
                      toggleCart()
                    }}
                  >
                    去结算
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
