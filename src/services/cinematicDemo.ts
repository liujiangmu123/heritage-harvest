// 乡遗识 - 电影级自动演示服务
// 专注编织体验的完整流程演示

/**
 * 场景显示模式
 */
export const DISPLAY_MODES = {
  FULLSCREEN: 'fullscreen',  // 全屏标题（开场/结尾）
  OVERLAY: 'overlay',        // 叠加信息卡片
  FOCUS: 'focus',            // 聚焦特定区域
  CLEAN: 'clean',            // 纯净展示
} as const

export type DisplayMode = typeof DISPLAY_MODES[keyof typeof DISPLAY_MODES]

/**
 * 演示场景定义
 */
export interface CinematicScene {
  id: string
  type: 'title' | 'transition' | 'narrative' | 'hero' | 'feature' | 'business' | 'impact' | 'ending'
  displayMode: DisplayMode
  title?: string
  subtitle?: string
  tagline?: string
  bullets?: string[]
  tip?: string
  duration: number
  highlight?: 'scene3d' | 'left-panel' | 'right-panel'
  action?: string
  route?: string
  showContact?: boolean
}

/**
 * 演示场景定义 - 与讲解文案同步
 * 总时长：3分5秒 = 185秒
 * 每个场景对应文案的一段讲解
 */
