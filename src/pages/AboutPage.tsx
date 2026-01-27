/**
 * 关于页面
 * 显示应用信息、版权和开发者信息
 */

import { Github, Heart, Mail, Globe } from 'lucide-react';
import { useAppVersion } from '../hooks/useAppVersion';

export function AboutPage() {
  const appVersion = useAppVersion();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto', userSelect: 'none' }}>
      {/* 应用信息卡片 */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src="/icons/128x128.png" alt="NanoStat" className="w-20 h-20 rounded-2xl shadow-lg" />
        </div>
        
        {/* 应用名称 */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          NanoStat
        </h1>
        
        {/* 版本信息 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ 
            padding: '4px 12px', 
            backgroundColor: 'rgba(16, 185, 129, 0.15)', 
            color: '#10b981', 
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {appVersion}
          </span>
        </div>
        
        {/* 应用描述 */}
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
          轻量级硬件监控工具，提供实时系统性能监控和游戏内悬浮面板功能。
          基于 Tauri + React 构建，追求极致的性能和用户体验。
        </p>
      </div>

      {/* 开发者信息 */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart className="w-4 h-4 text-red-400" />
          开发者
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg-input)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: 'white'
          }}>
            C
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Evan Lau
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              一名佛系的深漂码农。
            </p>
          </div>
        </div>

        {/* 联系方式 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
          <a 
            href="https://github.com/Chunyu33" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              padding: '12px', 
              backgroundColor: 'var(--color-bg-input)', 
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <a 
            href="mailto:liucygm33@gmail.com" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              padding: '12px', 
              backgroundColor: 'var(--color-bg-input)', 
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          >
            <Mail className="w-4 h-4" />
            邮箱
          </a>
          <a 
            href="https://evanspace.icu" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              padding: '12px', 
              backgroundColor: 'var(--color-bg-input)', 
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          >
            <Globe className="w-4 h-4" />
            网站
          </a>
        </div>
      </div>

      

      {/* 版权信息 */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          © {new Date().getFullYear()} NanoStat. All rights reserved.
        </p>
      </div>
    </div>
  );
}
