/**
 * 🔐 认证 Context 和 Hook
 * 管理用户登录状态
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 用户首次注册后，创建角色
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureCharacterExists(session.user.id, session.user.email);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 确保用户有角色数据
  const ensureCharacterExists = async (userId: string, email?: string) => {
    try {
      // 检查是否已有角色
      const { data: existingCharacter } = await supabase
        .from('Character')
        .select('id')
        .eq('userId', userId)
        .single();

      if (!existingCharacter) {
        // 创建新角色
        const { error } = await supabase.from('Character').insert({
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          name: email?.split('@')[0] || '冒险者',
          avatar: 'default',
          level: 1,
          exp: 0,
          gold: 100,
          title: '新手冒险者',
          strength: 5,
          intelligence: 5,
          focus: 5,
          vitality: 5,
        });

        if (error) {
          console.error('创建角色失败:', error);
        }
      }
    } catch (error) {
      console.error('检查角色失败:', error);
    }
  };

  // 注册
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { error };
      }

      // 创建 User 记录
      if (data.user) {
        await supabase.from('User').insert({
          id: data.user.id,
          email,
          name: name || null,
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 登录
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 登出
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
