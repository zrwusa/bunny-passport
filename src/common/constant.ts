export const BUSINESS_LOGICS = {
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
  },
};
