<!-- 用户设置页面 -->
<template>
  <div class="card mt-2">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2 text-primary fw-semibold">用户设置</h5>
        <button 
          @click="fetchUserInfo" 
          class="btn btn-sm btn-outline-primary rounded-full px-4 py-1.5 transition-all hover:bg-primary hover:text-white"
          :disabled="loading"
        >
          <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
          刷新
        </button>
      </div>
    </div>
    <div class="card-body">
        <!-- 导航标签 -->
        <ul class="nav nav-tabs mb-4" id="userSettingsTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link active" 
              id="basic-info-tab" 
              data-bs-toggle="tab" 
              data-bs-target="#basic-info" 
              type="button" 
              role="tab" 
              aria-controls="basic-info" 
              aria-selected="true"
            >
              基础信息
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link" 
              id="account-security-tab" 
              data-bs-toggle="tab" 
              data-bs-target="#account-security" 
              type="button" 
              role="tab" 
              aria-controls="account-security" 
              aria-selected="false"
            >
              账号安全
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link" 
              id="contact-info-tab" 
              data-bs-toggle="tab" 
              data-bs-target="#contact-info" 
              type="button" 
              role="tab" 
              aria-controls="contact-info" 
              aria-selected="false"
            >
              联系方式
            </button>
          </li>
        </ul>

        <!-- 标签内容 -->
        <div class="tab-content" id="userSettingsTabsContent">
          <!-- 基础信息 -->
          <div 
            class="tab-pane fade show active" 
            id="basic-info" 
            role="tabpanel" 
            aria-labelledby="basic-info-tab"
          >
            <BasicInfoSettings />
          </div>
          
          <!-- 账号安全 -->
          <div 
            class="tab-pane fade" 
            id="account-security" 
            role="tabpanel" 
            aria-labelledby="account-security-tab"
          >
            <AccountSecuritySettings />
          </div>
          
          <!-- 联系方式 -->
          <div 
            class="tab-pane fade" 
            id="contact-info" 
            role="tabpanel" 
            aria-labelledby="contact-info-tab"
          >
            <ContactInfoSettings />
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicInfoSettings from '@/comps/user/settings/basic-info.vue'
import AccountSecuritySettings from '@/comps/user/settings/account-security.vue'
import ContactInfoSettings from '@/comps/user/settings/contact-info.vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 计算登录状态
const isLogin = computed(() => {
  const loginState = store.getLogin
  return loginState.finish && Object.keys(loginState.user).length > 0
})

// 检查登录状态
onMounted(async () => {
  // 手动触发登录态校验
  await store.checkLoginState()
  
  if (!isLogin.value) {
    toast.error('请先登录')
    // 跳转到首页
    window.location.href = '/'
  }
})
</script>

<style scoped>
/* 自定义样式 */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
}

.nav-tabs .nav-link {
  border-radius: 0.375rem 0.375rem 0 0;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color) var(--bs-border-color) transparent;
}
</style>