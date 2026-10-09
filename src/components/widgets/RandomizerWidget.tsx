import React, { useState } from 'react';
import {
  Users2,
  Sparkles,
  RotateCcw,
  UserCheck,
  Settings,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassRoster } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ClassRosterManagerModal } from './ClassRosterManagerModal';

interface RandomizerWidgetProps {
  roster: string[];
  classes: ClassRoster[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onSaveClasses: (classes: ClassRoster[], newId?: string) => void;
}

export const RandomizerWidget: React.FC<RandomizerWidgetProps> = ({
  roster,
  classes,
  activeClassId,
  onSelectClass,
  onSaveClasses,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayRollName, setDisplayRollName] = useState('');
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);
  const [excludeAlreadyPicked, setExcludeAlreadyPicked] = useState(true);

  // Manage Classes & Students modal
  const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);

  const currentClass = classes.find((c) => c.id === activeClassId) || classes[0] || {
    id: 'default',
    name: 'Class',
    students: [],
  };
  const allStudents = currentClass?.students || roster || [];

  // Eligible students
  const availableStudents = excludeAlreadyPicked
    ? allStudents.filter((s) => !pickedHistory.includes(s))
    : allStudents;

  const handlePickRandom = () => {
    if (allStudents.length === 0) return;

    const pool = availableStudents.length > 0 ? availableStudents : allStudents;
    if (availableStudents.length === 0) {
      setPickedHistory([]);
    }

    setIsRolling(true);
    let counter = 0;
    const maxTicks = 16;
    const intervalTime = 60;

    const interval = setInterval(() => {
      counter++;
      const randName = pool[Math.floor(Math.random() * pool.length)];
      setDisplayRollName(randName);

      if (counter >= maxTicks) {
        clearInterval(interval);
        const finalWinner = pool[Math.floor(Math.random() * pool.length)];
        setDisplayRollName(finalWinner);
        setPickedStudent(finalWinner);
        setIsRolling(false);
        setPickedHistory((prev) => [finalWinner, ...prev]);

        // Celebration confetti
        try {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }, intervalTime);
  };

  const handleResetHistory = () => {
    setPickedHistory([]);
    setPickedStudent(null);
  };

  return (
    <div className="flex flex-col h-full justify-between gap-2.5">
      {/* Top: Class Selector & Manage Classes button */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <select
          value={activeClassId}
          onChange={(e) => onSelectClass(e.target.value)}
          className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-300 text-slate-900'
              : 'bg-slate-800 border-white/20 text-white'
          }`}
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

        <button
          onClick={() => setIsClassManagerOpen(true)}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            isLight
              ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
              : 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-500/30 text-purple-200'
          }`}
          title="Edit students and subjects"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit Names</span>
        </button>
      </div>

      {/* Main Display: Picked Student Name or Rolling text */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-3 my-1">
        {allStudents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-3 text-slate-600 dark:text-slate-300">
            <Users2 className="w-8 h-8 text-purple-600 dark:text-purple-400 opacity-60" />
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              No students in {currentClass.name}
            </p>
            <button
              onClick={() => setIsClassManagerOpen(true)}
              className="mt-1 px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Add Student Names
            </button>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            <div className="min-h-[64px] flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25">
              <span
                className={`font-black tracking-tight transition-all ${
                  isRolling
                    ? 'text-xl sm:text-2xl text-purple-700 dark:text-purple-300 animate-pulse'
                    : pickedStudent
                    ? 'text-2xl sm:text-3xl text-slate-900 dark:text-white font-black'
                    : 'text-sm font-semibold text-slate-600 dark:text-slate-300'
                }`}
              >
                {isRolling
                  ? displayRollName
                  : pickedStudent || 'Ready to pick student...'}
              </span>
            </div>

            {/* Remaining Count */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1">
              <span>
                Available: {availableStudents.length} / {allStudents.length}
              </span>
              {pickedHistory.length > 0 && (
                <button
                  onClick={handleResetHistory}
                  className="hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer font-bold"
                  title="Reset picked history"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset pool</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls & Pick Button */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs px-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 font-bold select-none text-[11px]">
            <input
              type="checkbox"
              checked={excludeAlreadyPicked}
              onChange={(e) => setExcludeAlreadyPicked(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span>Don't pick same student twice</span>
          </label>
        </div>

        <button
          onClick={handlePickRandom}
          disabled={isRolling || allStudents.length === 0}
          className="w-full py-2.5 px-4 rounded-2xl bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>{isRolling ? 'Picking Student...' : 'Pick Student'}</span>
        </button>
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
