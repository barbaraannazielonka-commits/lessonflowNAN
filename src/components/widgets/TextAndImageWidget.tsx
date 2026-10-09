import React, { useState, useEffect, useRef } from 'react';
import {
  Columns,
  Rows,
  AlignLeft,
  Image as ImageIcon,
  Upload,
  Edit3,
  Check,
  Bold,
  List,
  ListOrdered,
  Heading2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { TextAndImageData, FontSizeScale } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { FontSizeControl, getFontSizeClasses } from './FontSizeControl';

interface TextAndImageWidgetProps {
  data?: TextAndImageData;
  onUpdate: (data: Partial<TextAndImageData>) => void;
  onResizeWidget?: (w: number, h: number) => void;
  onClose?: () => void;
  fontSize?: FontSizeScale;
  onFontSizeChange?: (size: FontSizeScale) => void;
}

export const TextAndImageWidget: React.FC<TextAndImageWidgetProps> = ({
  data,
  onUpdate,
  onClose,
  fontSize = 'md',
  onFontSizeChange,
}) => {
  const { theme, highContrast } = useTheme();
  const isLight = theme === 'light';

  // Synchronize state with data props
  const [textDraft, setTextDraft] = useState(data?.text ?? '');
  const [imageUrlDraft, setImageUrlDraft] = useState(data?.imageUrl ?? '');
  const [layout, setLayout] = useState<'split' | 'stacked' | 'text-only' | 'image-only'>(
    data?.layout || (data?.imageUrl ? 'split' : 'text-only')
  );
  // Default to editing mode if text is blank, or allow 1-click edit
  const [isEditingText, setIsEditingText] = useState(!data?.text);
  const [localFontSize, setLocalFontSize] = useState<FontSizeScale>(fontSize);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (data?.text !== undefined) {
      setTextDraft(data.text);
    }
    if (data?.imageUrl !== undefined) {
      setImageUrlDraft(data.imageUrl);
    }
    if (data?.layout) {
      setLayout(data.layout);
    }
  }, [data?.text, data?.imageUrl, data?.layout]);

  useEffect(() => {
    if (fontSize) setLocalFontSize(fontSize);
  }, [fontSize]);

  const fontClasses = getFontSizeClasses(localFontSize);

  const handleFontSizeUpdate = (newSize: FontSizeScale) => {
    setLocalFontSize(newSize);
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
  };

  const handleTextChange = (newVal: string) => {
    setTextDraft(newVal);
    onUpdate({ text: newVal, layout });
  };

  const handleLayoutChange = (newLayout: 'split' | 'stacked' | 'text-only' | 'image-only') => {
    setLayout(newLayout);
    onUpdate({ layout: newLayout, text: textDraft, imageUrl: imageUrlDraft });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrlDraft(result);
        if (layout === 'text-only') {
          setLayout('split');
          onUpdate({ imageUrl: result, layout: 'split' });
        } else {
          onUpdate({ imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textDraft.substring(start, end) || 'text';
    const before = textDraft.substring(0, start);
    const after = textDraft.substring(end);
    const updated = `${before}${prefix}${selectedText}${suffix}${after}`;
    handleTextChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const insertBullet = () => {
    insertFormatting('• ');
  };

  const insertNumber = () => {
    insertFormatting('1. ');
  };

  const insertBold = () => {
    insertFormatting('**', '**');
  };

  const insertHeading = () => {
    insertFormatting('### ');
  };

  const handleClearText = () => {
    handleTextChange('');
    setIsEditingText(true);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full justify-between gap-2 overflow-hidden select-text">
      {/* Subheader / Control bar with pr-9 for ResizableCard hand drag icon */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-300 dark:border-white/15 shrink-0 pr-9">
        {/* Layout Switchers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleLayoutChange('text-only')}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              layout === 'text-only'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Text Only (Full notes/instructions)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Text</span>
          </button>
          <button
            type="button"
            onClick={() => handleLayoutChange('split')}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              layout === 'split'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Split side-by-side (Text + Image)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Split</span>
          </button>
          <button
            type="button"
            onClick={() => handleLayoutChange('stacked')}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              layout === 'stacked'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Stacked vertical"
          >
            <Rows className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleLayoutChange('image-only')}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              layout === 'image-only'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Image only"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Controls: Font Size, Upload Image, Toggle Edit */}
        <div className="flex items-center gap-1.5 shrink-0">
          <FontSizeControl fontSize={localFontSize} onChange={handleFontSizeUpdate} />

          {layout !== 'text-only' && (
            <label
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-colors"
              title="Upload media image"
            >
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}

          <button
            type="button"
            onClick={() => {
              setIsEditingText(!isEditingText);
              if (!isEditingText) {
                setTimeout(() => textareaRef.current?.focus(), 50);
              }
            }}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isEditingText
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title={isEditingText ? 'Done editing' : 'Edit text'}
          >
            {isEditingText ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span className="text-[11px]">Done</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Edit</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Close Text Widget"
              aria-label="Close Text Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Formatting Bar when editing */}
      {isEditingText && layout !== 'image-only' && (
        <div className="flex items-center gap-1 py-1 px-1.5 bg-slate-100 dark:bg-white/10 rounded-xl shrink-0 flex-wrap">
          <button
            type="button"
            onClick={insertBold}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertHeading}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Heading (### Title)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertBullet}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Bullet point (• )"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertNumber}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Numbered list (1. )"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-white/20 mx-1" />
          <button
            type="button"
            onClick={handleClearText}
            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Clear all text"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-hidden gap-3 min-h-0 ${
          layout === 'split'
            ? 'flex flex-row'
            : layout === 'stacked'
            ? 'flex flex-col'
            : 'flex'
        }`}
      >
        {/* Text Pane: Always clickable to edit, responds instantly */}
        {layout !== 'image-only' && (
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-0 relative select-text">
            {isEditingText ? (
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  ref={textareaRef}
                  value={textDraft}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className={`w-full flex-1 p-3 ${fontClasses.text} rounded-2xl border focus:outline-none resize-none leading-relaxed font-sans transition-colors ${
                    isLight
                      ? 'bg-white border-blue-500 text-slate-900 shadow-inner'
                      : 'bg-slate-800/90 border-blue-400 text-white shadow-inner'
                  }`}
                  placeholder="Type lesson notes, bellringer questions, reading excerpts, or instructions..."
                  autoFocus
                />
              </div>
            ) : (
              <div
                onClick={() => {
                  setIsEditingText(true);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                className={`flex-1 p-3 rounded-2xl border transition-all cursor-text overflow-y-auto leading-relaxed select-text ${
                  isLight
                    ? 'bg-white/80 hover:bg-white border-slate-200 text-slate-900'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                }`}
                title="Click anywhere to edit text"
              >
                {textDraft.trim() ? (
                  <div className={`whitespace-pre-wrap ${fontClasses.text}`}>
                    {textDraft}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-6 h-6 mb-2 text-blue-500/70" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Empty Text & Notes
                    </p>
                    <p className="text-[11px] mt-0.5 text-blue-600 dark:text-blue-400 underline cursor-pointer font-semibold">
                      Click here to start typing instructions or notes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Media / Image Pane */}
        {layout !== 'text-only' && (
          <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/10 dark:bg-black/30 border border-slate-200 dark:border-white/10 relative min-h-[140px]">
            {imageUrlDraft ? (
              <img
                src={imageUrlDraft}
                alt="Classroom media"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <label className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full h-full">
                <Upload className="w-8 h-8 text-blue-500/60 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Upload an image / diagram
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Click to select PNG, JPG, or SVG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
