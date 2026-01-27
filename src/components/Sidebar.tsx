/**
 * 侧边栏导航组件
 * 提供主要功能区域的导航
 */

import { Cpu, Monitor, Info, ChevronLeft, ChevronRight } from 'lucide-react';

/** 导航项类型 */
type NavItem = 'hardware' | 'monitor' | 'about';

interface SidebarProps {
  /** 当前激活的导航项 */
  activeItem: NavItem;
  /** 导航项变更回调 */
  onNavigate: (item: NavItem) => void;
  /** 是否收缩 */
  collapsed: boolean;
  /** 收缩状态变更回调 */
  onToggleCollapse: () => void;
}

/** 导航项配置 */
const navItems: { id: NavItem; label: string; icon: typeof Cpu }[] = [
  { id: 'hardware', label: '硬件信息', icon: Cpu },
  { id: 'monitor', label: '游戏内监控', icon: Monitor },
  { id: 'about', label: '关于', icon: Info },
];

export function Sidebar({ activeItem, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside 
      style={{ 
        width: collapsed ? '72px' : '200px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg-sidebar)', 
        borderRight: '1px solid var(--color-border)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {/* 导航菜单 */}
      <nav style={{ flex: 1, padding: collapsed ? '24px 12px' : '24px 16px', transition: 'padding 0.3s ease' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    padding: collapsed ? '12px' : '12px 16px',
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
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                  <span style={{ 
                    opacity: collapsed ? 0 : 1, 
                    width: collapsed ? 0 : 'auto',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s ease, width 0.3s ease'
                  }}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 收缩按钮 */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            backgroundColor: 'var(--color-bg-input)',
            color: 'var(--color-text-muted)',
            transition: 'all 0.2s ease'
          }}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          ) : (
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          )}
        </button>
      </div>
    </aside>
  );
}

export type { NavItem };
