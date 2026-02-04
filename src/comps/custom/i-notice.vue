<template>
  <!-- 公告卡片：轻量样式，保留原有间距和阴影 -->
  <div class="card mt-2 mb-3 shadow-sm" v-if="noticeList.length > 0">
    <div class="card-body p-0">
      <!-- 公告列表：默认显示1条，展开显示全部 -->
      <div 
        class="notice-item d-flex align-items-center py-2 px-3 border-bottom border-light"
        v-for="(notice, index) in showNoticeList"
        :key="notice.id"
        @click="handleNoticeClick(notice)"
      >
        <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
        <span class="fw-medium fs-7 truncate-title flex-1">{{ notice.title }}</span>
        <span class="ms-auto text-muted x-small">{{ formatTime(notice.create_time) }}</span>
      </div>
      <!-- 展开/折叠按钮：添加text-decoration-none去除下划线 -->
      <div v-if="noticeList.length > 1" class="text-center py-1.5">
        <button 
          class="btn btn-link text-danger fs-7 p-0 d-flex align-items-center mx-auto text-decoration-none"
          @click="isExpand = !isExpand"
        >
          {{ isExpand ? '折叠公告' : `查看更多(${noticeList.length - 1}条)` }}
          <i class="bi ms-1" :class="isExpand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
    </div>
  </div>
  <!-- 空状态：无公告时友好提示，避免页面空白 -->
  <div class="card mt-2 mb-3 shadow-sm py-3 text-center text-muted fs-7" v-else>
    暂无系统公告
  </div>

  <!-- 公告弹窗：完全复用原有代码，无任何修改 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title d-flex align-items-center">
            <i class="bi bi-megaphone text-danger me-2"></i>
            {{ currentNotice?.title || '公告' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="notice-meta d-flex align-items-center mt-2 flex-wrap gap-2">
            <span class="badge text-bg-danger me-2">
              <i class="bi bi-tag"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="badge text-bg-success">
              <i class="bi bi-calendar3 me-1"></i>
              {{ currentNotice?.create_time ? formatTime(currentNotice.create_time) : '' }}
            </span>
          </div>
          <div class="notice-content mt-3 p-2 bg-light rounded">
            <div v-html="formatContent(currentNotice?.content || '')"></div>
            <div v-if="currentNotice?.url" class="text-center mt-4">
              <a 
                :href="currentNotice.url" 
                :target="currentNotice.target || '_blank'"
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-link-45deg me-1"></i>查看详情
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'

// 响应式数据：保留原有所有数据，新增展开状态标识
const noticeList = ref([])
const currentNotice = ref(null)
const noticeModal = ref(null)
let modalInstance = null
// 新增：折叠/展开状态，默认折叠
const isExpand = ref(false)

// 计算属性：控制公告显示数量，默认只显示1条，展开显示全部
const showNoticeList = computed(() => {
  return isExpand.value ? noticeList.value : noticeList.value.slice(0, 1)
})

// 获取公告列表：保留原有逻辑，可根据需要调整limit（建议≥5条，适合折叠场景）
const fetchNotices = async () => {
  try {
    const res = await request.get('/api/placard/all', {
      page: 1,
      limit: 10, // 折叠场景建议多查几条，支持用户查看历史公告
      order: 'create_time desc',
      cache: false
    })
    if (res.code === 200 && res.data?.data) {
      noticeList.value = res.data.data
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

// 格式化时间：完全复用原有代码，无修改
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化内容：完全复用原有代码，无修改
const formatContent = (content) => {
  if (!content) return '<p class="text-muted">暂无公告内容</p>'
  return content.replace(/\n/g, '<br>').replace(/\s+/g, ' ')
}

// 处理公告点击：完全复用原有代码，点击单条公告弹窗展示详情
const handleNoticeClick = (notice) => {
  currentNotice.value = notice
  modalInstance?.show()
}

// 清理资源：完全复用原有代码，无修改
const cleanup = () => {
  if (modalInstance) {
    modalInstance.dispose()
    modalInstance = null
  }
}

// 生命周期：保留原有逻辑，无修改
onMounted(() => {
  if (noticeModal.value) {
    modalInstance = new Modal(noticeModal.value)
  }
  fetchNotices()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 公告标题超出省略：保留原有样式，无修改 */
.truncate-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0 0.5rem;
}

/* 公告项样式：保留原有hover效果，优化边框和间距 */
.notice-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.notice-item:hover {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

/* 小字号适配：保留原有样式，无修改 */
.fs-7 {
  font-size: 0.875rem !important;
}
.x-small {
  font-size: 0.75rem !important;
}
</style>