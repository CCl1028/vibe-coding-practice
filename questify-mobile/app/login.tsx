/**
 * 🔐 登录页面
 * 可爱风格设计
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = () => {
    // TODO: 实际登录逻辑
    router.replace('/(tabs)');
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
              placeholder="请输入密码"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button variant="primary" size="lg" fullWidth onPress={handleLogin}>
            开始冒险 🚀
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 第三方登录 */}
          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple 登录</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}>📱</Text>
              <Text style={styles.socialText}>Google 登录</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 底部 */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            还没有账号？
            <Text style={styles.footerLink}> 立即注册</Text>
          </Text>
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
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
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
  socialButtons: {
    gap: spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
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
