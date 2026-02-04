<template>
  <div class="links">
    <!-- 加载状态：全局统一 -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 页面基础数据错误状态 -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center mt-2" role="alert">
      <i class="bi bi-exclamation-circle-fill fs-3 me-2"></i>
      <p class="mb-0 flex-grow-1">{{ errorMsg }}</p>
    </div>

    <!-- 友链页面专属布局：Markdown介绍 + 友链列表 -->
    <div v-else class="card shadow-sm border-0 rounded-3 mt-2">
      <!-- 页面标题：复用独立页article-title样式，保留卡片外的居中标题 -->
      <header class="article-header mt-3 mb-2">
        <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title || '友链页面' }}</h1>
      </header>
      <!-- 核心内容区：Markdown + 友链列表（卡片内边距适配） -->
      <div class="card-body pb-2">
        <!-- Markdown友链介绍（从/api/pages/one?key=links获取，样式类匹配独立页） -->
        <div class="article-content text-secondary mb-5">
          <i-markdown :model-value="pageInfo.content || '暂无友链介绍，敬请期待～'" />
        </div>

        <!-- 友链列表：加载/错误/空数据/正常状态 -->
        <div v-if="linkLoading && page === 1" class="d-flex justify-content-center py-3">
          <div class="spinner-border text-info spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="linkError" class="alert alert-warning d-flex align-items-center mt-2 p-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
          <p class="mb-0">{{ linkErrorMsg }}</p>
        </div>
        <div v-else-if="linkList.length === 0 && !linkLoading" class="text-center py-5 text-muted">
          <i class="bi bi-link-45deg fs-1 mb-3"></i>
          <p class="mb-0">暂无友链数据，敬请期待～</p>
        </div>
        <!-- 友链分组卡片布局 -->
        <div v-else class="link-list-container">
          <div v-for="(groupLinks, groupName) in groupLinkMap" :key="groupName" class="mb-6">
            <h3 class="link-cate mb-4">{{ groupName }}</h3>
            <!-- 核心修改：row g-4 配合 col-lg-3 col-md-3 col-sm-6 col-6，PC端固定4列 -->
            <div class="row g-4">
              <!-- 布局类核心：col-lg-3（大屏4列）col-md-3（中屏4列）col-sm-6（平板2列）col-6（手机2列） -->
              <div v-for="link in groupLinks" :key="link.id" class="col-lg-3 col-md-3 col-sm-6 col-6">
                <div class="link-card h-100 d-flex flex-column align-items-center p-3">
                  <img :src="link.avatar" :alt="link.nickname" class="link-avatar rounded-circle mb-2">
                  <h4 class="link-name fs-6 mb-1 text-center">{{ link.nickname }}</h4>
                  <p class="link-desc text-xs text-secondary text-center mb-2 flex-grow-1">{{ link.description || '无介绍' }}</p>
                  <a :href="link.url" :target="link.target || '_blank'" class="btn btn-outline-primary btn-xs">
                    访问
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多按钮：加载中/无更多/可点击 -->
          <div class="text-center mt-4 py-2">
            <button 
              v-if="!noMore && !linkLoading"
              @click="loadMore"
              class="btn btn-outline-secondary btn-sm"
            >
              <i class="bi bi-arrow-down me-1"></i> 加载更多
            </button>
            <button 
              v-else-if="linkLoading && page > 1"
              class="btn btn-outline-secondary btn-sm disabled"
              disabled
            >
              <span class="spinner-border spinner-border-xs me-1"></span> 加载中...
            </button>
            <p v-else class="text-muted text-sm mb-0">已加载全部友链</p>
          </div>
        </div>
      </div>
      <!-- 底部：页面更新时间 + 友链总数 -->
      <div class="card-footer border-top d-flex justify-content-between text-muted px-4 py-2">
        <small>页面最后更新：{{ formatTime(pageInfo.last_update) }}</small>
        <small>友链共 {{ linkTotal }} 条</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 环境变量网站标题
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'
// 固定key=links，强制指定加载该key的内容
const PAGE_KEY = 'links'

// 🔴 页面基础状态（独立页/links通用）
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({
  title: '友链', // 本地兜底标题，防止接口返回空
  content: ''
})
const pageTitle = ref(`友链 - ${SITE_TITLE}`)

// 🔴 友链专属状态 - 新增分页相关参数（适配接口默认limit=5）
const linkLoading = ref(false)
const linkError = ref(false)
const linkErrorMsg = ref('')
const linkList = ref([]) // 存储所有加载的友链数据
const linkTotal = ref(0) // 友链总条数
const page = ref(1)      // 当前页码
const limit = ref(5)     // 每页条数（和接口默认一致）
const noMore = ref(false)// 是否无更多数据

// 友链按分组聚合（适配接口group信息）
const groupLinkMap = computed(() => {
  const map = {}
  linkList.value.forEach(link => {
    const groupName = link.result?.group?.name || '未分组'
    if (!map[groupName]) map[groupName] = []
    map[groupName].push(link)
  })
  return map
})

