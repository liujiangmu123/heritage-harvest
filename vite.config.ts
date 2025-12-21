import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/heritage-harvest/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js 相关库单独打包
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr'],
          // MediaPipe 相关库单独打包
          'mediapipe-vendor': ['@mediapipe/hands', '@mediapipe/face_mesh', '@mediapipe/pose', '@mediapipe/camera_utils', '@mediapipe/drawing_utils'],
          // UI 框架库
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // 状态管理和路由
          'core-vendor': ['react', 'react-dom', 'react-router-dom', 'zustand'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion'],
  },
})
