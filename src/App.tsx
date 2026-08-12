/**
 * NanoStat 主应用组件
 * 硬件监控应用的根组件，管理整体布局和路由
 */

import { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar, type NavItem } from './components/Sidebar';
import { SettingsDialog } from './components/SettingsDialog';
import { UpdateButton } from './components/UpdateButton';
import { HomePage } from './pages/HomePage';
import { MonitorPage } from './pages/MonitorPage';
import { AboutPage } from './pages/AboutPage';
import { useMonitorSettings } from './hooks/useMonitorSettings';
import { ThemeProvider } from './hooks/useTheme';
import './styles/globals.css';

const pageTitles: Record<NavItem, string> = {
  hardware: '硬件信息',
  monitor: '游戏内监控',
  about: '关于',
};

function App() {
  // 当前激活的导航项
  const [activeNav, setActiveNav] = useState<NavItem>('hardware');
  // 设置弹窗状态
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 侧边栏收缩状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 监控设置
  const { settings, saveSettings } = useMonitorSettings();

  // 根据导航项渲染对应页面
  const renderPage = () => {
    switch (activeNav) {
      case 'hardware':
        return <HomePage />;
      case 'monitor':
        return <MonitorPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider>
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      {/* 自定义标题栏（检查更新按钮为独立组件，自动检查逻辑在组件内） */}
      <TitleBar
        title={pageTitles[activeNav]}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar 
          activeItem={activeNav} 
          onNavigate={setActiveNav} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 页面内容 */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-main)' }}>
          {renderPage()}
        </main>
      </div>

      {/* 设置弹窗 */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={saveSettings}
      />

      {/* 静默更新检查：标题栏已有手动检查按钮，此处仅负责启动后自动检查（有更新才弹窗） */}
      <UpdateButton variant="silent" autoCheck />
    </div>
    </ThemeProvider>
  );
}

export default App;
