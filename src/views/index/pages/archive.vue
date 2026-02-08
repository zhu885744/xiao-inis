<!-- 归档独立页面 -->
<template>
  <div class="card mt-2">
    <div class="card-body">
      归档独立页面
    </div>
    
    <!-- 评论区域 -->
    <div class="mt-4">
      <i-comment 
          :articleId="'archive'" 
          :commentCount="commentCount" 
          :commentList="commentList" 
          :isLogin="isLogin" 
          :isDarkMode="isDarkMode"
          @publishComment="handlePublishComment"
          @replyComment="handleReplyComment"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'
import iComment from '@/comps/custom/i-comment.vue'

// 路由实例
const router = useRouter()

// 状态管理
const store = useCommStore()

// 评论相关响应式数据
const commentCount = ref(0)
const commentList = ref([])
const isDarkMode = ref(false)

// 计算属性
const isLogin = computed(() => store.login.finish && Object.keys(store.login.user).length > 0)

// 获取归档页面评论
const getComments = async () => {
  try {
    const res = await request.get('/api/comment/flat', {
      bind_id: 'archive',
      bind_type: 'archive',
      page: 1,
      limit: 50,
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      commentCount.value = res.data?.count || 0
      commentList.value = res.data?.data || []
    }
  } catch (error) {
    console.error('获取评论失败：', error)
  }
}

// 发布评论
const handlePublishComment = async (data) => {
  try {
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'archive',
      bind_id: 'archive'
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
      await getComments()
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('评论发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '评论发布失败')
      }
    }
  } catch (error) {
    console.error('发布评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，评论发布失败')
    }
  }
}

// 回复评论
const handleReplyComment = async (data) => {
  try {
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'archive',
      bind_id: 'archive',
      pid: data.commentId
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
      await getComments()
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('回复发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '回复发布失败')
      }
    }
  } catch (error) {
    console.error('回复评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，回复发布失败')
    }
  }
}



// 检测深色模式
const detectDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 页面挂载初始化
onMounted(() => {
  getComments()
  detectDarkMode()
  
  // 监听深色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)
})
</script>