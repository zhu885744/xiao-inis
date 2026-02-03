<template>
  <div class="container my-3">
    <!-- 加载状态：全局统一 -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态：全局统一 -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center mt-2" role="alert">
      <i class="bi bi-exclamation-circle-fill fs-3 me-2"></i>
      <p class="mb-0 flex-grow-1">{{ errorMsg }}</p>
    </div>

    <!-- 🌟 按key判断：友链页面（key=links）专属布局 -->
    <div v-else-if="props.key === 'links'" class="card shadow-sm border-0 rounded-3 mt-2">
      <!-- 友链页面标题 -->
      <div class="card-header border-0 pb-3 bg-white py-3">
        <h1 class="card-title fs-2 mb-0">{{ pageInfo.title }}</h1>
      </div>
      <!-- 友链内容区：专属样式，适配友链卡片布局 -->
      <div class="card-body p-4">
        <div class="links-content text-secondary">
          <i-markdown :model-value="pageInfo.content || '暂无友链内容，敬请期待～'" />
        </div>
      </div>
      <!-- 友链页底部更新时间 -->
      <div class="card-footer bg-white border-top d-flex justify-content-end text-muted">
        <small>最后更新：{{ formatTime(pageInfo.last_update) }}</small>
      </div>
    </div>

    <!-- 🌟 通用独立页面（如about/xxx）原有布局 -->
    <div v-else class="card shadow-sm border-0 rounded-3 mt-2">
      <div class="card-header border-0 pb-3 bg-white py-3">
        <h1 class="card-title fs-2 mb-0">{{ pageInfo.title }}</h1>
      </div>
      <div class="card-body">
        <div class="page-content text-secondary lead">
          <i-markdown :model-value="pageInfo.content || '暂无页面内容'" />
        </div>
      </div>
      <div class="card-footer bg-white border-top d-flex justify-content-end text-muted">
        <small>最后更新：{{ formatTime(pageInfo.last_update) }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 接收路由props的key（后台配置的唯一键：如about/links）
const props = defineProps({
  key: {
    type: String,
    required: false,
    default: '',
  }
})

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({})
const router = useRouter()

// 时间格式化（全局统一）
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取页面数据（通用接口逻辑，适配所有key）
const getPageData = async () => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    const queryParams = {
      key: (props.key || '').trim(), // 非空兜底，避免trim报错
      cache: false,
      withTrashed: false
    }
    const res = await request.get('/api/pages/one', queryParams)
    if (res.code === 200) {
      if (!res.data || Object.keys(res.data).length === 0) {
        error.value = true
        errorMsg.value = '未找到该独立页面，可能已被删除或访问地址错误'
      } else {
        pageInfo.value = res.data
      }
    } else {
      error.value = true
      errorMsg.value = res.msg || '获取独立页面数据失败'
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    console.error('[独立页面接口异常]：', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getPageData()
})
</script>

<style scoped>
/* 通用页面内容样式（about等） */
.page-content {
  line-height: 1.8;
  font-size: 1.05rem;
  padding: 0.5rem 0;
}

/* 🌟 友链页面专属样式：适配友链卡片布局，间距/行高更友好 */
.links-content {
  line-height: 1.6;
  font-size: 1rem;
  padding: 0;
}
/* 友链内的卡片/盒子通用样式（后台写HTML/Markdown时直接用） */
.links-content .link-card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}
.links-content .link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #dee2e6;
  transform: translateY(-2px);
}
/* 友链分类标题 */
.links-content .link-cate {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

/* 通用Markdown样式（全局已做图片100%，这里补全文字/链接） */
.page-content h2, .links-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}
.page-content a, .links-content a {
  color: #0d6efd;
  text-decoration: none;
}
.page-content a:hover, .links-content a:hover {
  color: #0a58ca;
  text-decoration: underline;
}
.page-content p, .links-content p {
  margin-bottom: 1rem;
}

/* 加载状态 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fs-2 {
    font-size: 1.5rem !important;
  }
  .page-content h2, .links-content h2 {
    font-size: 1.25rem;
  }
  .links-content .link-card {
    padding: 0.8rem;
  }
}
</style>