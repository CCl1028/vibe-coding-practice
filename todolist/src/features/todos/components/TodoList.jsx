import { memo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectTodos, selectCompletedCount, clearCompleted } from '../todosSlice'
import TodoItem from './TodoItem'
import Button from '../../../components/ui/Button'

/**
 * 任务列表组件
 * 演示: useSelector, 列表渲染 (map + key), 条件渲染
 */
const TodoList = memo(function TodoList() {
  const dispatch = useDispatch()
  const todos = useSelector(selectTodos)
  const completedCount = useSelector(selectCompletedCount)

  // 清除已完成任务
  const handleClearCompleted = useCallback(() => {
    dispatch(clearCompleted())
  }, [dispatch])

  // 空状态展示
  if (todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-500 text-lg">暂无任务</p>
        <p className="text-gray-400 text-sm mt-2">
          在上方输入框添加你的第一个任务吧
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 任务列表 */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      {/* 底部操作栏 */}
      {completedCount > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearCompleted}
          >
            清除已完成 ({completedCount})
          </Button>
        </div>
      )}
    </div>
  )
})

export default TodoList
