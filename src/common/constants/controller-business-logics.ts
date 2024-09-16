export const CONTROLLER_BUSINESS_LOGICS = {
  logout: {
    AUTHORIZATION_HEADER_NOT_FOUND: {
      en: 'Authorization header not found',
      zh: '验证头没找到',
    },
    INVALID_TOKEN_FORMAT: {
      en: 'Invalid token format',
      zh: '无效令牌格式',
    },
    LOGGED_OUT_SUCCESSFULLY: {
      en: 'Logged out successfully',
      zh: '登出成功',
    },
  },
  register: {
    REGISTERED_SUCCESSFULLY: {
      en: 'Registered successfully',
      zh: '注册成功',
    },
    EMAIL_ALREADY_EXISTS: {
      en: 'Email already exists',
      zh: '邮箱已经注册过了',
    },
  },
  login: {
    LOGGED_IN_SUCCESSFULLY: {
      en: 'Logged in successfully',
      zh: '登录成功',
    },
    USER_OR_PASSWORD_DOES_NOT_MATCH: {
      en: 'User or password does not match',
      zh: '用户名和密码不匹配',
    },
    LOGGED_IN_FAILED: {
      en: 'Logged in failed',
      zh: '登录失败',
    },
  },
  refresh: {
    REFRESH_TOKEN_FAILED: {
      en: 'Refresh token failed',
      zh: '刷新令牌失效',
    },
    REFRESH_TOKEN_SUCCESSFULLY: {
      en: 'Refresh token successfully',
      zh: '刷新令牌成功',
    },
  },
  changePassword: {
    USER_NOT_FOUND: {
      en: 'User not found',
      zh: '用户未找到',
    },
    ORIGINAL_PASSWORD_IS_INCORRECT: {
      en: 'Original password is incorrect',
      zh: '原密码不正确',
    },
    PASSWORD_CHANGED_SUCCESSFULLY: {
      en: 'Password changed successfully',
      zh: '密码修改成功',
    },
  },
  findAll: {
    FIND_USERS_SUCCESSFULLY: {
      en: 'Find users successfully',
      zh: '获取用户列表成功',
    },
  },
  deleteUser: {
    USER_NOT_FOUND: {
      en: 'User not found',
      zh: '未找到用户',
    },
    USER_DELETED_SUCCESSFULLY: {
      en: 'User deleted successfully',
      zh: '成功删除用户',
    },
  },
};