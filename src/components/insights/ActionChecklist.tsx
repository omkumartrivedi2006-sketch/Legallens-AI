import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Plus,
  Trash2,
  Bookmark,
  CheckCircle2,
  Loader2,
  Filter,
} from 'lucide-react';
import { ChecklistTaskItem, ChecklistTaskStatus, InsightSource } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ActionChecklistProps {
  checklist: ChecklistTaskItem[];
  onUpdateStatus: (itemId: string, status: ChecklistTaskStatus) => Promise<void>;
  onAddTask: (task: Omit<ChecklistTaskItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteTask: (itemId: string) => Promise<void>;
  onOpenSource: (source: InsightSource) => void;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
  checklist,
  onUpdateStatus,
  onAddTask,
  onDeleteTask,
  onOpenSource,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskParty, setNewTaskParty] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const completedCount = checklist.filter((i) => i.status === 'completed').length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = useMemo(() => {
    if (filter === 'completed') return checklist.filter((i) => i.status === 'completed');
    if (filter === 'pending') return checklist.filter((i) => i.status !== 'completed');
    return checklist;
  }, [checklist, filter]);

  const handleToggle = async (item: ChecklistTaskItem) => {
    let nextStatus: ChecklistTaskStatus;
    if (item.status === 'not_started') nextStatus = 'in_progress';
    else if (item.status === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'not_started';

    await onUpdateStatus(item.id, nextStatus);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setSubmittingTask(true);
    try {
      await onAddTask({
        task: newTaskText.trim(),
        responsibleParty: newTaskParty.trim() || 'User',
        deadline: newTaskDeadline.trim() || 'As agreed',
        category: 'Custom Action',
        status: 'not_started',
      });
      setNewTaskText('');
      setNewTaskParty('');
      setNewTaskDeadline('');
      setIsAdding(false);
    } finally {
      setSubmittingTask(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Action Checklist
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {completedCount} of {totalCount} Completed ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive tasks grounded in contractual commitments. Click an item to cycle through Not Started → In Progress → Completed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isAdding ? 'ghost' : 'outline'}
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>{isAdding ? 'Cancel' : 'Add Custom Task'}</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tasks ({checklist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending ({totalCount - completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Add Custom Task Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in"
        >
          <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
            New Custom Action Task
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g. Request formal written confirmation of notice receipt"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Responsible party (e.g. User, Legal counsel)"
                value={newTaskParty}
                onChange={(e) => setNewTaskParty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Deadline (e.g. Before execution, 30 days)"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submittingTask || !newTaskText.trim()}
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submittingTask ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              <span>Save Task</span>
            </Button>
          </div>
        </form>
      )}

      {/* Checklist Tasks List */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-xs text-slate-400 space-y-1">
            <CheckSquare className="h-6 w-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No tasks match the selected filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : isInProgress
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60'
                }`}
              >
                {/* Left check button & task text */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    aria-label={`Cycle status for ${item.task}`}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isInProgress ? (
                      <div className="h-5 w-5 rounded-md border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-xs bg-blue-600 dark:bg-blue-400" />
                      </div>
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-snug cursor-pointer ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                      onClick={() => handleToggle(item)}
                    >
                      {item.task}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      {item.responsibleParty && (
                        <span>Party: <span className="font-medium text-slate-600 dark:text-slate-300">{item.responsibleParty}</span></span>
                      )}
                      {item.deadline && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {item.deadline}
                          </span>
                        </>
                      )}
                      {item.category && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: status badge & actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    onClick={() => handleToggle(item)}
                    className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>

                  {item.source && (
                    <button
                      type="button"
                      onClick={() => onOpenSource(item.source!)}
                      aria-label="View task source citation"
                      className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteTask(item.id)}
                    aria-label="Delete task"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
