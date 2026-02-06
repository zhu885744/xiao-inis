// src/store/user.js
const state = {
  // 用户基础信息
  userInfo: {
    userId: localStorage.getItem('userId') || 'guest', // 模拟用户ID
    level: Number(localStorage.getItem('userLevel')) || 1, // 用户等级
    exp: Number(localStorage.getItem('userExp')) || 0, // 当前经验
    expNeed: 100, // 升级所需经验（可按等级动态计算）
    signInfo: {
      isSigned: localStorage.getItem('isSigned') === 'true' || false, // 今日是否签到
      signDays: Number(localStorage.getItem('signDays')) || 0, // 累计签到天数
      lastSignDate: localStorage.getItem('lastSignDate') || '' // 最后签到日期
    }
  }
};

const mutations = {
  // 更新用户经验
  UPDATE_EXP(state, exp) {
    state.userInfo.exp += exp;
    // 自动升级逻辑
    while (state.userInfo.exp >= state.userInfo.expNeed) {
      state.userInfo.exp -= state.userInfo.expNeed;
      state.userInfo.level += 1;
      // 升级后所需经验翻倍（可自定义规则）
      state.userInfo.expNeed = Math.floor(state.userInfo.expNeed * 1.5);
    }
    // 持久化
    localStorage.setItem('userExp', state.userInfo.exp);
    localStorage.setItem('userLevel', state.userInfo.level);
  },
  // 签到操作
  USER_SIGN(state) {
    const today = new Date().toLocaleDateString();
    // 防止重复签到
    if (state.userInfo.signInfo.lastSignDate === today) return;
    // 更新签到状态
    state.userInfo.signInfo.isSigned = true;
    state.userInfo.signInfo.signDays += 1;
    state.userInfo.signInfo.lastSignDate = today;
    // 签到奖励经验（随机10-50）
    const expReward = Math.floor(Math.random() * 40) + 10;
    mutations.UPDATE_EXP(state, expReward);
    // 持久化签到信息
    localStorage.setItem('isSigned', state.userInfo.signInfo.isSigned);
    localStorage.setItem('signDays', state.userInfo.signInfo.signDays);
    localStorage.setItem('lastSignDate', today);
  },
  // 初始化签到状态（每日刷新）
  INIT_SIGN_STATE(state) {
    const today = new Date().toLocaleDateString();
    if (state.userInfo.signInfo.lastSignDate !== today) {
      state.userInfo.signInfo.isSigned = false;
      localStorage.setItem('isSigned', false);
    }
  }
};

const actions = {
  // 触发签到
  doSign({ commit }) {
    commit('USER_SIGN');
  },
  // 初始化签到状态（页面加载时调用）
  initSign({ commit }) {
    commit('INIT_SIGN_STATE');
  }
};

const getters = {
  // 获取用户等级进度（百分比）
  levelProgress: (state) => {
    return Math.floor((state.userInfo.exp / state.userInfo.expNeed) * 100);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};