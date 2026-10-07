import React, { useState, useRef, useEffect } from 'react';
import { Hand } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ResizableCardProps {
  id: string;
  title?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  width?: number;
  height?: number;
  position?: { x: number; y: number };
  defaultPosition?: { x: number; y: number };
  onMove?: (x: number, y: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (w: number, h: number) => void;
  className?: string;
  children: React.ReactNode;
}

export const ResizableCard: React.FC<ResizableCardProps> = ({
  id,
  title,
  defaultWidth = 520,
  defaultHeight = 480,
  width,
  height,
  position,
  defaultPosition,
  onMove,
  minWidth = 280,
  minHeight = 220,
  maxWidth = 1680,
  maxHeight = 1000,
  onResize,
  className = '',
  children,
}) => {
  const { theme, highContrast } = useTheme();
  const isLight = theme === 'light';

  const cardRef = useRef<HTMLDivElement>(null);
  const [currentWidth, setCurrentWidth] = useState<number>(width || defaultWidth);
  const [currentHeight, setCurrentHeight] = useState<number>(height || defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position state (supports dragging across board)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (position && (position.x !== 0 || position.y !== 0)) return position;
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`card_pos_${id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return defaultPosition || { x: 0, y: 0 };
  });

  const [hasMoved, setHasMoved] = useState<boolean>(() => {
    return Boolean(position && (position.x !== 0 || position.y !== 0)) || Boolean(defaultPosition);
  });

  useEffect(() => {
    if (width) setCurrentWidth(width);
  }, [width]);

  useEffect(() => {
    if (height) setCurrentHeight(height);
  }, [height]);

  useEffect(() => {
    if (position && (position.x !== 0 || position.y !== 0)) {
      setPos(position);
      setHasMoved(true);
    }
  }, [position]);

  // DRAG MOVEMENT HANDLING
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, originX: 0, originY: 0 });

  const startDragging = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();

    const cardEl = cardRef.current;
    if (!cardEl) return;

    let originX = pos.x;
    let originY = pos.y;

    if (!hasMoved) {
      const parentEl = (cardEl.offsetParent as HTMLElement) || cardEl.parentElement || document.body;
      const parentRect = parentEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();
      originX = cardRect.left - parentRect.left + (parentEl.scrollLeft || 0);
      originY = cardRect.top - parentRect.top + (parentEl.scrollTop || 0);
      setPos({ x: originX, y: originY });
      setHasMoved(true);
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      originX,
      originY,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, dragStartRef.current.originX + deltaX);
      const newY = Math.max(0, dragStartRef.current.originY + deltaY);
      setPos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`card_pos_${id}`, JSON.stringify(pos));
        }
        if (onMove) {
          onMove(pos.x, pos.y);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [pos, id, onMove]);

  // RESIZE HANDLING
  const activeResizeType = useRef<'right' | 'bottom' | 'corner' | null>(null);
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, w: defaultWidth, h: defaultHeight });

  const startResizing = (
    e: React.PointerEvent,
    type: 'right' | 'bottom' | 'corner'
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();

    activeResizeType.current = type;
    setIsResizing(true);
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      w: currentWidth,
      h: currentHeight,
    };
  };

  useEffect(() => {
    const handleResizeMove = (e: PointerEvent) => {
      if (!activeResizeType.current) return;
      const deltaX = e.clientX - resizeStartPos.current.mouseX;
      const deltaY = e.clientY - resizeStartPos.current.mouseY;

      let newW = currentWidth;
      let newH = currentHeight;

      if (activeResizeType.current === 'right' || activeResizeType.current === 'corner') {
        newW = Math.min(Math.max(minWidth, resizeStartPos.current.w + deltaX), maxWidth);
        setCurrentWidth(newW);
      }

      if (activeResizeType.current === 'bottom' || activeResizeType.current === 'corner') {
        newH = Math.min(Math.max(minHeight, resizeStartPos.current.h + deltaY), maxHeight);
        setCurrentHeight(newH);
      }
    };

    const handleResizeUp = () => {
      if (activeResizeType.current) {
        activeResizeType.current = null;
        setIsResizing(false);
        if (onResize) {
          onResize(currentWidth, currentHeight);
        }
      }
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeUp);
    };
  }, [currentWidth, currentHeight, minWidth, maxWidth, minHeight, maxHeight, onResize]);

  return (
    <div
      ref={cardRef}
      style={{
        position: hasMoved ? 'absolute' : 'relative',
        left: hasMoved ? `${pos.x}px` : undefined,
        top: hasMoved ? `${pos.y}px` : undefined,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
        maxWidth: '100%',
        zIndex: isDragging ? 40 : 15,
      }}
      className={`group shrink-0 transition-shadow ${
        isDragging ? 'ring-2 ring-sky-500 shadow-2xl opacity-95 select-none' : ''
      } ${isResizing ? 'ring-2 ring-sky-500/50 select-none' : ''} ${className}`}
    >
      {/* Outer Card Body with High Contrast & Dark Mode */}
      <div
        className={`w-full h-full flex flex-col rounded-3xl border shadow-xl backdrop-blur-xl relative transition-all overflow-hidden p-4 sm:p-5 high-contrast-card ${
          highContrast
            ? isLight
              ? 'bg-white border-2 border-black text-black'
              : 'bg-black border-2 border-white text-white'
            : isLight
            ? 'bg-white/95 border-slate-300 text-slate-900 shadow-xl'
            : 'bg-slate-900/95 border-white/20 text-slate-100 shadow-2xl'
        }`}
      >
        {/* Sleek Hand Drag Handle: Just a hand icon (no full-line drag-to-move bar taking space) */}
        <div
          onPointerDown={startDragging}
          className="absolute top-3.5 right-3.5 z-30 flex items-center justify-center p-1.5 rounded-xl bg-slate-200/90 hover:bg-sky-500 hover:text-white dark:bg-slate-800/90 dark:hover:bg-sky-500 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-all backdrop-blur-md touch-none select-none group/hand"
          title="Drag hand to move widget anywhere on the board"
          aria-label={`Drag hand to move ${title || 'widget'}`}
        >
          <Hand className="w-4 h-4 transition-transform group-hover/hand:scale-110" />
        </div>

        {/* Card Content Area - full vertical height */}
        <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
          {children}
        </div>
      </div>

      {/* Global transparent overlay during drag/resize to prevent iframes (YouTube) from eating pointer events */}
      {(isDragging || isResizing) && (
        <div className="fixed inset-0 z-50 pointer-events-auto cursor-grabbing" />
      )}

      {/* Live Movement Badge */}
      {isDragging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-sky-600 text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-xl border border-white/30 pointer-events-none animate-in fade-in">
          Repositioning ({Math.round(pos.x)}, {Math.round(pos.y)})
        </div>
      )}

      {/* Live Dimension Pill during Resizing */}
      {isResizing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20 pointer-events-none animate-in fade-in">
          {Math.round(currentWidth)} × {Math.round(currentHeight)} px
        </div>
      )}

      {/* Right Edge Touch/Drag Handle */}
      <div
        onPointerDown={(e) => startResizing(e, 'right')}
        className="absolute top-2 bottom-2 -right-2 w-5 cursor-ew-resize z-20 flex items-center justify-center hover:bg-sky-500/25 active:bg-sky-500/50 rounded-full transition-all touch-none select-none"
        title="Touch & drag edge to adjust width"
      >
        <div className="w-1.5 h-10 rounded-full bg-slate-300/80 dark:bg-white/25 group-hover:bg-sky-500 group-hover:opacity-100 opacity-40 transition-all shadow-sm" />
      </div>

      {/* Bottom Edge Touch/Drag Handle */}
      <div
        onPointerDown={(e) => startResizing(e, 'bottom')}
        className="absolute -bottom-2 left-2 right-2 h-5 cursor-ns-resize z-20 flex items-center justify-center hover:bg-sky-500/25 active:bg-sky-500/50 rounded-full transition-all touch-none select-none"
        title="Touch & drag bottom edge to adjust height"
      >
        <div className="h-1.5 w-10 rounded-full bg-slate-300/80 dark:bg-white/25 group-hover:bg-sky-500 group-hover:opacity-100 opacity-40 transition-all shadow-sm" />
      </div>

      {/* Bottom-Right Corner Touch/Drag Handle */}
      <div
        onPointerDown={(e) => startResizing(e, 'corner')}
        className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-20 flex items-center justify-center hover:bg-sky-500/30 active:bg-sky-500/60 rounded-full transition-all touch-none select-none"
        title="Touch & drag corner to resize both width and height"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-white/40 group-hover:bg-sky-500 group-hover:scale-125 transition-all shadow-sm" />
      </div>
    </div>
  );
};
