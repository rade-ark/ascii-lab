import React, { useState, useEffect, useRef } from 'react';
import { Component13021182101 } from '../imports/Frame3';
import Frame4 from '../imports/Frame4';
import Frame3 from '../imports/Frame3-2175-30';

type CursorState = 'default' | 'grab' | 'grabbing' | 'pointer';

interface CustomCursorProps {
  cursorState: CursorState;
  isVisible?: boolean;
}

export function CustomCursor({ cursorState, isVisible = true }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      // Clear existing timeout
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      
      // Set timeout to hide moving state
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 100);
    };

    if (isVisible) {
      document.addEventListener('mousemove', updateCursorPosition);
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', updateCursorPosition);
      document.body.style.cursor = 'auto';
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const renderCursor = () => {
    switch (cursorState) {
      case 'grab':
      case 'grabbing':
        return (
          <div className="w-6 h-6 scale-[1.5]">
            <Frame3 />
          </div>
        );
      case 'pointer':
        return (
          <div className="w-6 h-6 scale-[0.04]">
            <Component13021182101 />
          </div>
        );
      case 'default':
      default:
        return (
          <div className="w-6 h-6 scale-[1.5]">
            <Frame4 />
          </div>
        );
    }
  };

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 ${
        isMoving ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'top left'
      }}
    >
      {renderCursor()}
    </div>
  );
}

// Hook for managing cursor state
export function useCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isVisible, setIsVisible] = useState(false);

  const showCursor = (state: CursorState = 'default') => {
    setCursorState(state);
    setIsVisible(true);
  };

  const hideCursor = () => {
    setIsVisible(false);
  };

  const changeCursorState = (state: CursorState) => {
    setCursorState(state);
  };

  return {
    cursorState,
    isVisible,
    showCursor,
    hideCursor,
    changeCursorState
  };
}