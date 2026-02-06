<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">用户登录</h2>
      <!-- 登录表单 -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <!-- 登录方式切换 -->
        <div class="login-type">
          <button type="button" class="type-btn" :class="{ active: loginType === 'phone' }" @click="loginType = 'phone'">
            手机号登录
          </button>
          <button type="button" class="type-btn" :class="{ active: loginType === 'email' }" @click="loginType = 'email'">
            邮箱登录
          </button>
        </div>

        <!-- 手机号输入 -->
        <div class="form-item" v-if="loginType === 'phone'">
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

        <!-- 邮箱输入 -->
        <div class="form-item" v-if="loginType === 'email'">
          <label>邮箱</label>
          <input
            type="email"
            v-model="form.email"
            placeholder="请输入邮箱"
            class="form-input"
          />
          <div class="error-tip" v-if="!isEmailValid && form.email">
            请输入正确的邮箱
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-item">
          <label>密码</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="请输入密码（6-18位字母+数字）"
            class="form-input"
          />
          <div class="error-tip" v-if="!isPwdValid && form.password">
            密码格式错误（6-18位字母+数字）
          </div>
        </div>

        <!-- 记住密码 -->
        <div class="form-item remember">
          <input type="checkbox" v-model="form.remember" id="remember" />
          <label for="remember">记住密码</label>
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="auth-btn" :disabled="!isFormValid">
          登录
        </button>

        <!-- 跳转注册/找回密码 -->
        <div class="auth-link">
          <router-link to="/register">注册账号</router-link>
          <router-link to="/reset-pwd">忘记密码？</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { loginApi } from '@/api/auth';
import { validatePhone, validatePwd, validateEmail } from '@/utils/validate';

const store = useStore();
const router = useRouter();

// 登录类型：phone/email
const loginType = ref('phone');
// 表单数据
const form = ref({
  phone: '',
  email: '',
  password: '',
  remember: false
});

// 验证规则
const isPhoneValid = computed(() => validatePhone(form.value.phone));
const isEmailValid = computed(() => validateEmail(form.value.email));
const isPwdValid = computed(() => validatePwd(form.value.password));

// 表单整体是否有效
const isFormValid = computed(() => {
  if (loginType.value === 'phone') {
    return isPhoneValid.value && isPwdValid.value;
  } else {
    return isEmailValid.value && isPwdValid.value;
  }
});

// 登录处理
const handleLogin = async () => {
  try {
    // 构造请求参数
    const params = loginType.value === 'phone' 
      ? { phone: form.value.phone, password: form.value.password }
      : { email: form.value.email, password: form.value.password };
    
    // 调用登录接口（模拟返回数据）
    const res = await loginApi(params);
    // 实际项目中替换为真实接口返回的token和用户信息
    const { token, userInfo } = res.data;
    
    // 保存登录状态
    await store.dispatch('auth/login', { token, userInfo });
    
    // 跳转首页
    router.push('/');
    alert('登录成功！');
  } catch (err) {
    alert('登录失败：' + (err.response?.data?.msg || '账号或密码错误'));
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 0 20px;
}
.auth-card {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.auth-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.login-type {
  display: flex;
  margin-bottom: 20px;
}
.type-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e5e5e5;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}
.type-btn.active {
  background: #007aff;
  color: #fff;
  border-color: #007aff;
}
.form-item {
  margin-bottom: 15px;
}
.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
}
.form-input:focus {
  border-color: #007aff;
  outline: none;
}
.error-tip {
  color: #ff3b30;
  font-size: 12px;
  margin-top: 5px;
}
.remember {
  display: flex;
  align-items: center;
  gap: 5px;
}
.auth-btn {
  width: 100%;
  padding: 12px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 15px;
}
.auth-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
.auth-link {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.auth-link a {
  color: #007aff;
  text-decoration: none;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .auth-card {
    background: #1c1c1e;
    color: #fff;
  }
  .form-item label {
    color: #ddd;
  }
  .form-input {
    background: #2c2c2e;
    border-color: #333;
    color: #fff;
  }
  .type-btn {
    background: #2c2c2e;
    border-color: #333;
    color: #fff;
  }
  .type-btn.active {
    background: #0a84ff;
  }
}
</style>