/**
 * 🔘 按钮组件
 * 可爱风格设计
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyles = getButtonStyles(variant, size, disabled);
  const textStyles = getTextStyles(variant, size);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        buttonStyles,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text style={[styles.text, textStyles]}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}

function getButtonStyles(
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): ViewStyle {
  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? colors.primary[200] : colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    secondary: {
      backgroundColor: disabled ? colors.lavender[100] : colors.lavender[500],
      shadowColor: colors.lavender[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: disabled ? colors.gray[200] : colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

function getTextStyles(variant: ButtonVariant, size: ButtonSize): TextStyle {
  const sizeStyles = {
    sm: { fontSize: fontSize.sm },
    md: { fontSize: fontSize.md },
    lg: { fontSize: fontSize.lg },
  };

  const variantStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.text.inverse },
    secondary: { color: colors.text.inverse },
    outline: { color: colors.primary[500] },
    ghost: { color: colors.primary[500] },
  };

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});
