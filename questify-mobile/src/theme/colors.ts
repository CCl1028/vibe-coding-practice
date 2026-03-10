/**
 * 🎨 Questify 清新主题配色
 * 天蓝色系 - 清爽、清醒、专注
 */

export const colors = {
  // 主色调 - 浅蓝色系
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',  // 主色
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // 薄荷绿 - 成功/完成
  mint: {
    50: '#F0FDF9',
    100: '#CCFBEF',
    200: '#99F6E0',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',  // 主色
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // 薰衣草紫 - 经验/升级
  lavender: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',  // 主色
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // 奶油黄 - 金币/奖励
  cream: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // 主色
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // 天蓝色 - 信息/智力
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',  // 主色
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // 珊瑚红 - 力量/挑战
  coral: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',  // 主色
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // 中性色
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // 背景色
  background: {
    primary: '#F0F9FF',    // 浅蓝背景
    secondary: '#FFFFFF',  // 纯白卡片
    tertiary: '#E0F2FE',   // 稍深蓝色
  },

  // 文字颜色
  text: {
    primary: '#2D2D2D',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // 状态颜色
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// 任务类型颜色
export const questTypeColors = {
  MAIN: {
    bg: '#FEF3C7',
    text: '#D97706',
    border: '#FCD34D',
  },
  SIDE: {
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#7DD3FC',
  },
  DAILY: {
    bg: '#CCFBEF',
    text: '#0D9488',
    border: '#5EEAD4',
  },
  CHALLENGE: {
    bg: '#F3E8FF',
    text: '#9333EA',
    border: '#D8B4FE',
  },
};

// 难度颜色
export const difficultyColors = {
  EASY: {
    bg: '#CCFBEF',
    text: '#0D9488',
  },
  MEDIUM: {
    bg: '#FEF3C7',
    text: '#D97706',
  },
  HARD: {
    bg: '#FFE4E6',
    text: '#E11D48',
  },
};

// 属性颜色
export const statColors = {
  strength: colors.coral[500],
  intelligence: colors.sky[500],
  focus: colors.lavender[500],
  vitality: colors.mint[500],
};
