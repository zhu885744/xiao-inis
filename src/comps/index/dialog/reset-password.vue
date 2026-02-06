<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">找回密码</h2>
      <form class="auth-form" @submit.prevent="handleResetPwd">
        <!-- 手机号 -->
        <div class="form-item">
          <label>手机号</label>
          <input
            type="tel"
            v-model="form.phone"
            placeholder="请输入手机号"
            class="form-input"
          />
          <div class="error-tip" v-if="!isPhoneValid && form.phone">
            请输入正确的手机号
          </div>
        </div>

        <!-- 验证码 -->
        <div class="form-item code-item">
          <div class="code-input">
            <label>验证码</label>
            <input
              type="text"
              v-model="form.code"
              placeholder="请输入6位验证码"
              class="form-input"
            />
          </div>
          <button
            type="button"
            class="code-btn"
            @click="sendCode"
            :disabled="!isPhoneValid || codeCount > 0"
          >
            {{ codeCount > 0 ? `${codeCount}s后重新发送` : '获取验证码' }}
          </button>
          <div class="error-tip" v-if="!isCodeValid && form.code">
            请输入6位数字验证码
          </div>
        </div>

        <!-- 新密码 -->
        <div class="form-item">
          <label>设置新密码</label>
          <input
            type="password"
            v-model="form.newPassword"
            placeholder="请设置新密码（6-18位字母+数字）"
            class="form-input"
          />
          <div class="error-tip" v-if="!isPwdValid && form.newPassword">
            密码格式错误（6-18位字母+数字）
          </div>
        </div>

        <!-- 确认新密码 -->
        <div class="form-item">
          <label>确认新密码</label>
          <input
            type="password"
            v-model="form.confirmPwd"
            placeholder="请再次输入新密码"
            class="form-input"
          />
          <div class="error-tip" v-if="form.confirmPwd && form.newPassword !== form.confirmPwd">
            两次密码输入不一致
          </div>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="auth-btn" :disabled="!isFormValid">
          重置密码
        </button>

        <!-- 跳转登录 -->
        <div class="auth-link">
          <router-link to="/login">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { sendCodeApi, resetPwdApi } from '@/api/auth';
import { validatePhone, validateCode, validatePwd } from '@/utils/validate';

const router = useRouter();

// 表单数据
const form = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPwd: ''
});

// 验证码倒计时
const codeCount = ref(0);
let timer = null;

// 验证规则
const isPhoneValid = computed(() => validatePhone(form.value.phone));
const isCodeValid = computed(() => validateCode(form.value.code));
const isPwdValid = computed(() => validatePwd(form.value.newPassword));
const isConfirmPwdValid = computed(() => form.value.newPassword === form.value.confirmPwd);

// 表单整体有效
const isFormValid = computed(() => {
  return isPhoneValid.value && isCodeValid.value && isPwdValid.value && isConfirmPwdValid.value;
});

// 发送验证码
const sendCode = async () => {
  if (!isPhoneValid.value) return;
  try {
    await sendCodeApi({ phone: form.value.phone, type: 'reset' });
    // 开始倒计时
    codeCount.value = 60;
    timer = setInterval(() => {
      codeCount.value--;
      if (codeCount.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    alert('验证码发送成功！');
  } catch (err) {
    alert('验证码发送失败：' + (err.response?.data?.msg || '网络错误'));
  }
};

// 重置密码
const handleResetPwd = async () => {
  try {
    await resetPwdApi({
      phone: form.value.phone,
      code: form.value.code,
      newPassword: form.value.newPassword
    });
    alert('密码重置成功！即将跳转到登录页');
    router.push('/login');
  } catch (err) {
    alert('密码重置失败：' + (err.response?.data?.msg || '重置失败'));
  }
};

// 页面卸载清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 复用登录/注册页样式 */
.code-item {
  position: relative;
}
.code-input {
  margin-right: 110px;
}
.code-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 40px;
  margin-top: 24px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.code-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .code-btn {
    background: #0a84ff;
  }
  .code-btn:disabled {
    background: #444;
  }
}

/* 继承登录页样式 */
@import './Login.vue?vue&type=style&scoped=true';
</style>