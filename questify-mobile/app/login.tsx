/**
 * 🔐 登录页面
 * 可爱风格设计 + Supabase 认证
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Button } from '../src/components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../src/theme';
import { useAuth } from '../src/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  // 装饰动画
  const float = useSharedValue(0);

  React.useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withSpring(10, { damping: 2 }),
        withSpring(-10, { damping: 2 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('提示', '请填写角色名称');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          Alert.alert('注册失败', error.message);
        } else {
          Alert.alert('注册成功', '请检查邮箱完成验证，然后登录', [
            { text: '好的', onPress: () => setIsSignUp(false) },
          ]);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('登录失败', error.message);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (e) {
      Alert.alert('错误', '网络连接失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 装饰 */}
        <Animated.View style={[styles.decorations, floatStyle]}>
          <Text style={styles.decorEmoji}>✨</Text>
          <Text style={[styles.decorEmoji, styles.decorLarge]}>🎮</Text>
          <Text style={styles.decorEmoji}>⭐</Text>
        </Animated.View>

        {/* Logo 区域 */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.logoSection}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏰</Text>
          </View>
          <Text style={styles.appName}>Questify</Text>
          <Text style={styles.tagline}>让每一天都是冒险</Text>
        </Animated.View>

        {/* 登录表单 */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.formSection}
        >
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🦸 角色名称</Text>
              <TextInput
                style={styles.input}
                placeholder="给你的角色起个名字"
                placeholderTextColor={colors.text.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 邮箱</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入邮箱"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔑 密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码（至少6位）"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : isSignUp ? (
              '创建角色 ✨'
            ) : (
              '开始冒险 🚀'
            )}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 跳过登录（开发模式） */}
          <Pressable
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>👻 游客模式（跳过登录）</Text>
          </Pressable>
        </Animated.View>

        {/* 底部 */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.footer}
        >
          <Pressable onPress={toggleMode}>
            <Text style={styles.footerText}>
              {isSignUp ? '已有账号？' : '还没有账号？'}
              <Text style={styles.footerLink}>
                {isSignUp ? ' 立即登录' : ' 立即注册'}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
    padding: spacing.lg,
  },
  decorations: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  decorEmoji: {
    fontSize: 24,
  },
  decorLarge: {
    fontSize: 36,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.primary[600],
    marginTop: spacing.lg,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  skipText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    color: colors.primary[500],
    fontWeight: fontWeight.semibold,
  },
});
