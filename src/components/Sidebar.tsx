/**
 * 侧边栏导航组件
 * 提供主要功能区域的导航
 */

import { Cpu, Monitor } from 'lucide-react';

/** 导航项类型 */
type NavItem = 'hardware' | 'monitor';

interface SidebarProps {
  /** 当前激活的导航项 */
  activeItem: NavItem;
  /** 导航项变更回调 */
  onNavigate: (item: NavItem) => void;
}

/** 导航项配置 */
const navItems: { id: NavItem; label: string; icon: typeof Cpu }[] = [
  { id: 'hardware', label: '硬件信息', icon: Cpu },
  { id: 'monitor', label: '游戏内监控', icon: Monitor },
];

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  return (
    <aside 
      className="w-56 flex flex-col"
      style={{ 
        backgroundColor: 'var(--color-bg-sidebar)', 
        borderRight: '1px solid var(--color-border)',
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* 导航菜单 */}
      <nav style={{ flex: 1, padding: '24px 16px' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isActive ? '#10b981' : 'var(--color-text-secondary)',
                    borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px' }} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部版权信息 */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          © 2024 NanoStat
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '4px' }}>
          v1.0.0
        </p>
      </div>
    </aside>
  );
}

export type { NavItem };
