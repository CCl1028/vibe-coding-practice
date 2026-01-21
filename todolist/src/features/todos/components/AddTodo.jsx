import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addTodo } from '../todosSlice'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

/**
 * 添加任务组件
 * 演示: useState, useCallback, useRef, 受控组件
 */
const AddTodo = memo(function AddTodo() {
  // 本地状态: 输入框内容
  const [title, setTitle] = useState('')
  const dispatch = useDispatch()
  const inputRef = useRef(null)

  // 组件挂载后自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 处理输入变化 - 受控组件
  const handleChange = useCallback((e) => {
    setTitle(e.target.value)
  }, [])

  // 处理提交
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    
    if (trimmedTitle) {
      dispatch(addTodo(trimmedTitle))
      setTitle('') // 清空输入框
      inputRef.current?.focus() // 重新聚焦
    }
  }, [title, dispatch])

  // 处理键盘事件
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setTitle('')
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Input
          ref={inputRef}
          value={title}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="添加新任务，按 Enter 提交..."
          aria-label="新任务标题"
        />
      </div>
      <Button 
        type="submit" 
        variant="primary"
        disabled={!title.trim()}
      >
        添加
      </Button>
    </form>
  )
})

export default AddTodo
