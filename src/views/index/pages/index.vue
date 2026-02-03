<template>
  <!-- 公告卡片 - 保留，适配3列布局整体风格 -->
  <div class="card article-announce-card mt-2 mb-3 shadow-sm">
    <div class="card-body d-flex align-items-center py-2 px-3">
      <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
      <span class="fw-medium fs-7">新系统启用公告<a href="https://blog.zhuxu.asia/archives/182/" class="text-decoration-none">[点击查看]</a></span>
      <span class="ms-auto text-muted x-small">2026-2-2</span>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading && articleList.length === 0" class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="articleList.length === 0 && !loading" class="alert alert-light text-center py-4 mt-2">
    <i class="bi bi-file-earmark-text fs-4 mb-2"></i>
    <p class="mb-0 text-muted fs-7">暂无文章数据</p>
  </div>

  <!-- 文章列表 - 核心改：PC端固定3列Grid -->
  <div v-else class="article-list-container mt-2 grid-article-list">
    <div 
      class="card article-item-card shadow-sm hover-shadow"
      v-for="article in articleList" 
      :key="article.id"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <div class="card-body p-0 d-flex flex-column h-100">
        <!-- 文章封面 - 核心改：优先用自身covers，无则调用随机图API -->
        <div class="article-cover flex-shrink-0">
          <img 
            :src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover"
            loading="lazy"
          >
        </div>
        <!-- 内容区 - 微调内边距，适配3列卡片 -->
        <div class="article-content p-2 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 - 保留原有样式 -->
          <h3 class="article-title fw-bold mb-1 m-0">{{ article.title }}</h3>

          <!-- 文章摘要 - 缩小与元信息的间距 -->
          <p class="article-desc text-truncate-1 mt-auto mb-1">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 元信息左右分组布局 - 保留已有优化 -->
          <div class="article-meta d-flex align-items-center w-100 m-0">
            <div class="meta-left d-flex align-items-center gap-0.5">
              <span class="meta-item"><i class="bi bi-folder-fill"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
            </div>
            <div class="meta-right d-flex align-items-center gap-0.5 ms-auto">
              <span class="meta-item"><i class="bi bi-calendar-fill"></i>{{ formatTime(article.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载更多 - 保留原有样式，适配3列布局间距 -->
  <div class="d-flex justify-content-center mt-4 mb-5">
    <button 
      v-if="loading && articleList.length > 0" 
      class="btn btn-info btn-sm disabled"
      disabled
    >
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      加载中...
    </button>
    <button 
      v-else-if="hasMore" 
      class="btn btn-primary btn-sm"
      @click="loadMore"
    >
      加载更多
    </button>
    <button 
      v-else 
      class="btn btn-outline-secondary btn-sm disabled"
      disabled
    >
      已加载全部
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' 
const router = useRouter()

// 所有JS逻辑完全保留，仅调整limit为6（3列*2行，加载更多更适配3列）
const articleList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(6) // 3列布局推荐每页6条，视觉更整齐
const total = ref(0)
const order = ref('create_time desc')

const hasMore = computed(() => {
  return articleList.value.length < total.value
})

// 时间格式化 - 保留原有逻辑
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 🔥 核心新增：封装封面图获取方法，优先用自身covers，无则调用随机图API
const getCoverImg = (article) => {
  // 判断covers是否有效（非空字符串、非null、非undefined）
  if (article.covers && article.covers.trim() !== '') {
    return article.covers
  }
  // 无封面则拼接随机图API，参数：300x200（3:2比例）、fit等比缩放、文章id+随机数避免重复
  const randomNum = Math.floor(Math.random() * 1000000) // 随机数
  const apiParams = new URLSearchParams({
    id: `${article.id}-${randomNum}`, // 文章id+随机数，双重避免重复
    size: '300x200', // 匹配卡片3:2比例，防止图片变形
    mode: 'fit', // 等比例缩放，默认值也显式写，保证一致性
    redirect: false // 非重定向，直接返回图片地址
  })
  return `/api/file/rand?${apiParams.toString()}`
}

// 获取文章列表 - 保留原有逻辑
const getArticleList = async (page = 1, isLoadMore = false) => {
  loading.value = true
  try {
    const params = { page, limit: limit.value, order: order.value }
    const res = await request.get('/api/article/all', params)
    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      articleList.value = isLoadMore ? [...articleList.value, ...newData] : newData
      total.value = totalCount
      currentPage.value = page
    } else {
      console.error('获取文章列表失败：', res.msg)
      !isLoadMore && (articleList.value = [])
    }
  } catch (error) {
    console.error('获取文章列表接口异常：', error)
    !isLoadMore && (articleList.value = [])
  } finally {
    loading.value = false
  }
}

// 跳转到文章详情 - 保留原有逻辑
const toArticleDetail = (id) => {
  router.push(`/archives/${id}`) 
}

// 加载更多 - 保留原有逻辑
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  getArticleList(currentPage.value + 1, true)
}

// 页面挂载 - 保留原有逻辑
onMounted(() => {
  getArticleList(1, false)
})
</script>

<style scoped>
/* 公告卡片基础样式 */
.article-announce-card {
  border-left: 4px solid #0dcaf0;
  border-radius: 0.375rem;
  max-width: 1200px; /* 与文章列表容器同宽，视觉对齐 */
  margin: 0.5rem auto 1rem;
}
.fs-7 {
  font-size: 0.8rem;
}
.x-small {
  font-size: 0.75rem;
}

/* 🔥 核心修改：PC端固定3列Grid，居中容器+最大宽度限制 */
.grid-article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 强制3列，一行仅显3个 */
  gap: 1rem; /* 3列布局适配的间距，视觉更平衡 */
  max-width: 1200px; /* 限制最大宽度，大屏不拉伸 */
  margin: 0 auto; /* 容器居中，3列更美观 */
}

