<template>
  <div class="sidebar-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 个人信息 -->
    <div class="card mt-2">
      <div class="card-header py-1">
        <h6 class="mb-0 fw-semibold">个人信息</h6>
      </div>
      <div class="card-body py-2">
        <div class="text-center mb-2">
          <img
            src="@/assets/img/avatar.png"
            alt="头像"
            class="rounded-circle border border-2 border-primary-subtle"
            width="70"
            height="70"
          >
          <div class="fw-bold mt-1 text-secondary">HI！请登录</div>
          <hr class="my-2">
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-primary px-3 py-0">登录</button>
            <button class="btn btn-outline-primary px-3 py-0">注册</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃度排行 -->
    <div class="card mt-2">
      <div class="card-header py-1">
        <h6 class="mb-0 fw-semibold">活跃度排行</h6>
      </div>
      <div class="card-body p-0">
        <!-- 加载中 -->
        <div v-if="activeLoading" class="text-center py-2">
          <div class="spinner-border text-primary" style="width: 0.7rem; height: 0.7rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else-if="activeRankList.length === 0" class="text-center py-2 text-muted fs-7">
          暂无活跃度数据
        </div>

        <!-- 活跃度排行列表 -->
        <div v-else class="list-group list-group-flush m-0">
          <div
            class="list-group-item d-flex align-items-center gap-2 p-1.5 border-0 rounded-2 mb-1 mx-2"
            v-for="(user, index) in activeRankList"
            :key="user.id"
            style="background-color: var(--bs-card-bg); cursor: pointer;"
            @click.prevent="goToAuthor(user.id)"
          >
            <!-- 头像容器 -->
            <div class="position-relative flex-shrink-0">
              <img
                :src="user.avatar || '@/assets/img/avatar.png'"
                alt="用户头像"
                class="rounded-circle border border-1 border-secondary-subtle"
                width="32"
                height="32"
                onerror="this.src='@/assets/img/avatar.png'"
              >
            </div>

            <!-- 核心信息区 -->
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center gap-1 mb-0 flex-wrap">
                <h6 class="mb-0 fw-semibold fs-6 " :class="{'text-light': isDarkMode}">
                  {{ user.nickname }}
                </h6>
                <span v-if="user.title" class="badge bg-primary-subtle text-primary fs-7 px-1 py-0" :class="{'bg-dark-subtle text-light': isDarkMode}">
                  {{ user.title }}
                </span>
              </div>
              <!-- 经验值 -->
              <p class="mb-0 text-primary fs-6">
                <i class="bi bi-star-fill me-1"></i>{{ user.exp }} 经验值
              </p>
            </div>

            <!-- 右侧辅助信息 -->
            <div class="text-end flex-shrink-0 text-muted fs-7">
              <p class="mb-0.5">{{ user.count }} 次互动</p>
              <p class="mb-0" v-if="user.result?.level?.current">
                Lv.{{ user.result.level.current.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门文章 -->
    <div class="card mt-2">
      <div class="card-header py-1">
        <h6 class="mb-0 fw-semibold">热门文章</h6>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-2">
          <div class="spinner-border text-primary" style="width: 0.7rem; height: 0.7rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="hotArticles.length === 0" class="text-center py-2 text-muted fs-7">暂无热门文章</div>
        <div v-else class="row g-1 p-1.5">
          <div class="col-12" v-for="(article, index) in hotArticles" :key="article.id">
            <div
              class="card h-100 border rounded-2 overflow-hidden shadow-sm hover:shadow transition"
              @click.prevent="goToArticle(article.id)"
              style="cursor: pointer;"
            >
              <div class="card-body p-1.5">
                <div class="d-flex align-items-center gap-1 mb-1">
                  <span
                    class="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    :class="[
                      index < 3 ? 'bg-primary ' : 'bg-light  border border-secondary-subtle',
                      isDarkMode && index >=3 ? 'bg-dark-subtle border-dark' : ''
                    ]"
                    style="width: 20px; height: 20px; font-size: 12px;"
                  >{{ index + 1 }}</span>
                  <h6 class="mb-0 fw-medium  text-truncate hover:text-primary transition fs-6"
                      style="max-width: calc(100% - 28px);"
                      :class="{'text-light': isDarkMode}"
                  >{{ article.title }}</h6>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted fs-7">
                  <span>{{ article.views }} 阅读</span>
                  <span v-if="article.createTime">{{ formatTime(article.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新评论 -->
    <div class="card mt-2">
      <div class="card-header py-1 d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-semibold">最新评论</h6>
      </div>
      <div class="card-body p-0">
        <!-- 加载中 -->
        <div v-if="commentLoading" class="text-center py-2">
          <div class="spinner-border text-primary" style="width: 0.8rem; height: 0.8rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <!-- 无数据 -->
        <div v-else-if="!commentList.length" class="text-center py-2 text-muted">
          <i class="bi bi-chat-dots fs-5 mb-1 d-block"></i>
          <p class="mb-0 fs-7">暂无评论内容</p>
        </div>
        <!-- 评论列表 -->
        <div v-else class="list-group list-group-flush">
          <div
            class="list-group-item border-0 p-1.5 bg-transparent"
            v-for="(comment, index) in commentList"
            :key="comment.id"
          >
            <div
              class="card h-100 border rounded-3 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              style="cursor: pointer; border-color: var(--bs-border-color) !important;"
              @click.prevent="goToArticle(comment.articleId)"
              :class="{'bg-dark-subtle/20': isDarkMode}"
            >
              <div class="card-body p-2">
                <!-- 评论头部：头像+作者+时间 -->
                <div class="d-flex align-items-center gap-1.5 mb-1">
                  <!-- 用户头像 -->
                  <img
                    :src="comment.avatar || '@/assets/img/avatar.png'"
                    alt="用户头像"
                    class="rounded-circle flex-shrink-0 border border-2 border-primary/10"
                    width="28"
                    height="28"
                    onerror="this.src='@/assets/img/avatar.png'"
                  >
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="mb-0 fw-semibold fs-6 " :class="{'text-light': isDarkMode}">
                        {{ comment.author }}
                      </h6>
                      <span class="text-muted fs-7">
                        {{ comment.time }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 评论内容 -->
                <div class="mb-1">
                  <p class=" mb-0 fs-6 lh-base"
                     :class="{'text-light': isDarkMode}"
                     style="white-space: pre-wrap; word-break: break-word; line-height: 1.4;"
                  >
                    {{ comment.content }}
                  </p>
                </div>

                <!-- 关联文章 -->
                <div class="mt-1 pt-1 border-top border-primary/10">
                  <a
                    href="#"
                    class="text-primary text-decoration-none fs-7 hover:text-primary/80 transition-colors"
                    @click.prevent="goToArticle(comment.articleId)"
                  >
                    <i class="bi bi-file-text-o me-1"></i>
                    《{{ comment.articleTitle || '未知文章' }}》
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签云 -->
    <div class="card mt-2">
      <div class="card-header py-1">
        <h6 class="mb-0 fw-semibold">标签云</h6>
      </div>
      <div class="card-body p-1.5">
        <!-- 标签云加载中 -->
        <div v-if="tagLoading" class="text-center py-1.5">
          <div class="spinner-border text-primary" style="width: 0.7rem; height: 0.7rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <!-- 无标签数据 -->
        <div v-else-if="!tagList.length" class="text-center py-1.5 text-muted fs-7">暂无标签</div>
        <!-- 标签云列表 -->
        <div v-else class="d-flex flex-wrap gap-1">
          <a
            href="#"
            class="badge bg-primary-subtle text-primary py-1 px-2 rounded-pill text-decoration-none transition fs-7"
            v-for="tag in tagList"
            :key="tag.id"
            :class="{
              'bg-dark-subtle text-light': isDarkMode,
              'hover:bg-primary hover:text-white': !isDarkMode,
              'hover:bg-primary text-white': isDarkMode
            }"
            @click.prevent="goToTag(tag.id, tag.name)"
          >{{ tag.name }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

// 响应式数据
const loading = ref(false);
const hotArticles = ref([]);
const tagList = ref([]);
const isDarkMode = ref(false);
// 评论相关
const commentList = ref([]);
const commentLoading = ref(false);
// 活跃度排行
const activeLoading = ref(false);
const activeRankList = ref([]);
// 标签云
const tagLoading = ref(false);

// 检测深色模式（增强版）
const detectDarkMode = () => {
  // 优先检测页面手动设置的dark类，其次检测系统深色模式
  const pageDark = document.documentElement.classList.contains('dark');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  isDarkMode.value = pageDark || systemDark;
  
  // 同步设置CSS变量
  if (isDarkMode.value) {
    document.documentElement.style.setProperty('--bs-card-bg', '#1f2937');
    document.documentElement.style.setProperty('--bs-border-color', '#374151');
    document.documentElement.style.setProperty('--bs-text-muted', '#9ca3af');
  } else {
    document.documentElement.style.setProperty('--bs-card-bg', '#fff');
    document.documentElement.style.setProperty('--bs-border-color', '#dee2e6');
    document.documentElement.style.setProperty('--bs-text-muted', '#6c757d');
  }
};

// 跳转方法
const goToArticle = (articleId) => router.push(`/archives/${articleId}`);
const goToAuthor = (authorId) => router.push(`/author/${authorId}`);
const goToTag = (tagId, tagName) => {
  router.push({
    path: '/tags/detail',
    query: { id: tagId, name: tagName }
  });
};

// 格式化时间（精简版）
const formatTime = (time) => {
  if (!time) return '';
  // 兼容秒级/毫秒级时间戳
  const timestamp = typeof time === 'number' && time.toString().length === 10 
    ? time * 1000 
    : time;
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) {
    const hourDiff = Math.floor(diff / (1000 * 60 * 60));
    if (hourDiff > 0) return `${hourDiff}小时前`;
    const minDiff = Math.floor(diff / (1000 * 60));
    return minDiff > 0 ? `${minDiff}分钟前` : '刚刚';
  } else if (dayDiff <= 7) return `${dayDiff}天前`;
  else return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// 接口请求 - 热门文章
const getHotArticles = async () => {
  try {
    loading.value = true;
    const response = await request.get('/api/article/all', { page: 1, limit: 5, order: 'views desc', cache: false });
    if (response.code === 200) {
      hotArticles.value = response.data.data;
    }
  } catch (error) {
    console.error('获取热门文章失败：', error);
    hotArticles.value = [];
  } finally {
    loading.value = false;
  }
};

// 接口请求 - 活跃度排行
const getActiveRank = async () => {
  try {
    activeLoading.value = true;
    const response = await request.get('/api/exp/active', { limit: 5, cache: false });
    if (response.code === 200) activeRankList.value = response.data;
  } catch (error) {
    console.error('获取活跃度排行失败：', error);
    activeRankList.value = [];
  } finally {
    activeLoading.value = false;
  }
};

// 接口请求 - 标签云
const getTagList = async () => {
  try {
    tagLoading.value = true;
    const response = await request.get('/api/tags/all', {
      page: 1,
      limit: 40,
      order: 'create_time desc',
      cache: false
    });
    if (response.code === 200) {
      tagList.value = response.data.data;
    }
  } catch (error) {
    console.error('获取标签云失败：', error);
    tagList.value = [];
  } finally {
    tagLoading.value = false;
  }
};

// 接口请求 - 最新评论
const getLatestComments = async () => {
  try {
    commentLoading.value = true;
    const response = await request.get('/api/comment/all', {
      page: 1,
      limit: 5,
      order: 'create_time desc',
      cache: false
    });

    if (response.code === 200) {
      commentList.value = response.data.data.map(item => ({
        id: item.id,
        avatar: item.result?.author?.avatar || '',
        author: item.result?.author?.nickname || '匿名用户',
        content: item.content || '',
        time: formatTime(item.create_time),
        articleId: item.bind_id,
        articleTitle: item.result?.article?.title || '未知文章'
      }));
    }
  } catch (error) {
    console.error('获取最新评论失败：', error);
    commentList.value = [];
  } finally {
    commentLoading.value = false;
  }
};

// 监听深色模式变化
watchEffect(() => {
  detectDarkMode();
  const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => detectDarkMode();
  darkModeMedia.addEventListener('change', handler);
  return () => darkModeMedia.removeEventListener('change', handler);
});

// 组件挂载时加载数据
onMounted(() => {
  detectDarkMode();
  // 并行请求优化
  Promise.all([
    getHotArticles(),
    getActiveRank(),
    getTagList(),
    getLatestComments()
  ]).catch(err => console.error('数据加载失败：', err));
});
</script>

<style scoped>
/* 基础样式重置 */
.sidebar-container {
  --bs-card-bg: #fff;
  --bs-border-color: #dee2e6;
  --bs-text-muted: #6c757d;
}

/* 字体大小层级（调大后的版本） */
.fs-7 { font-size: 0.85rem !important; }  /* 原0.75rem */
.fs-6 { font-size: 0.95rem !important; }  /* 新增：替代原来的fs-8 */
.fs-9 { font-size: 0.8rem !important; }   /* 备用 */

/* 间距优化（核心紧凑化） */
.py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
.py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
.py-1\.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
.py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
.px-1 { padding-left: 0.25rem !important; padding-right: 0.25rem !important; }
.px-1\.5 { padding-left: 0.375rem !important; padding-right: 0.375rem !important; }
.px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
.px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
.mb-0\.5 { margin-bottom: 0.125rem !important; }
.mb-1 { margin-bottom: 0.25rem !important; }
.mb-1\.5 { margin-bottom: 0.375rem !important; }
.mb-2 { margin-bottom: 0.5rem !important; }
.gap-1 { gap: 0.25rem !important; }
.gap-1\.5 { gap: 0.375rem !important; }
.gap-2 { gap: 0.5rem !important; }

/* 过渡效果统一 */
.transition { transition: all 0.2s ease !important; }
.transition-all { transition: all 0.3s ease !important; }
.duration-300 { transition-duration: 300ms !important; }

/* 文本处理 */
.text-truncate {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.lh-base { line-height: 1.4 !important; } /* 行高也适当调大，提升可读性 */

/* 深色模式全局适配 */
.dark-mode {
  --bs-card-bg: #1f2937 !important;
  --bs-border-color: #374151 !important;
  --bs-text-muted: #9ca3af !important;
}

/* 卡片样式优化 */
:deep(.card) {
  border: 1px solid var(--bs-border-color) !important;
  background-color: var(--bs-card-bg) !important;
}
:deep(.card-header) {
  border-bottom: 1px solid var(--bs-border-color) !important;
  padding: 0.5rem 1rem !important;
}
:deep(.card-body) { padding: 0.5rem !important; }

/* 深色模式深度适配 */
:deep(.dark-mode .card) {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}
:deep(.dark-mode .card-header) {
  background-color: #111827 !important;
  color: #f9fafb !important;
  border-bottom-color: #374151 !important;
}
:deep(.dark-mode .text-muted) { color: #9ca3af !important; }
:deep(.dark-mode .border-primary\/10) { border-color: rgba(59, 130, 246, 0.1) !important; }

/* 列表项样式 */
:deep(.list-group-item) {
  padding: 0.25rem !important;
  background-color: transparent !important;
  transition: background-color 0.2s ease !important;
}

/* 标签云样式 */
:deep(.badge.rounded-pill) {
  font-size: 0.85rem !important; /* 调大标签字体 */
  padding: 0.3rem 0.6rem !important; /* 适当增加内边距 */
  transition: all 0.2s ease !important;
}
:deep(.badge.rounded-pill:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 1px 4px rgba(13, 110, 253, 0.2) !important;
}
:deep(.dark-mode .badge.bg-dark-subtle) {
  background-color: #374151 !important;
  color: #f9fafb !important;
}
:deep(.dark-mode .badge.bg-dark-subtle:hover) {
  background-color: #0d6efd !important;
  color: #fff !important;
}

/* 按钮样式紧凑化 */
:deep(.btn-sm) {
  padding: 0.2rem 0.5rem !important;
  font-size: 0.85rem !important; /* 按钮字体调大 */
}

/* 评论卡片优化 */
:deep(.comment-card) {
  transition: all 0.2s ease !important;
}
:deep(.comment-card:hover) {
  transform: translateY(-1px) !important;
}
:deep(.dark-mode .comment-card) {
  background-color: #27272a !important;
  border-color: #3f3f46 !important;
}

/* 头像和角标优化 */
:deep(.badge.rounded-circle) {
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 12px !important; /* 排名数字调大 */
  width: 20px !important;
  height: 20px !important;
}

/* 链接hover效果统一 */
:deep(a.text-primary) {
  color: #0d6efd !important;
  transition: color 0.2s ease !important;
  font-size: 0.85rem !important;
}
:deep(a.text-primary:hover) {
  color: #0a58ca !important;
}
:deep(.dark-mode a.text-primary:hover) {
  color: #3b82f6 !important;
}

/* 滚动条优化（深色模式） */
:deep(.dark-mode ::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}
:deep(.dark-mode ::-webkit-scrollbar-track) {
  background: #1f2937;
}
:deep(.dark-mode ::-webkit-scrollbar-thumb) {
  background: #4b5563;
  border-radius: 3px;
}
:deep(.dark-mode ::-webkit-scrollbar-thumb:hover) {
  background: #6b7280;
}
</style>