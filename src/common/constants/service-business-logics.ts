export const SERVICE_BUSINESS_LOGICS = {
  createUser: {
    EMAIL_ALREADY_EXISTS: {
      en: 'Email already exists',
      zh: '电子邮件已存在',
    },
    USER_CREATED_SUCCESSFULLY: {
      en: 'User created successfully',
      zh: '用户已创建成功',
    },
  },
  refresh: {
    INVALID_REFRESH_TOKEN: {
      en: 'Invalid Refresh Token',
      zh: '刷新令牌失效',
    },
    REFRESH_TOKEN_SUCCESSFULLY: {
      en: 'Refresh token successfully',
      zh: '刷新令牌成功',
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
  findOneByUsername: {
    FIND_ONE_BY_USERNAME_SUCCESSFULLY: {
      en: 'Find one by username successfully',
      zh: '通过用户名查找用户成功',
    },
  },
  validateUser: {
    USER_OR_PASSWORD_DOES_NOT_MATCH: {
      en: 'User or password does not match',
      zh: '用户名或密码不匹配',
    },
    VALIDATE_USER_SUCCESSFULLY: {
      en: 'Validate user successfully',
      zh: '用户验证成功',
    },
  },
  login: {
    LOGIN_SUCCESSFULLY: {
      en: 'Login successfully',
      zh: '登录成功',
    },
    USER_OR_PASSWORD_DOES_NOT_MATCH: {
      en: 'User or password does not match',
      zh: '用户名或密码错误',
    },
    LOGIN_FAILED: {
      en: 'Login failed',
      zh: '登录失败，未知原因',
    },
  },
  redisSet: {
    OK: {
      en: 'Redis get successfully',
      zh: 'Redis获取值成功',
    },
    NOT_OK: {
      en: 'Redis get failed',
      zh: 'Redis获取值失败',
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
  findAllUsers: {
    FIND_USERS_SUCCESSFULLY: {
      en: 'Find users successfully',
      zh: '获取用户列表成功',
    },
  },
  findOneByOAuthProvider: {
    FIND_ONE_USER_SUCCESSFULLY: {
      en: 'Find one user successfully',
      zh: '获取用户成功',
    },
    FIND_ONE_USER_FAILED: {
      en: 'Find one user failed',
      zh: '获取用户失败',
    },
  },
  createOAuthUser: {
    CREATE_OAUTH_USER_SUCCESSFULLY: {
      en: 'Create oauth user successfully',
      zh: '创建OAuth用户成功',
    },
    CREATE_OAUTH_USER_FAILED: {
      en: 'Create oauth user failed',
      zh: '创建OAuth用户失败',
    },
  },
  comparePasswords: {
    PASSWORDS_EQUAL: {
      en: 'Passwords are equal',
      zh: '密码相同',
    },
    PASSWORDS_DIFFERENT: {
      en: 'Passwords are different',
      zh: '密码不同',
    },
  },
};