export const CINEMATIC_SCENES: CinematicScene[] = [
  // ===== 第一幕：开场标题 (0:00-0:04) =====
  // 文案："乡遗识——乡村生态智慧的数字化科普与体验平台。"
  {
    id: 'opening-title',
    type: 'title',
    displayMode: DISPLAY_MODES.FULLSCREEN,
    title: '乡遗识',
    subtitle: '乡村生态智慧的数字化科普与体验平台',
    duration: 4000,
  },
  
  // ===== 第二幕：双碳背景 (0:04-0:08) =====
  // 文案："2030年碳达峰、2060年碳中和，是国家重大战略目标。"
  {
    id: 'dual-carbon-bg',
    type: 'narrative',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '双碳战略目标',
    subtitle: '2030年碳达峰 · 2060年碳中和',
    tagline: '国家重大战略目标',
    duration: 4000,
    route: '/',
    action: 'scrollToTop',
  },
  
  // ===== 第三幕：非遗数据 (0:08-0:16) =====
  // 文案："非物质文化遗产，承载着中华民族五千年的生态智慧。全国非遗代表性项目超过1500项，其中蕴含大量可持续发展理念。"
  {
    id: 'heritage-data',
    type: 'narrative',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '非遗生态智慧',
    bullets: [
      '🏛️ 中华民族五千年的生态智慧载体',
      '📊 全国非遗代表性项目超过1500项',
      '🌱 蕴含大量可持续发展理念',
    ],
    duration: 8000,
  },
  
  // ===== 第四幕：三大痛点 (0:16-0:28) =====
  // 文案："然而，当代青年面临三大痛点：生态智慧认知断层...传统科普形式枯燥...环保行为缺乏激励..."
  {
    id: 'pain-points',
    type: 'narrative',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '当代青年面临三大痛点',
    bullets: [
      '❌ 生态智慧认知断层，非遗背后的环保内涵被忽视',
      '❌ 传统科普形式枯燥，难以激发年轻人学习兴趣',
      '❌ 环保行为缺乏激励，知识无法转化为绿色生活',
    ],
    duration: 12000,
  },
  
  // ===== 第五幕：平台定位 (0:28-0:36) =====
  // 文案："乡遗识，基于沉浸式体验的生态智慧科普平台，让非遗成为环保教育的载体。我们重新定义非遗——非遗技艺，等于古人与自然和谐共生的智慧。"
  {
    id: 'platform-position',
    type: 'hero',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '重新定义非遗',
    subtitle: '基于沉浸式体验的生态智慧科普平台',
    tagline: '非遗技艺 = 古人与自然和谐共生的智慧',
    duration: 8000,
  },
  
  // ===== 第六幕：六大生态智慧分类 (0:36-0:54) =====
  // 文案：介绍六大分类
  {
    id: 'six-categories-intro',
    type: 'feature',
    displayMode: DISPLAY_MODES.FOCUS,
    title: '六大生态智慧分类',
    tip: '平台系统覆盖六大生态智慧分类',
    duration: 3000,
    action: 'scrollToExperiences',
  },
  {
    id: 'six-categories-detail',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '六大生态智慧',
    bullets: [
      '🌾 哈尼梯田 — 四素同构的水资源循环智慧',
      '🎋 藤编工艺 — 以竹代塑的绿色替代方案',
      '🎭 皮影戏 — 一张牛皮循环利用的传统智慧',
      '✂️ 剪纸艺术 — 100%可降解材料的古老应用',
      '🏺 凤翔泥塑 — 零化学添加的天然材料工艺',
      '🍵 茶道生态 — 茶园碳汇的农耕生态系统',
    ],
    duration: 15000,
  },
  
  // ===== 第七幕：技术亮点 (0:54-1:02) =====
  // 文案："我们采用 Three.js 技术，构建实时渲染的3D数字孪生体验。非遗工艺的每一个步骤，都能在屏幕上栩栩如生地呈现。"
  {
    id: 'tech-threejs',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '3D数字孪生技术',
    subtitle: '采用 Three.js 构建实时渲染体验',
    tagline: '非遗工艺每一步都能栩栩如生地呈现',
    duration: 8000,
    action: 'scrollToJourney',
  },
  
  // ===== 第八幕：千人千面设计 (1:02-1:10) =====
  // 文案："基于 AI 算法的千人千面设计系统，每位用户都会获得专属配色、独特形状、编织DNA，让每件作品独一无二。"
  {
    id: 'ai-design-system',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: 'AI千人千面设计系统',
    bullets: [
      '🎨 专属配色 — 基于用户特征生成',
      '💎 独特形状 — AI算法自动设计',
      '🧬 编织DNA — 让每件作品独一无二',
    ],
    duration: 8000,
  },
  
  // ===== 第九幕：进入编织体验 (1:10-1:12) =====
  {
    id: 'weaving-enter',
    type: 'transition',
    displayMode: DISPLAY_MODES.CLEAN,
    duration: 2000,
    route: '/experience/bamboo-weaving',
    action: 'navigateToWeaving',
  },
  
  // ===== 第十幕：编织演示 (1:12-1:22) =====
  // 文案："用户可以亲手编织一个藤编作品，感受传统工艺的魅力。藤条一根根缠绕上去，模拟真实的编织工艺。"
  {
    id: 'weaving-intro',
    type: 'feature',
    displayMode: DISPLAY_MODES.FOCUS,
    title: '藤编工艺体验',
    tip: '亲手编织，藤条一根根缠绕，模拟真实工艺',
    duration: 3000,
  },
  {
    id: 'weaving-close-modal',
    type: 'transition',
    displayMode: DISPLAY_MODES.CLEAN,
    duration: 500,
    action: 'closeWeavingModal',
  },
  {
    id: 'weaving-animation',
    type: 'feature',
    displayMode: DISPLAY_MODES.CLEAN,
    title: '',
    duration: 7000,
    action: 'autoWeaveAnimation',
  },
  
  // ===== 第十一幕：手势识别 (1:22-1:29) =====
  // 文案："基于 MediaPipe 的手势识别技术，支持手势操控皮影人物。沉浸式交互，让科普学习充满乐趣。"
  {
    id: 'gesture-tech',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: 'MediaPipe手势识别',
    bullets: [
      '✋ 手势操控皮影人物',
      '🎮 沉浸式交互体验',
      '🎉 让科普学习充满乐趣',
    ],
    duration: 7000,
  },
  
  // ===== 第十二幕：碳减排记录 (1:29-1:36) =====
  // 文案："每一次体验完成，都能获得碳减排记录。云游替代实地旅游，减少交通、住宿带来的碳排放。"
  {
    id: 'carbon-record',
    type: 'impact',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '碳减排记录',
    bullets: [
      '📝 每次体验完成获得碳减排记录',
      '✈️ 云游替代实地旅游',
      '🌍 减少交通、住宿碳排放',
    ],
    duration: 7000,
  },
  
  // ===== 第十三幕：AI拍立得 (1:36-1:46) =====
  // 文案："进入我们的核心创新——AI拍立得。复古胶片相机设计，六种生态场景可选。点击拍照，生成专属的低碳云游纪念照。"
  {
    id: 'polaroid-transition',
    type: 'transition',
    displayMode: DISPLAY_MODES.CLEAN,
    duration: 2000,
    route: '/experience/ai-polaroid',
    action: 'navigateToPolaroid',
  },
  {
    id: 'polaroid-camera',
    type: 'feature',
    displayMode: DISPLAY_MODES.FOCUS,
    title: '核心创新：AI拍立得',
    tip: '复古胶片相机设计 · 六种生态场景可选',
    duration: 4000,
    highlight: 'left-panel',
  },
  {
    id: 'polaroid-photo',
    type: 'feature',
    displayMode: DISPLAY_MODES.FOCUS,
    title: '低碳云游纪念照',
    tip: '点击拍照，生成专属纪念照',
    duration: 4000,
    highlight: 'right-panel',
  },
  
  // ===== 第十四幕：翻转照片 (1:46-1:56) =====
  // 文案："翻转照片背面，碳减排数据一目了然：竹子6个月可降解，塑料需要450年。照片一键分享到社交媒体，让环保行为变成可传播的社交货币。"
  {
    id: 'polaroid-flip',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '碳减排数据展示',
    bullets: [
      '🎋 竹子6个月可降解',
      '🚫 塑料需要450年分解',
      '📱 一键分享社交媒体，环保变社交货币',
    ],
    duration: 10000,
    action: 'flipPolaroid',
  },
  
  // ===== 第十五幕：六环闭环设计 (1:56-2:04) =====
  // 文案："发现、学习、体验、创作、承诺、分享——六环闭环设计，绿色积分贯穿全程，激励用户持续参与。"
  {
    id: 'six-loop-design',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '六环闭环设计',
    subtitle: '发现 → 学习 → 体验 → 创作 → 承诺 → 分享',
    tagline: '绿色积分贯穿全程，激励用户持续参与',
    duration: 8000,
    route: '/',
    action: 'scrollToJourney',
  },
  
  // ===== 第十六幕：个人碳账户 (2:04-2:12) =====
  // 文案："个人碳账户系统，记录每一次环保贡献。积分可兑换生态产品、解锁成就徽章，让环保行为获得真实回报。"
  {
    id: 'carbon-account',
    type: 'impact',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '个人碳账户系统',
    bullets: [
      '📊 记录每一次环保贡献',
      '🎁 积分兑换生态产品',
      '🏅 解锁成就徽章，环保获真实回报',
    ],
    duration: 8000,
    action: 'scrollToImpact',
  },
  
  // ===== 第十七幕：生态承诺墙 (2:12-2:18) =====
  // 文案："生态承诺墙功能，用户可以发布环保承诺，社区互动点赞，形成正向激励。"
  {
    id: 'eco-promise-wall',
    type: 'feature',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '生态承诺墙',
    bullets: [
      '📝 用户发布环保承诺',
      '👍 社区互动点赞',
      '💚 形成正向激励',
    ],
    duration: 6000,
  },
  
  // ===== 第十八幕：技术架构 (2:18-2:24) =====
  // 文案："基于 WebXR API 的技术架构，无需下载APP，扫码即用。这本身就是低碳的产品设计。"
  {
    id: 'webxr-tech',
    type: 'business',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: 'WebXR技术架构',
    bullets: [
      '📱 无需下载APP，扫码即用',
      '🌐 基于WebXR API',
      '🌱 低碳的产品设计理念',
    ],
    duration: 6000,
  },
  
  // ===== 第十九幕：商业模式 (2:24-2:32) =====
  // 文案："B2C加B2B2C双轮驱动的商业模式：C端增值服务、B端景区定制、G端政府科普采购，三端收入协同增长。"
  {
    id: 'business-model',
    type: 'business',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '双轮驱动商业模式',
    subtitle: 'B2C + B2B2C',
    bullets: [
      '👤 C端增值服务',
      '🏢 B端景区定制',
      '🏛️ G端政府科普采购',
    ],
    tagline: '三端收入协同增长',
    duration: 8000,
  },
  
  // ===== 第二十幕：减碳数据 (2:32-2:40) =====
  // 文案："预计10万用户规模下，年减碳量可达5000吨二氧化碳，相当于种植24万棵树，为双碳目标贡献实实在在的力量。"
  {
    id: 'carbon-impact',
    type: 'impact',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '生态影响力',
    bullets: [
      '👥 10万用户规模',
      '🌍 年减碳5000吨CO₂',
      '🌲 相当于种植24万棵树',
    ],
    tagline: '为双碳目标贡献实实在在的力量',
    duration: 8000,
  },
  
  // ===== 第二十一幕：愿景 (2:40-2:50) =====
  // 文案："我们的愿景：让每个年轻人都能看见不可见的生态智慧。在沉浸式体验中理解并践行绿色生活方式。技术创新驱动生态科普，共建美丽中国，贡献双碳目标。"
  {
    id: 'vision',
    type: 'ending',
    displayMode: DISPLAY_MODES.OVERLAY,
    title: '项目愿景',
    bullets: [
      '👁️ 让每个年轻人看见不可见的生态智慧',
      '🌱 在沉浸式体验中践行绿色生活',
      '🚀 技术创新驱动生态科普',
      '🇨🇳 共建美丽中国，贡献双碳目标',
    ],
    duration: 10000,
  },
  
  // ===== 第二十二幕：结尾 (2:50-2:55) =====
  // 文案："感谢您的关注！乡遗识——探寻乡村生态智慧，共享绿色文脉遗产。"
  {
    id: 'closing-title',
    type: 'title',
    displayMode: DISPLAY_MODES.FULLSCREEN,
    title: '感谢您的关注',
    subtitle: '乡遗识\n探寻乡村生态智慧，共享绿色文脉遗产',
    duration: 5000,
    showContact: true,
  },
]

