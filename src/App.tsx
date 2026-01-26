/**
 * NanoStat 主应用组件
 * 硬件监控应用的根组件，管理整体布局和路由
 */

import { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar, type NavItem } from './components/Sidebar';
import { SettingsDialog } from './components/SettingsDialog';
import { UpdateDialog, useUpdateChecker } from './components/UpdateDialog';
import { HomePage } from './pages/HomePage';
import { MonitorPage } from './pages/MonitorPage';
import { useMonitorSettings } from './hooks/useMonitorSettings';
import { ThemeProvider } from './hooks/useTheme';
import './styles/globals.css';

function App() {
  // 当前激活的导航项
  const [activeNav, setActiveNav] = useState<NavItem>('hardware');
  // 设置弹窗状态
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 监控设置
  const { settings, saveSettings } = useMonitorSettings();
  // 更新检查
  const { updateInfo, showDialog: showUpdateDialog, setShowDialog: setShowUpdateDialog } = useUpdateChecker();

  // 根据导航项渲染对应页面
  const renderPage = () => {
    switch (activeNav) {
      case 'hardware':
        return <HomePage />;
      case 'monitor':
        return <MonitorPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider>
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      {/* 自定义标题栏 */}
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

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

      {/* 更新弹窗 */}
      <UpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        updateInfo={updateInfo}
      />
    </div>
    </ThemeProvider>
  );
}

export default App;
