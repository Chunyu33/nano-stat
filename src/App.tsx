/**
 * NanoStat 主应用组件
 * 硬件监控应用的根组件，管理整体布局和路由
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TitleBar } from './components/TitleBar';
import { Sidebar, type NavItem } from './components/Sidebar';
import { SettingsDialog } from './components/SettingsDialog';
import { UpdateDialog, useUpdateChecker } from './components/UpdateDialog';
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
  // 更新检查
  const {
    updateInfo,
    showDialog: showUpdateDialog,
    setShowDialog: setShowUpdateDialog,
    checkForUpdates,
    checking,
    installing,
    installUpdate,
    isPortableMode,
  } = useUpdateChecker();
  // 手动检查结果提示（无更新时轻提示）
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // 手动检查更新（无更新/失败时给出轻提示）
  const handleCheckUpdates = async () => {
    try {
      const found = await checkForUpdates();
      if (!found) {
        setUpdateToast('已是最新版本 ✓');
        window.setTimeout(() => setUpdateToast(null), 2500);
      }
    } catch {
      setUpdateToast('检查更新失败，请稍后再试');
      window.setTimeout(() => setUpdateToast(null), 2500);
    }
  };

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
      {/* 自定义标题栏 */}
      <TitleBar
        title={pageTitles[activeNav]}
        onOpenSettings={() => setSettingsOpen(true)}
        onCheckUpdates={handleCheckUpdates}
        checking={checking}
        portable={isPortableMode}
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

      {/* 更新弹窗 */}
      <UpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        updateInfo={updateInfo}
        portable={isPortableMode}
        onInstall={installUpdate}
        installing={installing}
      />

      {/* 手动检查更新轻提示 */}
      <AnimatePresence>
        {updateToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 right-6 z-[100] px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg"
            style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          >
            {updateToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ThemeProvider>
  );
}

export default App;