/**
 * 获取场景总时长
 */
export function getTotalDuration(): number {
  return CINEMATIC_SCENES.reduce((sum, s) => sum + s.duration, 0)
}

/**
 * 判断场景是否需要显示文字卡片
 */
export function shouldShowCard(scene: CinematicScene): boolean {
  return scene.displayMode === DISPLAY_MODES.OVERLAY
}

/**
 * 判断场景是否需要显示聚焦提示
 */
export function shouldShowFocusTip(scene: CinematicScene): boolean {
  return scene.displayMode === DISPLAY_MODES.FOCUS && !!scene.tip
}

/**
 * 判断场景是否为全屏标题
 */
export function isFullscreenTitle(scene: CinematicScene): boolean {
  return scene.displayMode === DISPLAY_MODES.FULLSCREEN
}

/**
 * 创建电影级演示控制器
 */
export function createCinematicController() {
  let currentSceneIndex = 0
  let isPlaying = false
  let isPaused = false
  let sceneStartTime = 0
  let sceneProgress = 0
  let animationFrameId: number | null = null
  let onSceneChange: ((scene: CinematicScene, index: number) => void) | null = null
  let onProgress: ((progress: number, total: number) => void) | null = null
  let onComplete: (() => void) | null = null
  let onAction: ((action: string, scene: CinematicScene) => void) | null = null

  const controller = {
    get currentScene() { return CINEMATIC_SCENES[currentSceneIndex] },
    get currentSceneIndex() { return currentSceneIndex },
    get totalScenes() { return CINEMATIC_SCENES.length },
    get isPlaying() { return isPlaying },
    get isPaused() { return isPaused },
    get progress() { return sceneProgress },

    setOnSceneChange(cb: typeof onSceneChange) { onSceneChange = cb },
    setOnProgress(cb: typeof onProgress) { onProgress = cb },
    setOnComplete(cb: typeof onComplete) { onComplete = cb },
    setOnAction(cb: typeof onAction) { onAction = cb },

    play() {
      if (isPlaying && !isPaused) return
      isPlaying = true
      isPaused = false
      sceneStartTime = performance.now()
      this._triggerSceneChange()
      this._startAnimationLoop()
    },

    pause() {
      isPaused = true
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    },

    resume() {
      if (!isPaused) return
      isPaused = false
      sceneStartTime = performance.now() - (sceneProgress * this.currentScene.duration)
      this._startAnimationLoop()
    },

    next() {
      if (currentSceneIndex < CINEMATIC_SCENES.length - 1) {
        currentSceneIndex++
        sceneProgress = 0
        sceneStartTime = performance.now()
        this._triggerSceneChange()
        if (isPlaying && !isPaused && !animationFrameId) {
          this._startAnimationLoop()
        }
      } else {
        this.stop()
        if (onComplete) onComplete()
      }
    },

    prev() {
      if (currentSceneIndex > 0) {
        currentSceneIndex--
        sceneProgress = 0
        sceneStartTime = performance.now()
        this._triggerSceneChange()
      }
    },

    goTo(index: number) {
      if (index >= 0 && index < CINEMATIC_SCENES.length) {
        currentSceneIndex = index
        sceneProgress = 0
        sceneStartTime = performance.now()
        this._triggerSceneChange()
      }
    },

    stop() {
      isPlaying = false
      isPaused = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    },

    reset() {
      this.stop()
      currentSceneIndex = 0
      sceneProgress = 0
      this._triggerSceneChange()
    },

    getTotalDuration() {
      return CINEMATIC_SCENES.reduce((sum, s) => sum + s.duration, 0)
    },

    getTotalProgress() {
      const elapsed = CINEMATIC_SCENES.slice(0, currentSceneIndex)
        .reduce((sum, s) => sum + s.duration, 0)
      const current = sceneProgress * this.currentScene.duration
      return (elapsed + current) / this.getTotalDuration()
    },

    _triggerSceneChange() {
      const scene = this.currentScene
      if (onSceneChange) {
        onSceneChange(scene, currentSceneIndex)
      }
      if (scene.action && onAction) {
        onAction(scene.action, scene)
      }
    },

    _startAnimationLoop() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      
      const animate = () => {
        if (!isPlaying || isPaused) {
          animationFrameId = null
          return
        }

        const now = performance.now()
        const elapsed = now - sceneStartTime
        const scene = this.currentScene
        
        sceneProgress = Math.min(elapsed / scene.duration, 1)
        
        if (onProgress) {
          onProgress(sceneProgress, this.getTotalProgress())
        }

        if (sceneProgress >= 1) {
          if (currentSceneIndex < CINEMATIC_SCENES.length - 1) {
            currentSceneIndex++
            sceneProgress = 0
            sceneStartTime = performance.now()
            this._triggerSceneChange()
            animationFrameId = requestAnimationFrame(animate)
          } else {
            this.stop()
            if (onComplete) onComplete()
          }
        } else {
          animationFrameId = requestAnimationFrame(animate)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    },
  }

  return controller
}
