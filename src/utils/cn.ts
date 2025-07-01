import { type ClassValue, clsx } from 'clsx';

/**
 * 类名合并工具函数
 * 基于clsx的简化版本，用于条件性地合并类名
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}