import { motion } from 'framer-motion'
import { Sparkles, Users, Award, Leaf, School, Building2, UserCircle, Tractor, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

const partners = [
  { icon: School, name: '高校', role: '人才输出与技术创新', desc: '提供前沿技术研究与青年人才培养' },
  { icon: Building2, name: '政府', role: '政策支持与品牌背书', desc: '提供政策指导与官方认证' },
  { icon: UserCircle, name: '传承人', role: '技艺传授与文化输出', desc: '传承非遗技艺，讲述文化故事' },
  { icon: Tractor, name: '合作社', role: '产品供应与品质保障', desc: '提供优质农产品与非遗手工艺品' },
]

const milestones = [
  { year: '2023', title: '项目启动', desc: '乡遗识项目正式启动，开始非遗数字化探索' },
  { year: '2023', title: '首批合作', desc: '与丹寨、安溪、青神建立合作关系' },
  { year: '2024', title: '平台上线', desc: 'WebXR沉浸式体验平台正式上线' },
  { year: '2024', title: '数字藏品', desc: 'ERC-4337无感钱包与数字藏品系统发布' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-heritage-600 via-primary-600 to-heritage-700" />
        <div className="absolute inset-0 pattern-overlay opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="heritage" className="mb-6 bg-white/20 text-white border-white/30">
              <Sparkles className="w-4 h-4 mr-2" />
              关于乡遗识
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              让乡愁在数字时代被传承
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              我们致力于通过数字技术赋能非物质文化遗产传承与乡村振兴，
              构建一个连接传统与现代、链接城市与乡村的文化桥梁。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 使命愿景 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="heritage" className="mb-4">我们的使命</Badge>
              <h2 className="text-3xl font-bold text-ink-900 mb-6">
                从"品尝"到"体验"的价值升维
              </h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                每一件农产品，不仅是食物，更是承载文化故事的媒介。
                消费者购买的是一次深入了解地方文化的机会，是与传承人精神对话的入口。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-heritage-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-heritage-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">非遗为魂</h3>
                    <p className="text-sm text-ink-500">为产品注入独特的文化内涵与故事</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nature-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-nature-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">农产为骨</h3>
                    <p className="text-sm text-ink-500">以高品质农产品为载体，传递乡土风味</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                alt="非遗传承"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-heritage-100 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 四方协作 */}
      <section id="partners" className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="heritage" className="mb-4">四方协作</Badge>
            <h2 className="text-3xl font-bold text-ink-900 mb-4">
              校-政-传-社 协同发展模式
            </h2>
            <p className="text-ink-500 max-w-2xl mx-auto">
              汇聚高校智力、政府支持、传承人技艺、合作社资源，
              构建可持续的非遗传承与乡村振兴生态系统
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="heritage" className="p-6 text-center h-full">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-heritage-400 to-primary-500 flex items-center justify-center mb-4">
                    <partner.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-1">{partner.name}</h3>
                  <p className="text-heritage-600 text-sm mb-3">{partner.role}</p>
                  <p className="text-ink-500 text-sm">{partner.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 发展历程 */}
      <section className="py-20 bg-ink-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="heritage" className="mb-4">发展历程</Badge>
            <h2 className="text-3xl font-bold mb-4">我们的成长足迹</h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-heritage-500/30 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1 text-center md:text-right">
                    {index % 2 === 0 && (
                      <>
                        <span className="text-heritage-400 font-bold">{milestone.year}</span>
                        <h3 className="text-xl font-bold mt-1">{milestone.title}</h3>
                        <p className="text-ink-400 mt-2">{milestone.desc}</p>
                      </>
                    )}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-heritage-500 border-4 border-ink-950 z-10" />
                  <div className="flex-1 text-center md:text-left">
                    {index % 2 === 1 && (
                      <>
                        <span className="text-heritage-400 font-bold">{milestone.year}</span>
                        <h3 className="text-xl font-bold mt-1">{milestone.title}</h3>
                        <p className="text-ink-400 mt-2">{milestone.desc}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-heritage-500 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            加入我们，共同守护文化瑰宝
          </h2>
          <p className="text-xl text-white/80 mb-8">
            无论您是传承人、学者、企业还是消费者，都可以成为文化传承的一份力量
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90">
              <Link to="/products" className="flex items-center gap-2">
                探索臻品 <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 hover:bg-white/10">
              联系我们
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
