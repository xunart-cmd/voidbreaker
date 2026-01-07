
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CellData, Position, CellType, 
  GRID_COLS, GRID_ROWS, GameMode, DECOR_ICONS
} from './types';
import { FIXED_SPIRAL_PATH } from './utils/spiral';
import Cell from './components/Cell';
import gsap from 'gsap';

type ArenaStatus = 'NONE' | 'LOADING' | 'FACE_OFF' | 'CLASH' | 'SUSPENSE' | 'VICTORY' | 'DEFEAT';

const App: React.FC = () => {
  const [cells, setCells] = useState<CellData[]>([]);
  const [turn, setTurn] = useState(0);
  const [playerPower, setPlayerPower] = useState(1);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [mode, setMode] = useState<GameMode>('EXPLORE');
  const [stage, setStage] = useState(1);
  const [isBusy, setIsBusy] = useState(false);
  const [arenaStatus, setArenaStatus] = useState<ArenaStatus>('NONE');
  
  const cellsRef = useRef<CellData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getRandomDecor = () => DECOR_ICONS[Math.floor(Math.random() * DECOR_ICONS.length)];

  const initGrid = useCallback((lvl: number) => {
    const newCells: CellData[] = [];
    const types = [CellType.FIRE, CellType.WATER, CellType.EARTH, CellType.AIR];
    const bossOrbitIdx = Math.floor(Math.random() * 8) + 8; 

    FIXED_SPIRAL_PATH.forEach((pos, idx) => {
      const isPlayer = pos.x === 0 && pos.y === 5; 
      const isBoss = idx === bossOrbitIdx;
      
      newCells.push({
        id: `cell-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        type: isBoss ? CellType.BOSS : types[Math.floor(Math.random() * types.length)],
        level: isBoss ? lvl * 5 : Math.max(1, Math.floor(Math.random() * 3)),
        position: { ...pos },
        isPlayer,
        isBoss,
        isRevealed: false,
        spiralIndex: idx,
        variantIcon: isPlayer || isBoss ? undefined : getRandomDecor()
      });
    });

    setCells(newCells);
    cellsRef.current = newCells;
    setMode('EXPLORE');
    setArenaStatus('NONE');
    document.getElementById('fluid-bg')?.classList.remove('arena-active');
  }, []);

  // Guarantee initialization
  useEffect(() => {
    initGrid(stage);
  }, [stage, initGrid]);

  const updateVisualFocus = useCallback((pos: Position, currentMode: GameMode) => {
    const cellSize = 88;
    const gap = 8;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Center of player cell in screen space
    const playerCenterX = rect.left + 8 + (pos.x * (cellSize + gap)) + (cellSize / 2);
    const playerCenterY = rect.top + 8 + (pos.y * (cellSize + gap)) + (cellSize / 2);

    // 1. Move the underlying light source
    gsap.to('#light-source', {
      left: playerCenterX,
      top: playerCenterY,
      duration: 0.6,
      ease: 'power2.out'
    });

    // 2. Move background fluid to track player
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const offsetX = playerCenterX - winW / 2;
    const offsetY = playerCenterY - winH / 2;

    gsap.to('#fluid-bg', {
      x: offsetX,
      y: offsetY,
      xPercent: -50,
      yPercent: -50,
      duration: 1.0,
      ease: 'sine.out'
    });
  }, []);

  useEffect(() => {
    const player = cells.find(c => c.isPlayer);
    if (player) {
      updateVisualFocus(player.position, mode);
    }
  }, [cells, mode, updateVisualFocus]);

  const startArenaRitual = useCallback(async (playerCell: CellData, bossCell: CellData) => {
    setIsBusy(true);
    setArenaStatus('LOADING');
    
    gsap.to(containerRef.current, { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
    
    setCells([]); 
    await new Promise(resolve => setTimeout(resolve, 400));

    setMode('ARENA');
    setArenaStatus('FACE_OFF');
    document.getElementById('fluid-bg')?.classList.add('arena-active');

    const initialState = [
      { ...playerCell, position: { x: 0, y: 0.5 } as any },
      { ...bossCell, position: { x: 3, y: 0.5 } as any, isRevealed: true }
    ];
    setCells(initialState);
    await new Promise(resolve => setTimeout(resolve, 300));

    setArenaStatus('CLASH');
    const clashState = [
      { ...playerCell, position: { x: 1, y: 0.5 } as any },
      { ...bossCell, position: { x: 2, y: 0.5 } as any, isRevealed: true }
    ];
    setCells(clashState);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setArenaStatus('SUSPENSE');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const playerWins = Math.random() > 0.25; 
    if (playerWins) {
      setArenaStatus('VICTORY');
      setTimeout(() => {
        setStage(s => s + 1);
        setPlayerLevel(pl => pl + 1);
        setPlayerPower(p => p + 0.1);
        initGrid(stage + 1);
        setIsBusy(false);
      }, 1000);
    } else {
      setArenaStatus('DEFEAT');
      setTimeout(() => {
        setStage(1);
        setPlayerLevel(1);
        initGrid(1);
        setIsBusy(false);
      }, 2000);
    }
  }, [stage, initGrid]);

  const movePlayer = useCallback(async (dir: 'W' | 'A' | 'S' | 'D') => {
    if (isBusy || mode === 'ARENA') return;

    const player = cellsRef.current.find(c => c.isPlayer);
    if (!player) return;

    let targetPos: Position = { ...player.position };
    if (dir === 'W') targetPos.y -= 1;
    if (dir === 'S') targetPos.y += 1;
    if (dir === 'A') targetPos.x -= 1;
    if (dir === 'D') targetPos.x += 1;

    if (targetPos.x < 0 || targetPos.x >= GRID_COLS || targetPos.y < 0 || targetPos.y >= GRID_ROWS) return;

    const targetCell = cellsRef.current.find(c => c.position.x === targetPos.x && c.position.y === targetPos.y);
    if (!targetCell) return;

    gsap.to(containerRef.current, {
      x: dir === 'A' ? -4 : dir === 'D' ? 4 : 0,
      y: dir === 'W' ? -4 : dir === 'S' ? 4 : 0,
      duration: 0.05,
      yoyo: true,
      repeat: 3,
      onComplete: () => gsap.set(containerRef.current, { x: 0, y: 0 })
    });

    if (targetCell.isBoss) {
      startArenaRitual(player, targetCell);
      return;
    }

    setIsBusy(true);

    const oldPIdx = player.spiralIndex!;
    const newPIdx = targetCell.spiralIndex!;
    
    const updatedCells = cellsRef.current.map(c => {
      if (c.id === player.id) return { ...c, position: targetPos, spiralIndex: newPIdx };
      return c;
    });

    let finalBatch = updatedCells.filter(c => c.id !== targetCell.id);
    let currentHole = oldPIdx;
    let nextToPull = oldPIdx + 1;

    while (nextToPull < 24) {
      if (nextToPull === newPIdx) {
        nextToPull++;
        continue;
      }
      const cellToMove = finalBatch.find(c => c.spiralIndex === nextToPull);
      if (cellToMove) {
        cellToMove.spiralIndex = currentHole;
        cellToMove.position = { ...FIXED_SPIRAL_PATH[currentHole] };
        currentHole = nextToPull;
      }
      nextToPull++;
    }

    const nextType = (targetCell.type + 1) % 4;
    let nextLevel = Math.max(1, Math.floor(turn / 5));
    const levelLimit = playerLevel + 2;
    if (nextLevel > levelLimit) nextLevel = levelLimit;

    finalBatch.push({
      id: `cell-new-${Date.now()}`,
      type: nextType,
      level: nextLevel,
      position: { ...FIXED_SPIRAL_PATH[currentHole] },
      isPlayer: false,
      isBoss: false,
      isRevealed: false,
      spiralIndex: currentHole,
      variantIcon: getRandomDecor()
    });

    setTurn(t => t + 1);
    setCells([...finalBatch]);
    cellsRef.current = finalBatch;
    
    setTimeout(() => setIsBusy(false), 500);
  }, [mode, isBusy, turn, playerLevel, startArenaRitual]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (['W','A','S','D'].includes(k)) movePlayer(k as any);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePlayer]);

  const exploreW = GRID_COLS * 88 + (GRID_COLS - 1) * 8 + 16;
  const exploreH = GRID_ROWS * 88 + (GRID_ROWS - 1) * 8 + 16;
  const arenaW = 4 * 88 + 3 * 8 + 16;
  const arenaH = 2 * 88 + 1 * 8 + 16;

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen">
      <div className="w-full max-w-[420px] flex justify-between items-end mb-8 border-b border-white/10 pb-6">
        <div className="group">
          <h2 className="text-[11px] font-bold text-zinc-500 tracking-[0.5em] mb-1 uppercase group-hover:text-yellow-400 transition-colors">Sector L-{stage}</h2>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">VOID<span className="text-zinc-700">BREAKER</span></h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Efficiency</p>
          <p className="text-3xl font-black text-yellow-500/90 tabular-nums">{(playerPower * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className={`grid-container relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${arenaStatus === 'CLASH' ? 'animate-[impact_0.1s_infinite]' : ''}`}>
        <div 
          ref={containerRef}
          className={`relative grid-container-bg p-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${mode === 'ARENA' ? 'border-[2px] border-white/20' : 'border-0'}`}
          style={{ 
            width: mode === 'EXPLORE' ? exploreW : arenaW,
            height: mode === 'EXPLORE' ? exploreH : arenaH,
            borderRadius: 'var(--radius)'
          }}
        >
          {cells.map(c => (
            <Cell key={c.id} data={c} size={88} gap={8} mode={mode} />
          ))}

          {mode === 'ARENA' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.08]" />
              <div className="mt-auto mb-4 flex flex-col items-center gap-2">
                <div className="text-[10px] font-black text-white/30 tracking-[1.5em] uppercase">
                  {arenaStatus === 'FACE_OFF' && 'Syncing'}
                  {arenaStatus === 'CLASH' && 'Pressure'}
                  {arenaStatus === 'SUSPENSE' && 'Deciding'}
                  {arenaStatus === 'VICTORY' && <span className="text-emerald-400">Sync Complete</span>}
                  {arenaStatus === 'DEFEAT' && <span className="text-red-500">Sync Failed</span>}
                </div>
              </div>
            </div>
          )}
          
          <div className={`absolute inset-0 bg-white transition-opacity duration-700 pointer-events-none ${arenaStatus === 'LOADING' ? 'opacity-10' : 'opacity-0'}`} />
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 opacity-40">
        <div className="flex gap-12 items-center">
          <i className="ph-crosshair text-2xl text-yellow-500"></i>
          <div className="h-6 w-[1px] bg-white/30"></div>
          <p className="text-[11px] font-bold tracking-[0.5em] uppercase font-mono text-white/80">
            {mode === 'EXPLORE' ? 'GRID_LOCKED' : 'BATTLE_ACTIVE'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes impact {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(2px, -2px); }
          50% { transform: translate(-2px, 2px); }
          75% { transform: translate(2px, 2px); }
        }
      `}</style>
    </div>
  );
};

export default App;
