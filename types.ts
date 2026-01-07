
export type Position = { x: number; y: number; };
export enum CellType { FIRE, WATER, EARTH, AIR, BOSS, VOID }
export type GameMode = 'EXPLORE' | 'ARENA';

export interface CellData {
  id: string;
  type: CellType;
  level: number;
  position: Position;
  isPlayer: boolean;
  isRevealed: boolean;
  isBoss: boolean;
  spiralIndex?: number;
  variantIcon?: string; // 随机装饰图标
}

export const DECOR_ICONS = [
  'ph-atom', 'ph-binary', 'ph-brain', 'ph-circuitry', 'ph-cpu', 
  'ph-database', 'ph-eye', 'ph-fingerprint', 'ph-flask', 'ph-gauge', 
  'ph-gear', 'ph-globe-hemisphere-west', 'ph-hexagon', 'ph-infinity', 
  'ph-intersect', 'ph-key', 'ph-microscope', 'ph-navigation-arrow', 
  'ph-orbit', 'ph-pentagon', 'ph-polygon', 'ph-radioactive', 'ph-rows', 
  'ph-squares-four', 'ph-terminal-window', 'ph-tree-structure', 'ph-waves'
];

export const GRID_COLS = 4;
export const GRID_ROWS = 6;
export const ARENA_COLS = 4;
export const ARENA_ROWS = 2;

export const THEMES = {
  [CellType.FIRE]: 'border-red-500/40 text-red-300 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
  [CellType.WATER]: 'border-blue-500/40 text-blue-300 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  [CellType.EARTH]: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  [CellType.AIR]: 'border-purple-500/40 text-purple-300 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
  [CellType.BOSS]: 'border-red-600/60 text-red-400 bg-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.2)]',
  [CellType.VOID]: 'border-zinc-700 text-zinc-500 bg-zinc-800/20'
};

export const ICONS = {
  [CellType.FIRE]: 'ph-fire-simple-fill',
  [CellType.WATER]: 'ph-drop-half-bottom-fill',
  [CellType.EARTH]: 'ph-mountains-fill',
  [CellType.AIR]: 'ph-wind-fill',
  [CellType.BOSS]: 'ph-skull-fill',
  [CellType.VOID]: 'ph-seal-question'
};

export const HINT_ICONS = {
  [CellType.FIRE]: 'ph-sparkle',
  [CellType.WATER]: 'ph-circle-dashed',
  [CellType.EARTH]: 'ph-square-half',
  [CellType.AIR]: 'ph-dots-three-circle'
};