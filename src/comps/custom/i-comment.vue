<!-- src/comps/CommentList.vue 评论通用组件 -->
<template>
  <div class="card shadow-sm border-0 rounded-3">
    <!-- 评论区标题：接收props的评论数，动态展示 -->
    <div class="card-header border-0">
      <h3 class="h5 fw-bold mt-2">
        <i class="bi bi-chat-dots me-2"></i>
        评论 ({{ commentCount || 0 }})
      </h3>
    </div>
    <div class="card-body">
      <!-- 评论输入框：触发父组件的发布评论事件，传递输入内容 
      <div class="mb-5">
        <textarea 
          v-model="commentInput"
          class="form-control rounded-2 border border-secondary-subtle" 
          rows="3" 
          placeholder="请输入你的评论..."
        ></textarea>
        <button 
          @click="handlePublish"
          class="btn btn-primary mt-3 px-4"
          :disabled="!commentInput.trim()"
        >
          发布评论
        </button>
      </div>-->

      <!-- 评论列表：接收props的评论数据，无数据时展示提示 -->
      <div class="comments-list" v-if="commentList.length > 0">
        <div 
          class="comment-item pb-4 mb-4 border-bottom"
          v-for="(item, index) in commentList" 
          :key="index"
        >
          <div class="d-flex align-items-start mb-3">
            <img 
              :src="item.avatar || 'https://picsum.photos/60/60'" 
              class="avatar rounded-circle me-3" 
              alt="用户头像"
            >
            <div class="flex-grow-1">
              <h6 class="fw-semibold mb-1">{{ item.nickname || '匿名用户' }}</h6>
              <small class="text-muted">{{ item.time || '未知时间' }}</small>
              <span v-if="item.isAuthor" class="badge bg-primary text-white ms-2">作者</span>
            </div>
          </div>
          <p class="text-secondary mb-2">{{ item.content }}</p>
          <button class="btn btn-sm btn-outline-primary" @click="handleReply(index)">回复</button>

          <!-- 评论回复：嵌套展示，复用评论项样式 -->
          <div 
            class="ms-5 mt-3 pt-3 border-top"
            v-for="(reply, rIndex) in item.replies" 
            :key="rIndex"
          >
            <div class="d-flex align-items-start mb-3">
              <img 
                :src="reply.avatar || 'https://picsum.photos/62/62'" 
                class="avatar rounded-circle me-3" 
                alt="回复用户头像"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">
                  {{ reply.nickname || '匿名用户' }}
                  <span v-if="reply.isAuthor" class="badge bg-primary text-white ms-2">作者</span>
                </h6>
                <small class="text-muted">{{ reply.time || '未知时间' }}</small>
              </div>
            </div>
            <p class="text-secondary mb-2">{{ reply.content }}</p>
            <button class="btn btn-sm btn-outline-primary">回复</button>
          </div>
        </div>
      </div>

      <!-- 无评论提示：样式友好，引导用户评论 -->
      <div v-else class="text-center py-5 text-muted">
        <i class="bi bi-chat-square-dots fs-1 mb-3"></i>
        <p class="mb-0">暂无评论，快来抢沙发吧～</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

// 🌟 1. 定义组件接收的props：父组件传递核心参数，支持类型校验+兜底
const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true, // 文章ID必传，用于后续请求评论/发布评论
    validator: (val) => String(val).trim() !== '' // 校验非空
  },
  commentCount: {
    type: [String, Number],
    default: 0 // 评论总数，默认0
  },
  // 评论列表数据：支持父组件传递初始静态/接口数据，默认空数组
  commentList: {
    type: Array,
    default: () => []
  }
})

// 🌟 2. 定义组件向外触发的事件：父组件可监听并处理业务逻辑（如发布评论、请求回复）
const emit = defineEmits(['publishComment', 'replyComment'])

// 🌟 3. 组件内部响应式状态：评论输入框内容
const commentInput = ref('')

// 🌟 4. 发布评论处理：校验内容 -> 触发父组件事件 -> 清空输入框
const handlePublish = () => {
  const content = commentInput.value.trim()
  if (!content) return // 空内容不处理
  // 向父组件传递：文章ID + 评论内容
  emit('publishComment', {
    articleId: props.articleId,
    content
  })
  // 清空输入框
  commentInput.value = ''
}

// 🌟 5. 回复评论处理：触发父组件事件，传递评论索引（后续可扩展为评论ID）
const handleReply = (index) => {
  emit('replyComment', {
    articleId: props.articleId,
    commentIndex: index // 暂传索引，后续接口联调可替换为评论ID
  })
  // 可选：自动聚焦到输入框，提示回复对象
  commentInput.value = `回复 #${index+1}：`
  setTimeout(() => {
    document.querySelector('textarea[placeholder="请输入你的评论..."]').focus()
  }, 100)
}
</script>

<style scoped>
/* 保留原有评论样式，保证和项目风格统一 */
.avatar {
  width: 50px;
  height: 50px;
  object-fit: cover;
}

.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

/* 适配移动端：回复区缩进减小 */
@media (max-width: 768px) {
  .ms-5 {
    margin-left: 1.5rem !important;
  }
}
</style>