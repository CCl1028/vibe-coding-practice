# Phase 5: 体验优化与打磨

## 迭代目标

提升视觉体验、交互流畅度和细节完善，打造高质量的用户体验。

**预计工期**：3-4 天  
**依赖**：Phase 4（成就与统计系统）

---

## 功能需求

### 1. 动画效果完善

**优先级**：P0

**需求描述**：
- 完善页面切换动画
- 优化列表动画（添加、删除、状态变化）
- 优化弹窗动画
- 添加加载状态动画
- 确保动画流畅不卡顿

**验收标准**：
- ✅ 所有页面切换有过渡动画
- ✅ 列表操作有流畅动画
- ✅ 弹窗动画自然
- ✅ 加载状态清晰
- ✅ 动画不影响性能

**动画清单**：

**页面切换**：
```typescript
// 使用 Framer Motion
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut'
};
```

**列表动画**：
```typescript
// 任务列表
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

**弹窗动画**：
```typescript
// 奖励弹窗
const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50 
  }
};
```

**数字滚动动画**：
```typescript
// 经验值、金币等数字变化
const NumberCounter = ({ value, duration = 0.5 }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      {value}
    </motion.span>
  );
};
```

**进度条动画**：
```typescript
// 经验条、成就进度条
const ProgressBar = ({ progress }) => {
  return (
    <motion.div
      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  );
};
```

---

### 2. 深浅色主题切换

**优先级**：P0

**需求描述**：
- 实现深色主题（默认）和浅色主题
- 提供主题切换按钮
- 主题选择持久化
- 所有组件适配两种主题
- 平滑的主题切换过渡

**验收标准**：
- ✅ 深浅色主题样式完整
- ✅ 切换按钮在 Header
- ✅ 切换时过渡平滑
- ✅ 刷新后主题保持
- ✅ 所有组件适配两种主题

**技术实现**：

**主题配置**：
```typescript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 深色主题
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#e2e8f0',
          muted: '#94a3b8'
        },
        // 浅色主题
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b'
        },
        // 主题色（通用）
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        },
        accent: {
          gold: '#fbbf24',
          green: '#10b981',
          red: '#ef4444'
        }
      }
    }
  }
};
```

**主题 Store**：
```typescript
interface ThemeStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: storage.get('questify_theme', 'dark'),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      storage.set('questify_theme', newTheme);
      updateDocumentTheme(newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    storage.set('questify_theme', theme);
    updateDocumentTheme(theme);
    set({ theme });
  }
}));

const updateDocumentTheme = (theme: 'dark' | 'light') => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```

**组件适配示例**：
```typescript
// 使用 Tailwind 的 dark: 前缀
const CharacterCard = () => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-none dark:border dark:border-dark-border">
      <h3 className="text-gray-900 dark:text-dark-text">
        角色名称
      </h3>
      <p className="text-gray-500 dark:text-dark-muted">
        角色描述
      </p>
    </div>
  );
};
```

---

### 3. 任务拖拽排序

**优先级**：P1

**需求描述**：
- 支持拖拽调整任务顺序
- 拖拽过程流畅
- 排序结果持久化
- 视觉反馈清晰

**验收标准**：
- ✅ 可拖拽任务卡片
- ✅ 拖拽过程有占位提示
- ✅ 松开后顺序更新
- ✅ 排序保存到本地存储

**技术实现**：

使用 `@dnd-kit/core` 和 `@dnd-kit/sortable`：

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

const QuestList = () => {
  const [quests, setQuests] = useQuestStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = quests.findIndex(q => q.id === active.id);
      const newIndex = quests.findIndex(q => q.id === over.id);
      
      const newQuests = arrayMove(quests, oldIndex, newIndex);
      setQuests(newQuests);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={quests}
        strategy={verticalListSortingStrategy}
      >
        {quests.map(quest => (
          <SortableQuestCard key={quest.id} quest={quest} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

const SortableQuestCard = ({ quest }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: quest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestCard quest={quest} />
    </div>
  );
};
```

---

### 4. UI 细节优化

**优先级**：P0

**需求描述**：
- 统一组件间距和对齐
- 优化按钮样式和交互
- 完善空状态展示
- 优化加载状态
- 添加工具提示（Tooltip）
- 优化响应式布局

**验收标准**：
- ✅ 组件样式统一协调
- ✅ 按钮交互反馈清晰
- ✅ 空状态友好提示
- ✅ 加载状态明确
- ✅ Tooltip 正确显示
- ✅ 移动端适配良好

**优化细节**：

**按钮样式**：
```typescript
// 按钮变体
const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-border',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'hover:bg-gray-100 dark:hover:bg-dark-surface'
};

// 按钮尺寸
const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};
```

**空状态**：
```typescript
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 dark:text-dark-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
```

**Tooltip**：
```typescript
import { Tooltip } from 'react-tooltip';

const StatIcon = ({ stat, value }) => {
  return (
    <div
      data-tooltip-id={`stat-${stat}`}
      data-tooltip-content={getStatDescription(stat)}
    >
      <Icon name={stat} />
      <span>{value}</span>
      <Tooltip id={`stat-${stat}`} />
    </div>
  );
};
```

**响应式布局**：
```typescript
// 使用 Tailwind 响应式类
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 小屏: 1列, 中屏: 2列, 大屏: 4列 */}
</div>

<div className="flex flex-col lg:flex-row">
  {/* 小屏: 纵向排列, 大屏: 横向排列 */}
</div>
```

---

### 5. 性能优化