// 时间格式化（全局统一，兼容空时间戳）
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0 || isNaN(timestamp)) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 🔴 获取友链页基础数据（强制传key=links，精准加载）
const getPageData = async () => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    // 强制拼接参数，确保接口能收到key=links
    const res = await request.get(`/api/pages/one?key=${PAGE_KEY}`, {
      params: {
        key: PAGE_KEY,
        cache: false,
        withTrashed: false
      }
    })
    // 严格校验响应数据：必须有code=200且data是对象且有值
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data } // 合并兜底数据和接口数据
      pageTitle.value = `${res.data.title || '友链'} - ${SITE_TITLE}`
      document.title = pageTitle.value // 立即更新页面标题
    } else {
      error.value = true
      errorMsg.value = '未找到key=links的友链页面配置，请联系管理员检查后台'
      console.warn('接口返回空数据：', res)
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，无法加载友链页面配置 | 请检查/api/pages/one接口'
    console.error('[友链页面基础数据异常]：', err)
  } finally {
    loading.value = false
  }
}

// 🔴 获取友链列表数据 - 改造为分页加载（支持追加数据，适配接口所有参数）
const getLinkData = async (isLoadMore = false) => {
  if (error.value || noMore.value) return // 基础数据错误/无更多，直接返回
  linkLoading.value = true
  linkError.value = false
  linkErrorMsg.value = ''
  try {
    const res = await request.get('/api/links/all', {
      params: {
        page: page.value,
        limit: limit.value,
        order: 'create_time desc',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data) {
      const { data, count } = res.data
      linkTotal.value = count || 0 // 赋值总条数
      // 加载更多：追加数据；首次加载：覆盖数据
      if (isLoadMore) {
        linkList.value = [...linkList.value, ...data]
      } else {
        linkList.value = data || []
      }
      // 判断是否无更多数据（当前加载的条数 >= 总条数）
      noMore.value = linkList.value.length >= linkTotal.value
    } else {
      linkError.value = true
      linkErrorMsg.value = res?.msg || '获取友链列表失败，接口返回异常'
    }
  } catch (err) {
    linkError.value = true
    linkErrorMsg.value = '网络异常，友链列表加载失败 | 请检查/api/links/all接口'
    console.error('[友链列表接口异常]：', err)
  } finally {
    linkLoading.value = false
  }
}

// 🔴 加载更多方法：页码+1，调用接口追加数据
const loadMore = () => {
  page.value++
  getLinkData(true) // 传true标识为加载更多，追加数据
}

// 页面初始化：先加载基础配置，再加载第一页友链
onMounted(async () => {
  await getPageData()
  await getLinkData() // 首次加载，不传参=覆盖数据
})
</script>

<style scoped>
/* 页面标题样式：和独立页保持一致 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}
/* 友链介绍Markdown样式：复用独立页article-content样式（核心！） */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
  padding: 0.5rem 0;
}
/* 友链分组标题 - 适配小卡片，适当缩小 */
.link-cate {
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 1rem !important;
}
/* 友链卡片样式 - 小卡片尺寸保留，适配4列布局 */
.link-card {
  border: 1px solid #e9ecef;
  border-radius: 0.6rem;
  transition: all 0.3s ease;
  min-height: 180px; /* 固定最小高度，4列对齐更美观 */
}
.link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #dee2e6;
  transform: translateY(-2px);
}
/* 友链头像：小尺寸保留，适配4列 */
.link-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid #f8f9fa;
}
/* 友链名称/描述 - 小字体保留 */
.link-name {
  font-weight: 500;
  line-height: 1.2;
}
.link-desc {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}
/* 自定义超小按钮：适配小卡片 */
.btn-xs {
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

/* 通用Markdown样式：适配article-content类 */
.article-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}
.article-content a {
  color: #0d6efd;
  text-decoration: none;
}
.article-content a:hover {
  color: #0a58ca;
  text-decoration: underline;
}
.article-content p {
  margin-bottom: 1rem;
}

/* 加载状态 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 响应式适配 - 配合4列布局，移动端自动调整为2列，平板可选3列 */
@media (max-width: 992px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content h2 {
    font-size: 1.25rem;
  }
  .link-cate {
    font-size: 1.1rem;
  }
  .link-avatar {
    width: 36px;
    height: 36px;
  }
  .link-card {
    min-height: 160px;
  }
}
@media (max-width: 768px) {
  .link-cate {
    font-size: 1rem;
  }
  .link-avatar {
    width: 34px;
    height: 34px;
  }
  .link-card {
    min-height: 150px;
    padding: 1.5rem !important;
  }
  /* 平板端可选3列（如需保留2列可删除此段） */
  .link-list-container .row > div {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}
@media (max-width: 576px) {
  .link-avatar {
    width: 32px;
    height: 32px;
  }
  .link-card {
    min-height: 140px;
    padding: 1.2rem !important;
  }
  /* 手机端强制2列，保证操作体验 */
  .link-list-container .row > div {
    flex: 0 0 50%;
    max-width: 50%;
  }
  .card-body {
    padding: 1.5rem !important;
  }
  .link-cate {
    font-size: 0.95rem;
  }
}
</style>