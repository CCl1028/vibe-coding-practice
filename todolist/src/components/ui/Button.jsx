import { memo } from 'react'

/**
 * 通用按钮组件
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger'} props.variant - 按钮样式变体
 * @param {'sm' | 'md' | 'lg'} props.size - 按钮大小
 * @param {boolean} props.disabled - 是否禁用
 * @param {React.ReactNode} props.children - 按钮内容
 */
const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  // 变体样式映射
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  // 大小样式映射
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
