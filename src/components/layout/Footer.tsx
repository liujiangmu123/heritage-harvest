import { Link } from 'react-router-dom'
import { 
  Leaf, 
  Mail, 
  MapPin,
  Github,
  Hand,
  Scissors,
  Mountain,
  Palette,
  TreeDeciduous
} from 'lucide-react'

const experiences = [
  { label: '哈尼梯田生态VR', href: '/experience/hani-terrace', icon: Mountain },
  { label: '藤编工艺体验', href: '/experience/bamboo-weaving', icon: Hand },
  { label: '剪纸艺术', href: '/experience/paper-cutting', icon: Scissors },
  { label: '凤翔泥塑', href: '/experience/fengxiang-clay', icon: Palette },
]

const ecoFeatures = [
  '生态知识问答',
  '碳账户系统',
  '绿色积分',
  'AI拍立得合影',
  '生态承诺墙',
  '绿色市集',
]

const techStack = [
  'React 18',
  'Three.js',
  'MediaPipe',
  'TypeScript',
  'TailwindCSS',
  'Framer Motion',
]

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-white">
      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* 品牌信息 */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-heritage-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">乡遗识</h3>
                <p className="text-sm text-ink-400">探寻乡村生态智慧</p>
              </div>
            </Link>
            
            <p className="text-ink-300 mb-6 max-w-md leading-relaxed">
              传承非遗生态智慧，共享绿色文脉遗产。
              运用数字技术让传统工艺焕发新生，
              在体验中感悟可持续发展的古老智慧。
            </p>

            {/* 联系信息 */}
            <div className="space-y-3">
              <a 
                href="mailto:contact@heritage-viz.com" 
                className="flex items-center gap-3 text-ink-300 hover:text-heritage-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                contact@heritage-viz.com
              </a>
              <div className="flex items-start gap-3 text-ink-300">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>非遗数字化创新实验室</span>
              </div>
            </div>

            {/* 社交媒体 */}
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-ink-800 hover:bg-heritage-500 flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 生态体验 */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-eco-400" />
              生态体验
            </h4>
            <ul className="space-y-3">
              {experiences.map((exp) => (
                <li key={exp.href}>
                  <Link
                    to={exp.href}
                    className="flex items-center gap-2 text-ink-400 hover:text-eco-400 transition-colors"
                  >
                    <exp.icon className="w-4 h-4" />
                    {exp.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 绿色功能 */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4 text-eco-400" />
              绿色功能
            </h4>
            <div className="flex flex-wrap gap-2">
              {ecoFeatures.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-eco-900/30 border border-eco-800/50 rounded-full text-sm text-eco-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* 技术栈 */}
          <div>
            <h4 className="font-bold text-lg mb-4">技术栈</h4>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-ink-800 rounded-full text-sm text-ink-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-ink-400 text-sm">
              © 2024 兰州石化职业技术大学 - 刘智远开发团队. 保留所有权利。
            </p>
            <div className="flex items-center gap-6">
              <span className="text-ink-500 text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4 text-eco-500" />
                传承生态智慧 · 共享绿色文脉
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
