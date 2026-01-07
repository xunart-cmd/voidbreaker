
import React, { useEffect, useRef } from 'react';
import { CellData, THEMES, ICONS, HINT_ICONS, CellType } from '../types';
import gsap from 'gsap';

interface CellProps {
  data: CellData;
  size: number;
  gap: number;
  mode: 'EXPLORE' | 'ARENA';
}

const Cell: React.FC<CellProps> = ({ data, size, gap, mode }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null);
  const posRef = useRef(data.position);

  // 1. Positioning & Animation
  useEffect(() => {
    if (cellRef.current) {
      const targetX = data.position.x * (size + gap);
      const targetY = data.position.y * (size + gap);
      
      const currentX = posRef.current.x * (size + gap);
      const currentY = posRef.current.y * (size + gap);

      if (currentX !== targetX || currentY !== targetY) {
        if (mode === 'ARENA') {
          gsap.to(cellRef.current, {
            x: targetX,
            y: targetY,
            duration: 1.0,
            ease: 'expo.inOut',
          });
        } else {
          gsap.to(cellRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.4,
            ease: 'power3.out',
          });
        }
      } else {
        gsap.set(cellRef.current, { x: targetX, y: targetY });
      }
      posRef.current = data.position;
    }
  }, [data.position, size, gap, mode]);

  // 2. Continuous Effects (Player/Boss)
  useEffect(() => {
    if ((data.isPlayer || data.isBoss) && innerRef.current) {
      gsap.to(innerRef.current, {
        borderColor: data.isPlayer ? 'rgba(253, 224, 71, 0.9)' : 'rgba(239, 68, 68, 0.9)',
        backgroundColor: data.isPlayer ? 'rgba(100, 80, 0, 0.3)' : 'rgba(100, 0, 0, 0.3)',
        boxShadow: data.isPlayer ? '0 0 30px rgba(253, 224, 71, 0.3)' : '0 0 30px rgba(239, 68, 68, 0.3)',
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [data.isPlayer, data.isBoss]);

  // 3. Mount Animation
  useEffect(() => {
    gsap.fromTo(cellRef.current, 
      { scale: 0.8, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }, []);

  const isRevealed = data.isRevealed || data.isPlayer || data.isBoss;
  
  const getStyle = () => {
    if (data.isPlayer) return 'border-yellow-400 text-yellow-300 bg-yellow-500/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]';
    if (data.isBoss) return THEMES[CellType.BOSS];
    if (isRevealed) return THEMES[data.type];
    // Significantly more visible default state
    return 'border-white/10 text-white/20 bg-white/5 backdrop-blur-[2px] shadow-inner';
  };

  const getIcon = () => {
    if (data.isPlayer) return 'ph-shield-check-fill';
    if (data.isBoss) return 'ph-skull-fill';
    if (data.variantIcon && !isRevealed) return data.variantIcon;
    if (isRevealed) return ICONS[data.type];
    return (HINT_ICONS as any)[data.type] || 'ph-cube';
  };

  return (
    <div
      ref={cellRef}
      className="absolute top-0 left-0 flex items-center justify-center pointer-events-none"
      style={{ 
        width: size, 
        height: size, 
        zIndex: data.isPlayer ? 100 : (data.isBoss ? 50 : 10) 
      }}
    >
      <div 
        ref={innerRef}
        className={`w-full h-full rounded-[var(--radius)] border-[1.5px] flex flex-col items-center justify-center transition-all duration-300 ${getStyle()}`}
      >
        {mode === 'EXPLORE' && (
          <span className="absolute top-1 right-1.5 text-[7px] font-bold opacity-30 tabular-nums">
            {(data.spiralIndex !== undefined ? data.spiralIndex + 1 : 0).toString().padStart(2, '0')}
          </span>
        )}

        <i 
          ref={iconRef as any}
          className={`${getIcon()} text-4xl ${!isRevealed ? 'opacity-30' : 'opacity-100'} transition-all duration-300`}
        ></i>
        
        {isRevealed && (
          <span className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] opacity-50">
            {data.isPlayer ? 'CORE' : data.isBoss ? 'WAR' : 'LV.' + data.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default Cell;
