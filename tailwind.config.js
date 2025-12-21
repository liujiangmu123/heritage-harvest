/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === 『码』上寻踪 国潮色系 ===
        // 故宫红 - 主色调，象征中华文化的庄重与热烈
        palace: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#c45a54',
          500: '#A73A36',  // 主色
          600: '#8B2E2A',
          700: '#6F2421',
          800: '#531A18',
          900: '#3D1312',
        },
        // 宣纸白 - 背景色
        paper: {
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#FDFDFD',
          300: '#FAFAFA',
          400: '#F9F9F9',
          500: '#F7F7F7',  // 主色
          600: '#E8E8E8',
          700: '#D4D4D4',
          800: '#A3A3A3',
          900: '#737373',
        },
        // 远山黛 - 辅助深色
        mountain: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#737373',
          500: '#4A4A4A',  // 主色
          600: '#3D3D3D',
          700: '#2E2E2E',
          800: '#1F1F1F',
          900: '#141414',
        },
        // 缃叶黄 - 点缀色，活力与希望
        gold: {
          50: '#FFFEF5',
          100: '#FFFDE8',
          200: '#FFF9C4',
          300: '#FFF59D',
          400: '#F5E87A',
          500: '#F2D974',  // 主色
          600: '#E6C84D',
          700: '#D4B52E',
          800: '#B89B1F',
          900: '#8B7516',
        },
        // 品牌主色 - 传统中国色彩（保留兼容）
        primary: {
          50: '#fdf8f3',
          100: '#faeee0',
          200: '#f4d9bd',
          300: '#ecbe8f',
          400: '#e29a5b',
          500: '#d97d39',
          600: '#cb642e',
          700: '#a94d28',
          800: '#873f27',
          900: '#6d3522',
        },
        // === 故宫红 - 非遗文化底蕴主色 ===
        // 代表中华传统文化的厚重与典雅
        heritage: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#c41e3a',  // 故宫红主色
          600: '#a91b32',
          700: '#8b1429',
          800: '#6d1020',
          900: '#4a0b16',
          950: '#2d0a0e',
        },
        // 自然绿色
        nature: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // === 乡遗识 生态绿色主题 ===
        // 生态绿 - 绿色共享主色调
        eco: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // 主色 - 生态绿
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',  // 深色背景
        },
        // 碳中和灰蓝 - 碳账户主题色
        carbon: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // 主色
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // 竹青色 - 藤编/竹编主题
        bamboo: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',  // 深色背景
        },
        // 梯田蓝绿 - 哈尼梯田主题
        terrace: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // 泥土棕 - 泥塑/陶艺主题
        clay: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        // 墨色
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b9c8',
          400: '#8794a9',
          500: '#68768e',
          600: '#535f75',
          700: '#444d5f',
          800: '#3b4251',
          900: '#2d323c',
          950: '#1a1d24',
        },
        // 边框颜色
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        display: ['ZCOOL XiaoWei', 'serif'],
        heritage: ['Ma Shan Zheng', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'heritage': '0 4px 60px rgba(196, 30, 58, 0.3)',  // 故宫红阴影
        'heritage-hover': '0 8px 80px rgba(196, 30, 58, 0.4)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'eco': '0 4px 60px rgba(34, 197, 94, 0.2)',
        'eco-hover': '0 8px 80px rgba(34, 197, 94, 0.3)',
        'carbon': '0 4px 40px rgba(100, 116, 139, 0.2)',
        'heritage-eco': '0 4px 60px rgba(196, 30, 58, 0.2), 0 4px 60px rgba(34, 197, 94, 0.2)',  // 红绿融合阴影
      },
      // === 故宫红+生态绿 融合渐变 ===
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'heritage-pattern': "url('/patterns/heritage-pattern.svg')",
        'paper-texture': "url('/textures/paper.png')",
        // 红绿融合渐变（通过金色过渡，避免圣诞配色）
        'heritage-eco-gradient': 'linear-gradient(135deg, #c41e3a 0%, #d4a574 50%, #22c55e 100%)',
        'heritage-eco-gradient-soft': 'linear-gradient(135deg, rgba(196, 30, 58, 0.8) 0%, rgba(212, 165, 116, 0.6) 50%, rgba(34, 197, 94, 0.8) 100%)',
        'heritage-eco-gradient-horizontal': 'linear-gradient(90deg, #c41e3a 0%, #d4a574 50%, #22c55e 100%)',
        // 生态主题渐变
        'eco-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'eco-gradient-soft': 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)',
        'eco-gradient-vertical': 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
        // 非遗主题渐变
        'heritage-gradient': 'linear-gradient(135deg, #c41e3a 0%, #a91b32 100%)',
        'heritage-gradient-soft': 'linear-gradient(135deg, rgba(196, 30, 58, 0.8) 0%, rgba(169, 27, 50, 0.8) 100%)',
        // 碳中和渐变
        'carbon-gradient': 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      },
    },
  },
  plugins: [],
}
