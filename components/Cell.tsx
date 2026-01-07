
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

  // 1. 位置更新动画
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
            duration: 1.5,
            ease: 'expo.inOut',
          });
        } else if (currentX !== targetX && currentY !== targetY) {
          const tl = gsap.timeline();
          tl.to(cellRef.current, { x: targetX, duration: 0.25, ease: 'power2.inOut' });
          tl.to(cellRef.current, { y: targetY, duration: 0.25, ease: 'power2.out' });
        } else {
          gsap.to(cellRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.4,
            ease: 'power4.out',
          });
        }
      } else {
        gsap.set(cellRef.current, { x: targetX, y: targetY });
      }
      posRef.current = data.position;
    }
  }, [data.position, size, gap, mode]);

  // 2. 特殊格子的持续动效 (玩家与BOSS)
  useEffect(() => {
    if ((data.isPlayer || data.isBoss) && innerRef.current) {
      gsap.to(innerRef.current, {
        borderColor: data.isPlayer ? 'rgba(253, 224, 71, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        backgroundColor: data.isPlayer ? 'rgba(66, 32, 6, 0.4)' : 'rgba(69, 10, 10, 0.4)',
        boxShadow: data.isPlayer ? '0 0 25px rgba(253, 224, 71, 0.2)' : '0 0 25px rgba(239, 68, 68, 0.2)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          y: -2,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }
    }
  }, [data.isPlayer, data.isBoss]);

  // 3. 进场动画
  useEffect(() => {
    gsap.fromTo(cellRef.current, 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }, []);

  const isRevealed = data.isRevealed || data.isPlayer || data.isBoss;
  
  const getStyle = () => {
    if (data.isPlayer) return 'border-yellow-400 text-yellow-300 bg-yellow-900/20 shadow-[0_0_20px_rgba(250,204,21,0.2)]';
    if (data.isBoss) return THEMES[CellType.BOSS];
    if (isRevealed) return THEMES[data.type];
    return 'border-white/[0.08] text-white/10 bg-white/[0.02]';
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
      className="absolute flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size, zIndex: data.isPlayer ? 100 : 10 }}
    >
      <div 
        ref={innerRef}
        className={`w-full h-full rounded-[var(--radius)] border-[1.5px] backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500 ${getStyle()}`}
      >
        {mode === 'EXPLORE' && (
          <span className="absolute top-1 right-1.5 text-[7px] font-bold opacity-20 tabular-nums tracking-tighter">
            {(data.spiralIndex !== undefined ? data.spiralIndex + 1 : 0).toString().padStart(2, '0')}
          </span>
        )}

        <i 
          ref={iconRef as any}
          className={`${getIcon()} text-4xl ${!isRevealed ? 'opacity-20' : 'opacity-90'} mb-1 transition-all duration-500`}
        ></i>
        
        {isRevealed && (
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
            {data.isPlayer ? 'PRIME' : data.isBoss ? 'WAR' : 'LV.' + data.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default Cell;