**优先级**：P1

**需求需求**：
- 减少不必要的重渲染
- 优化列表渲染性能
- 懒加载非关键组件
- 优化图片和资源加载
- 减少包体积

**验收标准**：
- ✅ 页面加载速度快
- ✅ 交互流畅无卡顿
- ✅ 列表滚动流畅
- ✅ 无内存泄漏

**优化策略**：

**React.memo 优化**：
```typescript
const QuestCard = React.memo(({ quest }: QuestCardProps) => {
  return (
    <div>
      {/* ... */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.quest.id === nextProps.quest.id &&
         prevProps.quest.status === nextProps.quest.status;
});
```

**useMemo 和 useCallback**：
```typescript
const QuestList = () => {
  const quests = useQuestStore(state => state.quests);
  const filters = useQuestStore(state => state.filters);
  
  // 缓存筛选结果
  const filteredQuests = useMemo(() => {
    return filterQuests(quests, filters);
  }, [quests, filters]);
  
  // 缓存回调函数
  const handleDelete = useCallback((id: string) => {
    deleteQuest(id);
  }, [deleteQuest]);
  
  return (
    <div>
      {filteredQuests.map(quest => (
        <QuestCard key={quest.id} quest={quest} onDelete={handleDelete} />
      ))}
    </div>
  );
};
```

**虚拟列表（长列表优化）**：
```typescript
import { FixedSizeList } from 'react-window';

const VirtualizedQuestList = ({ quests }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <QuestCard quest={quests[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={quests.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

**懒加载**：
```typescript
import { lazy, Suspense } from 'react';

const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const DailySummaryPage = lazy(() => import('./pages/DailySummaryPage'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/summary" element={<DailySummaryPage />} />
      </Routes>
    </Suspense>
  );
};
```

---

### 6. 加载与错误状态

**优先级**：P0

**需求描述**：
- 页面加载时显示骨架屏
- 操作失败时显示错误提示
- 网络错误时友好提示
- 提供重试机制

**验收标准**：
- ✅ 加载状态清晰
- ✅ 骨架屏美观
- ✅ 错误提示友好
- ✅ 可重试失败操作

**骨架屏**：
```typescript
const CharacterCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 dark:bg-dark-border rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-dark-border rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-dark-border rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 bg-gray-300 dark:bg-dark-border rounded"></div>
        <div className="h-2 bg-gray-300 dark:bg-dark-border rounded w-5/6"></div>
      </div>
    </div>
  );
};
```

**错误边界**：
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2>出错了！</h2>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 7. 细节打磨

**优先级**：P1

**需求描述**：
- 优化过渡效果
- 添加微交互（hover、active 状态）
- 优化图标和色彩
- 完善文案和提示
- 添加键盘快捷键（可选）

**验收标准**：
- ✅ 所有过渡自然流畅
- ✅ 交互反馈清晰
- ✅ 图标统一协调
- ✅ 文案友好易懂

**微交互**：
```css
/* 按钮悬停效果 */
.btn-primary {
  @apply transition-all duration-200;
}

.btn-primary:hover {
  @apply transform -translate-y-0.5 shadow-lg;
}

.btn-primary:active {
  @apply transform translate-y-0;
}

/* 卡片悬停效果 */
.quest-card {
  @apply transition-all duration-200;
}

.quest-card:hover {
  @apply shadow-xl transform -translate-y-1;
}

/* 图标旋转 */
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**键盘快捷键**：
```typescript
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: 新建任务
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
      
      // Ctrl/Cmd + D: 切换主题
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

---

## 组件优化清单

- [ ] CharacterCard: 添加动画和交互优化
- [ ] QuestCard: 添加悬停效果和状态动画
- [ ] RewardModal: 完善动画和数字滚动
- [ ] LevelUpModal: 增强视觉效果
- [ ] ExpBar: 平滑过渡动画
- [ ] AchievementBadge: 解锁动画
- [ ] 所有按钮: 统一样式和交互
- [ ] 所有表单: 验证反馈和错误提示
- [ ] 所有列表: 添加加载和空状态

---

## UI 设计规范

### 间距规范
- 组件内间距：`p-4` (16px)
- 组件外间距：`space-y-4` (16px)
- 卡片圆角：`rounded-xl` (12px)
- 按钮圆角：`rounded-lg` (8px)

### 字体规范
- 标题：`text-2xl font-bold`
- 小标题：`text-lg font-semibold`
- 正文：`text-base`
- 辅助文字：`text-sm text-gray-500`

### 颜色规范
- 主色：`primary-600`
- 强调色：`accent-gold` / `accent-green`
- 成功：`accent-green`
- 警告：`accent-gold`
- 错误：`accent-red`

---

## 验收清单

- [ ] 所有页面切换动画流畅
- [ ] 列表操作动画自然
- [ ] 弹窗动画优雅
- [ ] 深浅色主题切换正常
- [ ] 所有组件适配两种主题
- [ ] 任务拖拽功能正常
- [ ] 排序结果持久化
- [ ] UI 统一协调
- [ ] 响应式布局良好
- [ ] 性能优秀，无明显卡顿
- [ ] 加载状态清晰
- [ ] 错误处理友好
- [ ] 所有微交互流畅
- [ ] 无 bug 和问题

---

## 项目完成

完成 Phase 5 后，Questify MVP 版本开发完成！

可以进行以下工作：
1. 全面测试和修复 bug
2. 性能测试和优化
3. 用户测试和反馈收集
4. 准备演示和展示
5. 撰写项目文档和总结
