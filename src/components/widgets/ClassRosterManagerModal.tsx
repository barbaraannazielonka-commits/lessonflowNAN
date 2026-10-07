import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ClassRoster } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ClassRosterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoster[];
  activeClassId: string;
  onSaveClasses: (classes: ClassRoster[], newActiveId?: string) => void;
  onSelectClass: (id: string) => void;
}

export const ClassRosterManagerModal: React.FC<ClassRosterManagerModalProps> = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onSaveClasses,
  onSelectClass,
}) => {
  const { theme, highContrast } = useTheme();
  const isLight = theme === 'light';

  const [localClasses, setLocalClasses] = useState<ClassRoster[]>(classes);
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId);
  const [editingClassName, setEditingClassName] = useState<string>('');
  const [isRenamingClass, setIsRenamingClass] = useState<boolean>(false);
  const [studentsText, setStudentsText] = useState<string>('');
  const [newClassNameInput, setNewClassNameInput] = useState<string>('');
  const [showAddClassInput, setShowAddClassInput] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalClasses(classes);
      setSelectedClassId(activeClassId);
      const activeCls = classes.find((c) => c.id === activeClassId) || classes[0];
      if (activeCls) {
        setStudentsText(activeCls.students.join('\n'));
        setEditingClassName(activeCls.name);
      }
      setIsRenamingClass(false);
      setShowAddClassInput(false);
      setStatusMsg(null);
    }
  }, [isOpen, classes, activeClassId]);

  // When selected class changes within modal
  const handleSelectLocalClass = (id: string) => {
    // Save current textarea changes to local class before switching
    const parsedStudents = studentsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setLocalClasses((prev) =>
      prev.map((c) => (c.id === selectedClassId ? { ...c, students: parsedStudents } : c))
    );

    setSelectedClassId(id);
    const target = localClasses.find((c) => c.id === id);
    if (target) {
      setStudentsText(target.students.join('\n'));
      setEditingClassName(target.name);
    }
    setIsRenamingClass(false);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentClass =
    localClasses.find((c) => c.id === selectedClassId) || localClasses[0] || {
      id: 'default',
      name: 'Class 1',
      students: [],
    };

  const parsedCurrentStudents = studentsText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Add new class / subject
  const handleAddNewClass = () => {
    if (!newClassNameInput.trim()) return;
    const newClass: ClassRoster = {
      id: `class-${Date.now()}`,
      name: newClassNameInput.trim(),
      students: [],
    };
    const updated = [...localClasses, newClass];
    setLocalClasses(updated);
    setSelectedClassId(newClass.id);
    setStudentsText('');
    setEditingClassName(newClass.name);
    setNewClassNameInput('');
    setShowAddClassInput(false);
  };

  // Rename class
  const handleSaveRename = () => {
    if (!editingClassName.trim()) return;
    setLocalClasses((prev) =>
      prev.map((c) => (c.id === selectedClassId ? { ...c, name: editingClassName.trim() } : c))
    );
    setIsRenamingClass(false);
  };

  // Delete class
  const handleDeleteClass = (id: string) => {
    if (localClasses.length <= 1) {
      setStatusMsg('You must have at least one class.');
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }
    const remaining = localClasses.filter((c) => c.id !== id);
    setLocalClasses(remaining);
    const nextActive = remaining[0];
    setSelectedClassId(nextActive.id);
    setStudentsText(nextActive.students.join('\n'));
    setEditingClassName(nextActive.name);
  };

  // Clear demo students in 1 click
  const handleClearStudents = () => {
    setStudentsText('');
    setStatusMsg('Cleared student names for this class.');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // Clear all sample / prepublished data and start completely fresh
  const handleClearAllSampleData = () => {
    const blankClass: ClassRoster = {
      id: `class-${Date.now()}`,
      name: 'My Class',
      students: [],
    };
    setLocalClasses([blankClass]);
    setSelectedClassId(blankClass.id);
    setStudentsText('');
    setEditingClassName(blankClass.name);
    setStatusMsg('Cleared sample data. You can now add your own classes and student names!');
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Save all & publish
  const handleSaveAndPublish = () => {
    const parsedStudents = studentsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const finalClasses = localClasses.map((c) =>
      c.id === selectedClassId ? { ...c, name: editingClassName.trim() || c.name, students: parsedStudents } : c
    );

    onSaveClasses(finalClasses, selectedClassId);
    onSelectClass(selectedClassId);
    onClose();
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          highContrast
            ? isLight
              ? 'bg-white border-2 border-black text-black'
              : 'bg-black border-2 border-white text-white'
            : isLight
            ? 'bg-white text-slate-900 border-slate-300 shadow-2xl'
            : 'bg-slate-900 text-white border-white/20 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-300 dark:border-white/15 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Manage Classes, Subjects & Students
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Enter your own subjects and student names for Randomizer & Groups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-slate-300 dark:border-white/20"
            title="Close (Esc)"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className="px-5 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Choose or Add Class / Subject */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Select Subject / Class:
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllSampleData}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Remove all demo/sample classes and start with a clean slate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Start Blank / Clear Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClassInput(!showAddClassInput)}
                  className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add New Subject</span>
                </button>
              </div>
            </div>

            {/* Quick Class Pills */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {localClasses.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleSelectLocalClass(cls.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-800 shadow-md ring-2 ring-purple-500/30'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                    }`}
                  >
                    <span>{cls.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isLight
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-white/20 text-slate-200'
                      }`}
                    >
                      {cls.id === selectedClassId ? parsedCurrentStudents.length : cls.students.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* New Class Input Form */}
            {showAddClassInput && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center gap-2 mb-3 animate-in fade-in">
                <input
                  type="text"
                  value={newClassNameInput}
                  onChange={(e) => setNewClassNameInput(e.target.value)}
                  placeholder="e.g. English 10A, Biology, History..."
                  className={`flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-slate-800 border-white/20 text-white focus:border-purple-400'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNewClass();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewClass}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
              </div>
            )}

            {/* Active Class Rename & Delete Controls */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">
                  Editing:
                </span>
                {isRenamingClass ? (
                  <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                    <input
                      type="text"
                      value={editingClassName}
                      onChange={(e) => setEditingClassName(e.target.value)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-bold flex-1 ${
                        isLight
                          ? 'bg-white border-purple-500 text-slate-900'
                          : 'bg-slate-800 border-purple-400 text-white'
                      }`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') setIsRenamingClass(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveRename}
                      className="px-2.5 py-1 bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {currentClass.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRenamingClass(true)}
                      className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 p-1 rounded"
                      title="Rename this subject"
                      aria-label="Rename subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {localClasses.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteClass(selectedClassId)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-bold shrink-0 ml-2"
                  title="Delete this class"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Class</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Enter / Paste Student Names */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>2. Students in {currentClass.name}:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-700 dark:text-purple-300 font-extrabold text-[11px]">
                  {parsedCurrentStudents.length} Students
                </span>
              </label>

              {parsedCurrentStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearStudents}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  title="Clear demo or all student names"
                >
                  Clear All Names
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
              Type or paste your student names below (one name per line or separated by commas):
            </p>

            <textarea
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              rows={8}
              placeholder="Paste or type names here, e.g.:&#10;Emma Watson&#10;Lucas Miller&#10;Sarah Connor&#10;David Bowie..."
              className={`w-full p-3.5 text-xs font-medium rounded-2xl border focus:outline-none transition-colors leading-relaxed ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                  : 'bg-slate-800 border-white/20 text-white focus:border-purple-400'
              }`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Saved to your browser storage automatically
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-300 dark:border-white/20 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndPublish}
              className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Publish Roster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
