import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Sparkles,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonPage, TaskItem, FontSizeScale, WidgetSizeConfig } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { FontSizeControl, getFontSizeClasses } from './FontSizeControl';

interface TasksWidgetProps {
  page: LessonPage;
  onUpdate: (fields: Partial<LessonPage>) => void;
  onStartTimerForTask?: (minutes?: number) => void;
  onClose: () => void;
  size?: WidgetSizeConfig;
  onResizeWidget?: (size: Partial<WidgetSizeConfig>) => void;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  page,
  onUpdate,
  size,
  onResizeWidget,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskDraft, setEditTaskDraft] = useState('');

  const tasks: TaskItem[] = page.tasks || [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const currentFontSize: FontSizeScale =
    size?.fontSize || page.widgetSizes?.['tasks']?.fontSize || page.globalFontSize || 'md';

  const fontClasses = getFontSizeClasses(currentFontSize);

  const handleFontSizeChange = (newSize: FontSizeScale) => {
    if (onResizeWidget) {
      onResizeWidget({ fontSize: newSize });
    } else {
      const currentSizes = page.widgetSizes || {};
      onUpdate({
        widgetSizes: {
          ...currentSizes,
          tasks: { ...(currentSizes.tasks || {}), fontSize: newSize },
        },
      });
    }
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted && completedCount + 1 === tasks.length) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });
    onUpdate({ tasks: updated });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newTaskText.trim(),
      completed: false,
    };

    onUpdate({ tasks: [...tasks, newTask] });
    setNewTaskText('');
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdate({ tasks: tasks.filter((t) => t.id !== taskId) });
  };

  const startEditTask = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditTaskDraft(task.text);
  };

  const saveEditTask = (taskId: string) => {
    if (editTaskDraft.trim()) {
      const updated = tasks.map((t) =>
        t.id === taskId ? { ...t, text: editTaskDraft.trim() } : t
      );
      onUpdate({ tasks: updated });
    }
    setEditingTaskId(null);
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(index, 1);
    newTasks.splice(targetIndex, 0, moved);
    onUpdate({ tasks: newTasks });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden select-text">
      {/* Subheader */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-300 dark:border-white/15 shrink-0 pr-9">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {completedCount} of {tasks.length} finished ({progressPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <FontSizeControl fontSize={currentFontSize} onChange={handleFontSizeChange} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 shrink-0">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-sky-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tasks List with Move & Inline Edit capability */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2">
        {tasks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-600 dark:text-slate-300 font-medium">
            <Sparkles className="w-8 h-8 mb-2 text-indigo-500/60" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No tasks set</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Add bellringers, activities, or instructions below.
            </p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id || `task-${index}`}
                className={`group flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-emerald-500/15 border-emerald-500/30'
                    : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-100'
                }`}
              >
                {/* Reorder / Move Buttons */}
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    title="Move up"
                    aria-label="Move task up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, 'down')}
                    disabled={index === tasks.length - 1}
                    className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    title="Move down"
                    aria-label="Move task down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Completion Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="text-indigo-700 dark:text-indigo-300 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                  title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600" />
                  )}
                </button>

                {/* Content: Either Editable Input or Text Span */}
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editTaskDraft}
                      onChange={(e) => setEditTaskDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditTask(task.id);
                        if (e.key === 'Escape') setEditingTaskId(null);
                      }}
                      autoFocus
                      className={`flex-1 px-2.5 py-1 text-xs rounded-lg border-2 border-indigo-600 focus:outline-none ${
                        isLight ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => saveEditTask(task.id)}
                      className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      title="Save changes"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span
                    onDoubleClick={() => startEditTask(task)}
                    className={`flex-1 ${fontClasses.text} leading-relaxed font-medium select-text cursor-text ${
                      task.completed
                        ? 'line-through text-slate-500 dark:text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                    title="Double click to edit instructions"
                  >
                    {task.text}
                  </span>
                )}

                {/* Action Buttons: Edit & Delete */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditTask(task)}
                      className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-all cursor-pointer"
                      title="Edit task sentence / instruction"
                      aria-label="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 transition-all cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Input Form */}
      <form
        onSubmit={handleAddTask}
        className="pt-2 border-t border-slate-300 dark:border-white/15 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add new task or classroom instruction..."
          className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 focus:bg-white'
              : 'bg-white/10 border-white/20 text-white focus:border-indigo-400 focus:bg-white/15'
          }`}
        />

        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
