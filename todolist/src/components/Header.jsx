import { memo } from 'react'
import { useSelector } from 'react-redux'
import { selectTodosCount, selectCompletedCount, selectActiveCount } from '../features/todos/todosSlice'

/**
 * 头部组件
 * 显示标题和任务统计信息
 */
const Header = memo(function Header() {
  // 使用 selector 获取统计数据
  const total = useSelector(selectTodosCount)
  const completed = useSelector(selectCompletedCount)
  const active = useSelector(selectActiveCount)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* 标题 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              TodoList
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              React 学习项目 - 迭代一
            </p>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{total}</div>
              <div className="text-xs text-gray-500">全部</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{active}</div>
              <div className="text-xs text-gray-500">进行中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{completed}</div>
              <div className="text-xs text-gray-500">已完成</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})

export default Header
