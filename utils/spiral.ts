
import { Position } from '../types';

/**
 * 固定的 4x6 螺旋轨道路径 (从外向内)
 * 01 -> 24
 */
export const FIXED_SPIRAL_PATH: Position[] = [
  {x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}, // 顶部
  {x:3, y:1}, {x:3, y:2}, {x:3, y:3}, {x:3, y:4}, {x:3, y:5}, // 右侧
  {x:2, y:5}, {x:1, y:5}, {x:0, y:5}, // 底部
  {x:0, y:4}, {x:0, y:3}, {x:0, y:2}, {x:0, y:1}, // 左侧
  {x:1, y:1}, {x:2, y:1}, // 内圈顶
  {x:2, y:2}, {x:2, y:3}, {x:2, y:4}, // 内圈右
  {x:1, y:4}, // 内圈底
  {x:1, y:3}, {x:1, y:2}  // 内圈左/中心
];

export const getNeighbors = (p: Position): Position[] => {
  return [
    { x: p.x + 1, y: p.y },
    { x: p.x - 1, y: p.y },
    { x: p.x, y: p.y + 1 },
    { x: p.x, y: p.y - 1 },
  ].filter(pos => pos.x >= 0 && pos.x < 4 && pos.y >= 0 && pos.y < 6);
};
