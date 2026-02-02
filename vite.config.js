import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 可选：如果需要区分环境变量，可引入dotenv
// import dotenv from 'dotenv'

// 加载环境变量（可选）
// const env = dotenv.config({ path: `.env.${mode}` }).parsed

export default defineConfig(({ mode }) => {
  // 判断当前环境（开发/生产）
  const isProduction = mode === 'production'

  return {
    // 插件配置
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 移除模板中的空白字符（优化渲染性能）
            preserveWhitespace: false
          }
        }
      })
    ],

    // 构建配置（生产环境优化）
    build: {
      // 目标浏览器兼容（ES2020 适配现代浏览器）
      target: 'es2020',
      // 输出目录
      outDir: 'dist',
      // 静态资源目录
      assetsDir: 'static',
      // 禁用缓存（避免旧缓存影响构建）
      cacheDir: false,
      // 压缩配置（仅生产环境启用）
      minify: isProduction ? 'terser' : 'esbuild',
      // Rollup 打包配置
      rollupOptions: {
        output: {
          // 拆分代码块（单独打包vue核心库，优化缓存）
          manualChunks: {
            vue: ['vue'],
            // 可选：拆分其他第三方库
            // axios: ['axios'],
            // elementPlus: ['element-plus']
          },
          // 静态资源命名规则（避免缓存问题）
          assetFileNames: 'static/[name].[hash:8].[ext]',
          chunkFileNames: 'static/js/[name].[hash:8].js',
          entryFileNames: 'static/js/[name].[hash:8].js'
        }
      },
      // Terser 压缩配置（仅生产环境生效）
      terserOptions: {
        compress: {
          // 生产环境移除console
          drop_console: isProduction,
          // 生产环境移除debugger
          drop_debugger: isProduction,
          // 可选：移除指定无副作用的函数
          // pure_funcs: ['console.log', 'console.warn']
        }
      },
      // 可选：启用报告分析打包体积
      // reportCompressedSize: true,
      // emptyOutDir: true // 构建前清空outDir
    },

    // 路径解析配置
    resolve: {
      // 扩展名（导入时可省略）
      extensions: ['.vue', '.js', '.jsx', '.ts', '.tsx'],
      // 别名配置
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 强制使用vue的esm-bundler版本（适配Vite）
        'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
        // 可选：添加更多别名
        // '@/api': path.resolve(__dirname, 'src/api'),
        // '@/components': path.resolve(__dirname, 'src/components')
      }
    },

    // 基础路径（适配不同部署环境）
    base: isProduction ? './' : '/',

    // 开发服务器配置
    server: {
      // 端口
      port: 3000,
      // 自动打开浏览器
      open: true,
      // 允许跨域
      cors: true,
      // 代理配置（解决开发环境跨域）
      proxy: {
        '/api': {
          target: 'https://cs.zhuxu.asia', // 后端接口地址
          changeOrigin: true, // 开启跨域
          // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端无/api前缀，需要重写
        },
        // 可选：添加更多代理
        // '/upload': {
        //   target: 'https://upload.zhuxu.asia',
        //   changeOrigin: true
        // }
      }
    },

    // 优化依赖预构建
    optimizeDeps: {
      // 预构建指定依赖
      include: ['vue'],
      // 排除不需要预构建的依赖
      // exclude: []
    }
  }
})