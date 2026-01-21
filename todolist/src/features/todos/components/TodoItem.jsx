import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toggleTodo, deleteTodo, editTodo } from '../todosSlice'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

/**
 * 单个任务项组件
 * 使用 React.memo 优化: 只有当 todo prop 变化时才重新渲染
 * 
 * 演示: React.memo, useState, useCallback, useRef, 条件渲染
 */
const TodoItem = memo(function TodoItem({ todo }) {
  const dispatch = useDispatch()
  
  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const inputRef = useRef(null)

  // 进入编辑模式时聚焦输入框
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // 切换完成状态
  const handleToggle = useCallback(() => {
    dispatch(toggleTodo(todo.id))
  }, [dispatch, todo.id])

  // 删除任务
  const handleDelete = useCallback(() => {
    dispatch(deleteTodo(todo.id))
  }, [dispatch, todo.id])

  // 进入编辑模式
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditTitle(todo.title)
  }, [todo.title])

  // 保存编辑
  const handleSave = useCallback(() => {
    const trimmedTitle = editTitle.trim()
    if (trimmedTitle && trimmedTitle !== todo.title) {
      dispatch(editTodo({ id: todo.id, title: trimmedTitle }))
    }
    setIsEditing(false)
  }, [dispatch, todo.id, todo.title, editTitle])

  // 取消编辑
  const handleCancel = useCallback(() => {
    setEditTitle(todo.title)
    setIsEditing(false)
  }, [todo.title])

  // 处理键盘事件
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  // 格式化创建时间
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div 
      className={`
        group flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm
        border-l-4 transition-all duration-200
        ${todo.completed 
          ? 'border-l-green-500 bg-green-50' 
          : 'border-l-blue-500 hover:shadow-md'
        }
      `}
    >
      {/* 复选框 */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 
                   focus:ring-blue-500 cursor-pointer"
        aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
      />

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          // 编辑模式
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-base"
          />
        ) : (
          // 展示模式
          <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
            <p 
              className={`text-base truncate ${
                todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {todo.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(todo.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {!isEditing && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDoubleClick}
            aria-label="编辑任务"
          >
            编辑
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            aria-label="删除任务"
          >
            删除
          </Button>
        </div>
      )}
    </div>
  )
})

export default TodoItem
