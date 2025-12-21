import { motion } from 'framer-motion'
import { Leaf, School, Building2, UserCircle, Tractor, ArrowRight, TreeDeciduous, Recycle, Droplets, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

const partners = [
  { icon: School, name: '高校', role: '生态研究与技术创新', desc: '提供生态智慧研究与绿色技术开发' },
  { icon: Building2, name: '政府', role: '绿色政策与碳中和支持', desc: '提供环保政策指导与绿色认证' },
  { icon: UserCircle, name: '传承人', role: '生态智慧传授', desc: '传承可持续发展的传统生态智慧' },
  { icon: Tractor, name: '合作社', role: '绿色产品供应', desc: '提供有机农产品与环保手工艺品' },
]

const milestones = [
  { year: '2023', title: '项目启动', desc: '乡遗识项目正式启动，开始非遗生态智慧探索' },
  { year: '2023', title: '生态合作', desc: '与哈尼梯田、安溪藤编、武夷茶园建立生态合作' },
  { year: '2024', title: '绿色平台', desc: '生态智慧数字体验平台正式上线' },
  { year: '2024', title: '绿色转型', desc: '全面转型为生态文明数字科普平台' },
  { year: '2025', title: '碳中和目标', desc: '启动碳账户系统，助力用户实现个人碳中和' },
]

// 生态价值观
const ecoValues = [
  { icon: TreeDeciduous, title: '碳中和', desc: '通过数字体验减少实地旅行碳排放' },
  { icon: Recycle, title: '循环经济', desc: '传承"物尽其用"的传统生态智慧' },
  { icon: Droplets, title: '水资源保护', desc: '展示传统水循环利用的生态系统' },
  { icon: Mountain, title: '生态多样性', desc: '保护和传承生物多样性的传统知识' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero - 绿色主题 */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eco-600 via-bamboo-600 to-eco-700" />
        <div className="absolute inset-0 pattern-overlay opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="heritage" className="mb-6 bg-white/20 text-white border-white/30">
              <Leaf className="w-4 h-4 mr-2" />
              关于乡遗识
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              探寻乡村生态智慧
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              我们致力于通过数字技术传承传统非遗中的生态智慧，
              让"以竹代塑"、"循环经济"、"天人合一"等可持续发展理念在数字时代焕发新生。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 使命愿景 - 绿色生态主题 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="heritage" className="mb-4 bg-eco-100 text-eco-700 border-eco-200">我们的使命</Badge>
              <h2 className="text-3xl font-bold text-ink-900 mb-6">
                Green Heritage · 绿色文脉传承
              </h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                传统非遗不仅是文化瑰宝，更蕴含着古人与自然和谐共生的生态智慧。
                我们通过数字技术，让这些可持续发展的理念在现代社会重新焕发活力。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-eco-100 flex items-center justify-center flex-shrink-0">
                    <Recycle className="w-5 h-5 text-eco-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">Ecological Wisdom · 生态智慧</h3>
                    <p className="text-sm text-ink-500">传承"天人合一"的传统生态观念</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bamboo-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-bamboo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">Sustainable Heritage · 可持续传承</h3>
                    <p className="text-sm text-ink-500">以竹代塑、循环经济、天然材料的现代应用</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-carbon-100 flex items-center justify-center flex-shrink-0">
                    <TreeDeciduous className="w-5 h-5 text-carbon-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">Carbon Neutral · 碳中和实践</h3>
                    <p className="text-sm text-ink-500">数字体验减少碳排放，助力个人碳中和</p>
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
                src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=800"
                alt="哈尼梯田生态系统"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-eco-100 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 生态价值观 */}
      <section className="py-20 bg-gradient-to-b from-white to-eco-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="heritage" className="mb-4 bg-eco-100 text-eco-700 border-eco-200">生态价值观</Badge>
            <h2 className="text-3xl font-bold text-ink-900 mb-4">
              我们的绿色承诺
            </h2>
            <p className="text-ink-500 max-w-2xl mx-auto">
              每一次数字体验，都是对地球的温柔守护
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecoValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full bg-white border-eco-100 hover:border-eco-300 transition-colors">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-eco-400 to-bamboo-500 flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">{value.title}</h3>
                  <p className="text-ink-500 text-sm">{value.desc}</p>
                </Card>
              </motion.div>
            ))}
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

      {/* CTA - 绿色主题 */}
      <section className="py-20 bg-gradient-to-br from-eco-500 to-bamboo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            加入我们，共同守护绿色文脉
          </h2>
          <p className="text-xl text-white/80 mb-8">
            每一次体验都是对生态智慧的传承，每一次分享都是对绿色未来的贡献
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-eco-600 hover:bg-white/90">
              <Link to="/experience/hani-terrace" className="flex items-center gap-2">
                开始生态体验 <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 hover:bg-white/10">
              <Link to="/pledge-wall" className="flex items-center gap-2">
                发布生态承诺
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
