// 产品类型
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: ProductCategory
  heritage: Heritage
  origin: string
  specifications: ProductSpec[]
  tags: string[]
  stock: number
  sales: number
  rating: number
  reviews: number
  vrExperienceId?: string
  createdAt: string
}

export interface ProductSpec {
  label: string
  value: string
}

export type ProductCategory = 
  | 'tea'      // 茶叶
  | 'rice'     // 大米
  | 'honey'    // 蜂蜜
  | 'bamboo'   // 竹制品
  | 'textile'  // 纺织品
  | 'ceramic'  // 陶瓷
  | 'food'     // 食品
  | 'craft'    // 手工艺品

// 非遗类型
export interface Heritage {
  id: string
  name: string
  type: HeritageType
  level: HeritageLevel
  region: string
  description: string
  history: string
  techniques: string[]
  inheritor: Inheritor
  images: string[]
  videos?: string[]
  vrSceneId?: string
  relatedProducts: string[]
  story: string
}

export type HeritageType = 
  | 'craft'        // 传统技艺
  | 'performance'  // 传统表演
  | 'custom'       // 民俗
  | 'medicine'     // 传统医药
  | 'art'          // 传统美术

export type HeritageLevel = 
  | 'national'     // 国家级
  | 'provincial'   // 省级
  | 'municipal'    // 市级
  | 'county'       // 县级

// 传承人
export interface Inheritor {
  id: string
  name: string
  title: string
  avatar: string
  bio: string
  achievements: string[]
  yearsOfPractice: number
}

// 数字藏品
export interface DigitalCollectible {
  id: string
  name: string
  description: string
  image: string
  rarity: CollectibleRarity
  heritageId: string
  series: string
  totalSupply: number
  currentSupply: number
  attributes: CollectibleAttribute[]
  unlockedAt?: string
}

export type CollectibleRarity = 
  | 'common'     // 普通
  | 'rare'       // 稀有
  | 'epic'       // 史诗
  | 'legendary'  // 传说

export interface CollectibleAttribute {
  trait: string
  value: string
}

// 碎片系统
export interface Fragment {
  id: string
  name: string
  image: string
  heritageId: string
  description: string
  collected: boolean
  collectedAt?: string
}

export interface Badge {
  id: string
  name: string
  image: string
  description: string
  heritageId: string
  requiredFragments: string[]
  unlocked: boolean
  unlockedAt?: string
  privileges: string[]
}

// 用户类型
export interface User {
  id: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  level: number
  experience: number
  fragments: Fragment[]
  badges: Badge[]
  collectibles: DigitalCollectible[]
  orders: Order[]
  favorites: string[]
  createdAt: string
}

// 订单类型
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: Address
  createdAt: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

export type OrderStatus = 
  | 'pending'    // 待支付
  | 'paid'       // 已支付
  | 'shipped'    // 已发货
  | 'completed'  // 已完成
  | 'cancelled'  // 已取消

export interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

// VR体验
export interface VRExperience {
  id: string
  name: string
  heritageId: string
  scenes: VRScene[]
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  rewards: VRReward[]
}

export interface VRScene {
  id: string
  name: string
  type: 'panorama' | 'interactive' | 'game'
  assets: string[]
  description: string
  interactions: VRInteraction[]
}

export interface VRInteraction {
  id: string
  type: 'click' | 'drag' | 'gesture'
  target: string
  action: string
  feedback: string
}

export interface VRReward {
  type: 'fragment' | 'coupon' | 'experience'
  value: string | number
  probability: number
}

// 购物车
export interface CartItem {
  productId: string
  product: Product
  quantity: number
}