/* 文章卡片 - 保留原有优化，微调基础尺寸 */
.article-item-card {
  height: 100%; /* Grid等高，避免错落 */
  border: 1px solid #f5f7fa;
  border-radius: 0.5rem;
  transition: all 0.25s ease;
  overflow: hidden;
  min-width: 200px; /* 最小宽度，防止3列下卡片过窄 */
}
/* hover动效 - 保留柔和阴影，不夸张 */
.hover-shadow:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-3px);
  border-color: transparent;
}

/* 封面 - 保留3:2比例，圆角适配卡片 */
.article-cover {
  width: 100%;
  padding-top: 66.67%; /* 3:2黄金比例，图片不变形 */
  position: relative;
}
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

/* 内容区 - 弹性布局，元信息贴底 */
.article-content {
  height: 100%;
}

/* 标题 - 微调字号，适配3列小卡片 */
.article-title {
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  line-height: 1.4;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 摘要 - 保留精简样式 */
.article-desc {
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}
.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 元信息 - 保留已有分组优化，微调字号更清晰 */
.article-meta {
  font-size: 0.7rem;
  color: #868e96;
  line-height: 1.2;
}
.meta-left, .meta-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
/* 移除单元素的冗余竖线样式（因现在元信息左右都只有1个项） */
.meta-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding-left: 0 !important; /* 单元素无需左内边距 */
}
/* 元信息图标 - 优化间距，更协调 */
.meta-item .bi {
  font-size: 0.9em;
  margin-right: 0.2rem;
  line-height: 1;
  vertical-align: middle;
  color: #9ca3af;
}

/* 🔥 响应式核心：不同屏幕适配列数，避免拥挤 */
/* 平板端（768px以下）：改为2列，适配平板宽度 */
@media (max-width: 768px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    padding: 0 0.5rem;
  }
  .article-item-card {
    min-width: 160px;
  }
  .article-content {
    padding: 1.5px;
  }
}

/* 手机端（576px以下）：改为1列，全屏显示，阅读更舒适 */
@media (max-width: 576px) {
  .grid-article-list {
    grid-template-columns: 1fr; /* 单列 */
    gap: 0.6rem;
    padding: 0 0.8rem;
  }
  .article-item-card {
    min-width: unset;
  }
  .hover-shadow:hover {
    transform: translateY(-1px); /* 移动端hover动效更轻微 */
  }
  .article-title {
    font-size: 1rem;
  }
  .article-meta {
    font-size: 0.75rem;
  }
}

/* 超大屏（1400px以上）：微调间距，避免卡片过宽 */
@media (min-width: 1400px) {
  .grid-article-list {
    max-width: 1300px;
    gap: 1.2rem;
  }
}
</style>