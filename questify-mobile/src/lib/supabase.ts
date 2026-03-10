/**
 * 🔌 Supabase 客户端配置
 * 使用单例模式确保只有一个客户端实例
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 创建一个兼容 Web 和 Native 的存储适配器
const createStorage = () => {
  // Web 环境使用 localStorage
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  
  // Native 环境使用 AsyncStorage
  // 延迟导入以避免 SSR 问题
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
};

// 创建 Supabase 客户端（单例模式）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native 不使用 URL 检测
  },
});

// 数据库类型定义（基于现有表结构）
export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          emailVerified: string | null;
          image: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['User']['Row'], 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['User']['Insert']>;
      };
      Character: {
        Row: {
          id: string;
          userId: string;
          name: string;
          avatar: string;
          level: number;
          exp: number;
          gold: number;
          title: string;
          strength: number;
          intelligence: number;
          focus: number;
          vitality: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['Character']['Row'], 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['Character']['Insert']>;
      };
      Quest: {
        Row: {
          id: string;
          userId: string;
          title: string;
          description: string | null;
          type: 'MAIN' | 'SIDE' | 'DAILY' | 'CHALLENGE';
          difficulty: 'EASY' | 'MEDIUM' | 'HARD';
          tag: 'STUDY' | 'WORK' | 'HEALTH' | 'LIFE';
          status: 'TODO' | 'DOING' | 'DONE';
          expReward: number;
          goldReward: number;
          strReward: number;
          intReward: number;
          focReward: number;
          vitReward: number;
          isToday: boolean;
          createdAt: string;
          completedAt: string | null;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['Quest']['Row'], 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['Quest']['Insert']>;
      };
      Achievement: {
        Row: {
          id: string;
          key: string;
          title: string;
          description: string;
          icon: string;
          target: number;
          createdAt: string;
        };
        Insert: Omit<Database['public']['Tables']['Achievement']['Row'], 'createdAt'>;
        Update: Partial<Database['public']['Tables']['Achievement']['Insert']>;
      };
      UserAchievement: {
        Row: {
          id: string;
          userId: string;
          achievementId: string;
          progress: number;
          unlocked: boolean;
          unlockedAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['UserAchievement']['Row'], 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['UserAchievement']['Insert']>;
      };
    };
  };
};
