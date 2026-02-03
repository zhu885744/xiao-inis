<template>
  <div>
    <!-- 加载状态：和首页/文章详情页样式统一 -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误/空数据状态：Bootstrap原生alert，统一项目提示风格 -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center mt-2" role="alert">
      <i class="bi bi-exclamation-circle-fill fs-3 me-2"></i>
      <p class="mb-0 flex-grow-1">{{ errorMsg }}</p>
    </div>

    <!-- 独立页面主体：Bootstrap卡片布局，和项目其他页面统一 -->
    <div v-else class="card shadow-sm border-0 rounded-3 mt-2">
      <!-- 页面标题栏：适配Bootstrap，和测试页的header样式呼应 -->
      <div class="card-header border-0 pb-3 py-3">
        <h1 class="card-title fs-2 mb-0">{{ pageInfo.title }}</h1>
      </div>
      <!-- 页面内容：复用i-markdown渲染Markdown，沿用文章详情页的样式适配 -->
      <div class="card-body">
        <div class="article-content text-secondary lead">
          <i-markdown :model-value="pageInfo.content || '暂无页面内容'" />
        </div>
      </div>
      <!-- 页面底部：可选添加更新时间，提升实用性 -->
      <div class="card-footer border-top d-flex justify-content-end text-muted">
        <small>最后更新：{{ formatTime(pageInfo.last_update) }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue' // 🌟 新增：引入watch
import { useRouter } from 'vue-router'
// 复用项目封装的请求工具
import request from '@/utils/request'
// 复用封装的Markdown渲染组件（路径和文章详情页一致）
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 🌟 新增：获取环境变量中的网站标题，加兜底值，和文章详情页保持一致
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 🌟 核心：接收路由props传递的key（路由/:key开启了props: true）
// 独立页面路由是/:key，所以props接收的参数是key（如about/links等）
const props = defineProps({
  key: {
    type: String,
    required: true, // 路由传参必传，路由守卫已排除已定义路由
    validator: (val) => val.trim() !== '', // 校验非空字符串
  }
})

// 响应式状态：加载/错误/页面数据（和项目其他页面统一命名）
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({}) // 存储接口返回的页面数据
// 🌟 新增：定义响应式页面标题，初始为加载中状态+环境变量后缀
const pageTitle = ref(`加载中... - ${SITE_TITLE}`)

// 路由实例：仅用于错误时返回上一页
const router = useRouter()

// 🌟 新增：监听页面标题变化，实时更新浏览器标签页，立即执行初始赋值
watch(
  pageTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)

/**
 * 时间格式化：复用项目通用方法，保证全站时间格式统一
 * 处理接口返回的秒级时间戳
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 获取独立页面数据：适配/api/pages/one接口，Query传参key
 * 接口优先用key查询（符合独立页面/xxx的使用场景）
 */
const getPageData = async () => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    // 构造接口请求参数：严格按API文档，给key加非空兜底避免trim()报错
    const queryParams = {
      key: (props.key || '').trim(), // 核心修复：undefined兜底为空字符串
      cache: false,
      withTrashed: false
    }
    // 调用独立页面接口：GET /api/pages/one
    const res = await request.get('/api/pages/one', queryParams)

    if (res.code === 200) {
      // 接口成功但无数据（key不存在/页面被删除/key为空）
      if (!res.data || Object.keys(res.data).length === 0) {
        error.value = true
        errorMsg.value = '未找到该独立页面，可能已被删除或访问地址错误'
        pageTitle.value = `页面不存在 - ${SITE_TITLE}` // 🌟 新增：错误状态标题
      } else {
        pageInfo.value = res.data
        // 🌟 新增：接口成功，设置为「页面标题 - 站点标题」
        pageTitle.value = `${pageInfo.value.title} - ${SITE_TITLE}`
      }
    } else {
      // 接口返回非200错误
      error.value = true
      errorMsg.value = res.msg || '获取独立页面数据失败'
      pageTitle.value = `获取页面失败 - ${SITE_TITLE}` // 🌟 新增：接口错误标题
    }
  } catch (err) {
    // 网络异常/接口报错
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    console.error('[独立页面接口异常]：', err)
    pageTitle.value = `网络异常 - ${SITE_TITLE}` // 🌟 新增：网络异常标题
  } finally {
    loading.value = false
  }
}

// 页面挂载时请求数据：仅执行一次
onMounted(() => {
  getPageData()
})
</script>

<style scoped>
/* 页面内容样式：复用文章详情页的Markdown适配样式，保证全站统一 */
.page-content {
  line-height: 1.8;
  font-size: 1.05rem;
  padding: 0.5rem 0;
}

/* Markdown渲染内容适配：和文章详情页完全一致，保证样式统一 */
.page-content h1,
.page-content h2,
.page-content h3,
.page-content h4 {
  margin: 1.5rem 0 1rem;
  font-weight: 600;
}
.page-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}
.page-content p {
  margin-bottom: 1rem;
}
.page-content ul,
.page-content ol {
  margin-left: 2rem;
  margin-bottom: 1rem;
}
.page-content a {
  color: #0d6efd;
  text-decoration: underline;
}
.page-content a:hover {
  color: #0a58ca;
}
.page-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 1rem 0;
  display: block;
  margin-left: auto;
  margin-right: auto; /* 图片居中，提升独立页面视觉效果 */
}

/* 加载状态垂直居中：和项目其他页面统一 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 移动端适配：和文章详情页统一规则 */
@media (max-width: 768px) {
  .fs-2 {
    font-size: 1.5rem !important;
  }
  .page-content h2 {
    font-size: 1.25rem;
  }
}
</style>