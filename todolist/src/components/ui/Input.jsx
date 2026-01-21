import { memo, forwardRef } from 'react'

/**
 * 通用输入框组件
 * 使用 forwardRef 允许父组件获取 input 引用
 */
const Input = memo(forwardRef(function Input(
  {
    type = 'text',
    placeholder = '',
    className = '',
    error = false,
    ...props
  },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      className={`
        w-full px-4 py-2 
        border rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:border-transparent
        ${error 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-blue-500'
        }
        ${className}
      `}
      {...props}
    />
  )
}))

export default Input
