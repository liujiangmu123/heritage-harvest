/**
 * 皮影人物创建器 - 剧目驱动的简化流程
 * 
 * 流程：选择剧目 → 为角色上传完整图 → 开始表演
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Play, Copy, ChevronRight, Upload } from 'lucide-react'

// ============ 剧目配置 ============
interface PlayCharacter {
  id: string
  name: string
  role: string
  prompt: string
  imageUrl: string | null
}

interface PlayConfig {
  id: string
  title: string
  description: string
  characters: PlayCharacter[]
}

const PLAYS: PlayConfig[] = [
  {
    id: 'xixiang',
    title: '西厢记',
    description: '张生与崔莺莺的爱情故事',
    characters: [
      {
        id: 'cuiyingying',
        name: '崔莺莺',
        role: '旦角',
        prompt: `Artistic Chinese shadow puppet character sheet, Cui Yingying (崔莺莺) female dan role fromerta of West Chamber, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: elaborate black hair bun with golden phoenix hairpin and pearl ornaments, beautiful oval face with willow eyebrow and cherry lips, red opera robe with wide flowing water sleeves, cloud and peony embroidery patterns, green silk sash belt, long flowing pleated skirt, graceful orchid finger gesture.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with headdress (neck connection overlap)
[LEFT] Left arm with water sleeve
[RIGHT] Right arm with water sleeve  
[MIDDLE] Body/torso with costume
[BOTTOM] Lower skirt/robe hem

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      },
      {
        id: 'zhangsheng',
        name: '张生',
        role: '生角',
        prompt: `Artistic Chinese shadow puppet character sheet, Zhang Sheng (张生) male scholar xiaosheng role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: black traditional scholar hat with jade ornament, refined handsome face with thin elegant mustache, scholarly gentle expression, blue-grey literati robe with wide sleeves, subtle cloud pattern embroidery, green belt with jade pendant, hand holding folding fan.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with scholar hat (neck connection overlap)
[LEFT] Left arm with wide sleeve
[RIGHT] Right arm with sleeve and folding fan
[MIDDLE] Body/torso with robe
[BOTTOM] Lower robe hem

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      }
    ]
  },
  {
    id: 'sanguo',
    title: '三英战吕布',
    description: '刘关张大战吕布',
    characters: [
      {
        id: 'guanyu',
        name: '关羽',
        role: '净角',
        prompt: `Artistic Chinese shadow puppet character sheet, Guan Yu (关羽) God of War jing role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: iconic red painted face (红脸), elaborate golden warrior helmet with tall red feather plume, long flowing black beard (美髯公), fierce loyal expression, green battle armor with dragon scale pattern, golden ornaments and trim, thick battle belt, powerful stance gripping Green Dragon Crescent Blade (青龙偃月刀).

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with helmet and beard (neck connection overlap)
[LEFT] Left arm with armored sleeve
[RIGHT] Right arm gripping weapon handle
[MIDDLE] Body/torso with green armor
[BOTTOM] Lower armor skirt and boots
[WEAPON] Green Dragon Crescent Blade (separate piece)

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      },
      {
        id: 'zhaoyun',
        name: '赵云',
        role: '武生',
        prompt: `Artistic Chinese shadow puppet character sheet, Zhao Yun (赵云) heroic warrior wusheng role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: silver warrior helmet with white feather plume, handsome heroic face with determined expression, silver-white battle armor with cloud pattern, red cape flowing behind, holding long silver spear with red tassel, armored boots.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with silver helmet (neck connection overlap)
[LEFT] Left arm with armored sleeve
[RIGHT] Right arm holding spear
[MIDDLE] Body/torso with silver armor and red cape
[BOTTOM] Lower armor and boots
[WEAPON] Silver spear with red tassel (separate piece)

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      }
    ]
  },
  {
    id: 'mulan',
    title: '木兰从军',
    description: '花木兰代父出征',
    characters: [
      {
        id: 'mulan',
        name: '花木兰',
        role: '武旦',
        prompt: `Artistic Chinese shadow puppet character sheet, Hua Mulan (花木兰) female warrior wudan role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: warrior helmet with red feather plume, beautiful yet determined feminine face, armored battle robe with scale pattern and cloud motifs, red and gold color accents, leather battle belt with ornate buckle, strong hand gripping sword, armored boots, powerful feminine warrior stance.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with warrior helmet (neck connection overlap)
[LEFT] Left arm with armored sleeve
[RIGHT] Right arm gripping sword
[MIDDLE] Body/torso with battle robe
[BOTTOM] Lower armor skirt and boots
[WEAPON] Sword (separate piece)

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      }
    ]
  },
  {
    id: 'baishe',
    title: '白蛇传',
    description: '白娘子与许仙的故事',
    characters: [
      {
        id: 'baisuzhen',
        name: '白素贞',
        role: '青衣',
        prompt: `Artistic Chinese shadow puppet character sheet, Bai Suzhen (白素贞) White Snake Lady qingyi role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: elaborate white and silver headdress with pearl decorations and phoenix ornaments, serene beautiful face with gentle ethereal expression, flowing white opera robe with silver embroidery and wave cloud patterns, wide elegant water sleeves, light blue silk sash belt, graceful immortal bearing, hand holding white oil-paper umbrella.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with white headdress (neck connection overlap)
[LEFT] Left arm with water sleeve
[RIGHT] Right arm with water sleeve holding umbrella
[MIDDLE] Body/torso with white robe
[BOTTOM] Lower robe hem flowing design
[PROP] White oil-paper umbrella (separate piece)

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      },
      {
        id: 'xuxian',
        name: '许仙',
        role: '小生',
        prompt: `Artistic Chinese shadow puppet character sheet, Xu Xian (许仙) young scholar xiaosheng role, intricately carved leather shadow puppet, warm amber backlight through translucent material, side profile silhouette view.

CHARACTER DESIGN: black traditional scholar hat, gentle handsome youthful face with kind expression, white inner robe with light blue outer robe, simple elegant collar, wide sleeves, green belt with jade ornament, scholarly dignified posture, hand holding umbrella.

LAYOUT - separated parts for cutting:
[CENTER] Complete assembled full body figure
[TOP] Head with scholar hat (neck connection overlap)
[LEFT] Left arm with wide sleeve
[RIGHT] Right arm with sleeve holding umbrella
[MIDDLE] Body/torso with layered robes
[BOTTOM] Lower robe hem
[PROP] Umbrella (separate piece)

Color palette: warm amber (#F2D974), heritage red (#c41e3a), dark ink (#2d323c). All parts have 10px overlap margins. Pure transparent background, 1024x1024, fine craftsmanship details, high contrast, 4K`,
        imageUrl: null
      }
    ]
  }
]

interface ShadowPuppetCreatorProps {
  onComplete?: (play: PlayConfig) => void
  onClose?: () => void
  preSelectedPlayId?: string  // 预选的剧目ID
}

export default function ShadowPuppetCreator({ onComplete, onClose, preSelectedPlayId }: ShadowPuppetCreatorProps) {
  // 如果有预选剧目，直接跳到创建步骤
  const preSelectedPlay = preSelectedPlayId ? PLAYS.find(p => p.id === preSelectedPlayId) || null : null
  
  const [step, setStep] = useState<'select' | 'create'>(preSelectedPlay ? 'create' : 'select')
  const [selectedPlay, setSelectedPlay] = useState<PlayConfig | null>(preSelectedPlay)
  const [characters, setCharacters] = useState<PlayCharacter[]>(
    preSelectedPlay ? preSelectedPlay.characters.map(c => ({ ...c })) : []
  )
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  // 选择剧目
  const handleSelectPlay = (play: PlayConfig) => {
    setSelectedPlay(play)
    setCharacters(play.characters.map(c => ({ ...c })))
    setCurrentCharIndex(0)
    setStep('create')
  }

  // 上传角色图片
  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setCharacters(prev => prev.map((char, idx) => 
        idx === currentCharIndex ? { ...char, imageUrl } : char
      ))
    }
    reader.readAsDataURL(file)
  }, [currentCharIndex])

  // 复制Prompt
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  // 检查是否所有角色都已上传
  const allUploaded = characters.every(c => c.imageUrl)
  const currentChar = characters[currentCharIndex]

  // 完成创建
  const handleComplete = () => {
    if (selectedPlay && allUploaded) {
      onComplete?.({ ...selectedPlay, characters })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* 头部 */}
        <div className="bg-amber-900 text-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎭</span>
            <h2 className="text-xl font-bold">
              {step === 'select' ? '选择剧目' : selectedPlay?.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* 步骤1：选择剧目 */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <p className="text-amber-700 mb-6 text-center">选择一个剧目，为角色生成皮影</p>
              
              <div className="grid grid-cols-2 gap-4">
                {PLAYS.map(play => (
                  <button
                    key={play.id}
                    onClick={() => handleSelectPlay(play)}
                    className="bg-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all border-2 border-transparent hover:border-amber-400"
                  >
                    <h3 className="text-xl font-bold text-amber-900 mb-1">{play.title}</h3>
                    <p className="text-amber-600 text-sm mb-3">{play.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-500">
                      <span>需要角色：</span>
                      {play.characters.map(c => (
                        <span key={c.id} className="bg-amber-100 px-2 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 步骤2：创建角色 */}
          {step === 'create' && currentChar && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              {/* 进度指示 */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {characters.map((char, idx) => (
                  <button
                    key={char.id}
                    onClick={() => setCurrentCharIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      idx === currentCharIndex 
                        ? 'bg-amber-500 text-white' 
                        : char.imageUrl 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {char.imageUrl && <Check className="w-4 h-4" />}
                    <span>{char.name}</span>
                    <span className="text-xs opacity-70">({char.role})</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-6">
                {/* 左侧：上传区域 */}
                <div className="flex-1">
                  <div 
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: `radial-gradient(ellipse 85% 65% at 50% 48%, 
                        rgba(255,248,230,1) 0%,
                        rgba(255,220,165,1) 30%,
                        rgba(220,160,90,1) 60%,
                        rgba(120,70,30,1) 100%
                      )`,
                      height: 400
                    }}
                  >
                    {currentChar.imageUrl ? (
                      /* 已上传：显示图片 */
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <img 
                          src={currentChar.imageUrl} 
                          alt={currentChar.name}
                          className="max-h-full max-w-full object-contain"
                          style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.4))' }}
                        />
                        <button
                          onClick={() => setCharacters(prev => prev.map((c, i) => 
                            i === currentCharIndex ? { ...c, imageUrl: null } : c
                          ))}
                          className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                        >
                          重新上传
                        </button>
                      </div>
                    ) : (
                      /* 未上传：显示完整骨架框 - 放大版 */
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors pt-4">
                        <svg viewBox="-140 -200 280 440" className="w-80 h-[360px]">
                          {/* 头部 - 椭圆形 */}
                          <ellipse cx="0" cy="-145" rx="38" ry="48" 
                                   fill="rgba(180,140,80,0.08)" stroke="rgba(180,140,80,0.6)" 
                                   strokeWidth="2" strokeDasharray="8,4"/>
                          <text x="0" y="-148" fontSize="11" fill="rgba(120,80,40,0.8)" textAnchor="middle" fontWeight="bold">头部</text>
                          <text x="0" y="-135" fontSize="8" fill="rgba(120,80,40,0.5)" textAnchor="middle">含发髻/头饰</text>
                          
                          {/* 身体 - 中间主体 */}
                          <rect x="-50" y="-90" width="100" height="110" rx="8"
                                fill="rgba(180,140,80,0.08)" stroke="rgba(180,140,80,0.6)" 
                                strokeWidth="2" strokeDasharray="8,4"/>
                          <text x="0" y="-40" fontSize="11" fill="rgba(120,80,40,0.8)" textAnchor="middle" fontWeight="bold">身体</text>
                          <text x="0" y="-25" fontSize="8" fill="rgba(120,80,40,0.5)" textAnchor="middle">服饰主体</text>
                          
                          {/* 左臂 */}
                          <rect x="-115" y="-75" width="55" height="120" rx="6"
                                fill="rgba(140,100,60,0.08)" stroke="rgba(140,100,60,0.5)" 
                                strokeWidth="2" strokeDasharray="6,3"/>
                          <text x="-87" y="-15" fontSize="10" fill="rgba(120,80,40,0.7)" textAnchor="middle" fontWeight="bold">左臂</text>
                          
                          {/* 右臂 */}
                          <rect x="60" y="-75" width="55" height="120" rx="6"
                                fill="rgba(140,100,60,0.08)" stroke="rgba(140,100,60,0.5)" 
                                strokeWidth="2" strokeDasharray="6,3"/>
                          <text x="87" y="-15" fontSize="10" fill="rgba(120,80,40,0.7)" textAnchor="middle" fontWeight="bold">右臂</text>
                          
                          {/* 下摆/裙摆 */}
                          <rect x="-45" y="30" width="90" height="100" rx="8"
                                fill="rgba(180,140,80,0.08)" stroke="rgba(180,140,80,0.6)" 
                                strokeWidth="2" strokeDasharray="8,4"/>
                          <text x="0" y="75" fontSize="11" fill="rgba(120,80,40,0.8)" textAnchor="middle" fontWeight="bold">下摆</text>
                          <text x="0" y="90" fontSize="8" fill="rgba(120,80,40,0.5)" textAnchor="middle">裙/袍下摆</text>
                          
                          {/* 武器位置提示（可选） */}
                          <rect x="75" y="55" width="50" height="80" rx="4"
                                fill="rgba(200,100,80,0.05)" stroke="rgba(200,100,80,0.3)" 
                                strokeWidth="1.5" strokeDasharray="4,2"/>
                          <text x="100" y="95" fontSize="8" fill="rgba(180,80,60,0.6)" textAnchor="middle">武器</text>
                          <text x="100" y="105" fontSize="7" fill="rgba(180,80,60,0.4)" textAnchor="middle">(可选)</text>
                          
                          {/* 连接线提示 */}
                          <line x1="0" y1="-97" x2="0" y2="-90" stroke="rgba(180,140,80,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                          <line x1="0" y1="20" x2="0" y2="30" stroke="rgba(180,140,80,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                          <line x1="-50" y1="-40" x2="-60" y2="-40" stroke="rgba(140,100,60,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                          <line x1="50" y1="-40" x2="60" y2="-40" stroke="rgba(140,100,60,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                          
                          {/* 尺寸提示 */}
                          <text x="0" y="155" fontSize="9" fill="rgba(100,70,40,0.5)" textAnchor="middle">
                            建议尺寸: 1024×1024 或更高
                          </text>
                        </svg>
                        
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-amber-600 mx-auto mb-1" />
                          <p className="text-amber-800 font-bold">点击上传 {currentChar.name}</p>
                          <p className="text-amber-600 text-xs">上传AI生成的完整皮影图片（透明背景）</p>
                        </div>
                        
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUpload(file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 右侧：Prompt */}
                <div className="w-80">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <span>📝</span> {currentChar.name} 生成Prompt
                    </h4>
                    <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700 mb-3 max-h-48 overflow-y-auto">
                      {currentChar.prompt}
                    </div>
                    <button 
                      onClick={() => copyPrompt(currentChar.prompt)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      复制Prompt
                    </button>
                  </div>

                  <div className="mt-4 bg-amber-100 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 mb-2">💡 使用步骤</h4>
                    <ol className="text-sm text-amber-700 space-y-1">
                      <li>1. 复制上方Prompt</li>
                      <li>2. 用Midjourney/DALL-E生成</li>
                      <li>3. 去除背景（remove.bg）</li>
                      <li>4. 上传到左侧区域</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                >
                  ← 重选剧目
                </button>
                
                <div className="flex gap-3">
                  {currentCharIndex > 0 && (
                    <button
                      onClick={() => setCurrentCharIndex(prev => prev - 1)}
                      className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300"
                    >
                      上一个角色
                    </button>
                  )}
                  
                  {currentCharIndex < characters.length - 1 ? (
                    <button
                      onClick={() => setCurrentCharIndex(prev => prev + 1)}
                      className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                    >
                      下一个角色 <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={!allUploaded}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      开始表演
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
