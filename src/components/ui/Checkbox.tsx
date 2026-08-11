/**
 * 可复用主题化 Checkbox 组件
 * 使用全局主题色（--color-primary 翠绿科技风），支持自定义尺寸
 */

import { Check } from 'lucide-react';

interface CheckboxProps {
  /** 是否选中 */
  checked: boolean;
  /** 选中状态变更回调 */
  onChange: (checked: boolean) => void;
  /** 标签文本（可选，放右侧） */
  label?: string;
  /** 组件尺寸（px，默认 18） */
  size?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, size = 18, disabled = false }: CheckboxProps) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer select-none"
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {/* 隐藏原生 input（保留键盘可达性），视觉用自定义盒子 */}
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className="flex items-center justify-center rounded transition-all duration-150"
        style={{
          width: size,
          height: size,
          minWidth: size,
          border: `1.5px solid ${
            checked ? 'var(--color-primary)' : 'var(--color-border-light)'
          }`,
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-bg-input)',
          boxShadow: checked ? '0 0 6px var(--color-card-glow)' : 'none',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {checked && (
          <Check
            style={{ width: size * 0.65, height: size * 0.65, color: '#ffffff', strokeWidth: 3 }}
          />
        )}
      </span>
      {label && (
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
      )}
    </label>
  );
}
