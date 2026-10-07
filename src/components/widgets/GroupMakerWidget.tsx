import React, { useState, useEffect } from 'react';
import {
  Users,
  Shuffle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassRoster } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ClassRosterManagerModal } from './ClassRosterManagerModal';

interface GroupMakerWidgetProps {
  roster: string[];
  classes: ClassRoster[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onSaveClasses: (classes: ClassRoster[], newId?: string) => void;
  onClose?: () => void;
}

export const GroupMakerWidget: React.FC<GroupMakerWidgetProps> = ({
  roster,
  classes,
  activeClassId,
  onSelectClass,
  onSaveClasses,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
  const currentClass = classes.find((c) => c.id === activeClassId) || classes[0] || {
    id: 'default',
    name: 'Class',
    students: [],
  };
  const allStudents = currentClass?.students || roster || [];

  const [groupCount, setGroupCount] = useState<number>(4);
  const [createdGroups, setCreatedGroups] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);

  // Automatically reset generated groups when active class changes so old/prepublished groups never linger
  useEffect(() => {
    setCreatedGroups([]);
  }, [activeClassId, allStudents.length]);

  // Group generation logic
  const handleGenerateGroups = () => {
    if (allStudents.length === 0) return;

    const shuffled = [...allStudents].sort(() => Math.random() - 0.5);
    const numGroups = Math.max(1, Math.min(groupCount, allStudents.length));
    const result: string[][] = Array.from({ length: numGroups }, () => []);

    shuffled.forEach((student, index) => {
      result[index % numGroups].push(student);
    });

    setCreatedGroups(result);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleResetGroups = () => {
    setCreatedGroups([]);
  };

  const handleCopyGroups = () => {
    if (createdGroups.length === 0) return;
    const text = createdGroups
      .map((grp, i) => `Group ${i + 1}:\n${grp.map((s) => `• ${s}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full justify-between gap-2.5">
      {/* Top: Controls */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <select
          value={activeClassId}
          onChange={(e) => onSelectClass(e.target.value)}
          className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-300 text-slate-900'
              : 'bg-slate-800 border-white/20 text-white'
          }`}
          title="Select active subject / class"
        >
          {classes.map((cls) => (
            <option
              key={cls.id}
              value={cls.id}
              className={isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}
            >
              {cls.name} ({cls.students.length} students)
            </option>
          ))}
        </select>

        {/* Group Count Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Groups:</span>
          <select
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className={`px-2 py-1.5 text-xs font-bold rounded-xl border focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900'
                : 'bg-slate-800 border-white/20 text-white'
            }`}
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n} className={isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Publish / Edit Names Button */}
        <button
          onClick={() => setIsClassManagerOpen(true)}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            isLight
              ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-900'
              : 'bg-cyan-900/30 hover:bg-cyan-900/50 border-cyan-500/30 text-cyan-200'
          }`}
          title="Publish your own student names and subjects for this class"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publish Roster</span>
        </button>
      </div>

      {/* Group Display Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
        {allStudents.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-slate-600 dark:text-slate-300">
            <Users className="w-8 h-8 mb-1.5 text-cyan-600 dark:text-cyan-400 opacity-60" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              No students in {currentClass.name}
            </span>
            <button
              onClick={() => setIsClassManagerOpen(true)}
              className="mt-2 px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Add & Publish Student Names
            </button>
          </div>
        ) : createdGroups.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-600 dark:text-slate-300">
            <Users className="w-8 h-8 mb-1.5 opacity-50" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Ready to group {allStudents.length} students</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Click "Generate Groups" to sort into {groupCount} random teams.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {createdGroups.map((group, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-300 dark:border-white/10">
                  <span className="text-[11px] font-black text-cyan-700 dark:text-cyan-300">
                    Group {idx + 1}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                    {group.length} students
                  </span>
                </div>
                <ul className="space-y-1">
                  {group.map((student, sIdx) => (
                    <li
                      key={sIdx}
                      className="text-xs font-medium truncate text-slate-900 dark:text-slate-100"
                    >
                      • {student}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 shrink-0">
        <button
          onClick={handleGenerateGroups}
          disabled={allStudents.length === 0}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>{createdGroups.length > 0 ? 'Re-shuffle Groups' : 'Generate Groups'}</span>
        </button>

        {createdGroups.length > 0 && (
          <>
            <button
              onClick={handleResetGroups}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
              title="Clear generated groups"
              aria-label="Clear groups"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={handleCopyGroups}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
              title="Copy groups to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Class & Student Manager Modal */}
      <ClassRosterManagerModal
        isOpen={isClassManagerOpen}
        onClose={() => setIsClassManagerOpen(false)}
        classes={classes}
        activeClassId={activeClassId}
        onSaveClasses={onSaveClasses}
        onSelectClass={onSelectClass}
      />
    </div>
  );
};
