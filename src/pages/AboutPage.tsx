/**
 * 关于页面
 * 显示应用信息、版权、开发者信息和打赏支持
 */

import { useState, useEffect } from 'react';
import { Github, Heart, Mail, Coffee, X, Video, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppVersion } from '../hooks/useAppVersion';
import wechatQr from '../assets/r_wechat_qr.jpg';
import alipayQr from '../assets/r_alipay_qr.jpg';
import avatar from '../assets/avatar.png';

export function AboutPage() {
  const appVersion = useAppVersion();
  // 打赏码放大预览（null=未打开）
  const [previewQr, setPreviewQr] = useState<{ src: string; name: string } | null>(null);

  // ESC 关闭预览
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewQr(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 打赏平台列表
  const donateChannels = [
    { name: '微信', src: wechatQr, color: '#22c55e' },
    { name: '支付宝', src: alipayQr, color: '#3b82f6' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 select-none">
      <div className="max-w-[800px] mx-auto">
        {/* 应用信息 */}
        <div className="card p-8 mb-6 text-center">
          <div className="flex justify-center mb-5">
            <img src="/icons/128x128.png" alt="NanoStat" className="w-20 h-20 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)] mb-2">NanoStat</h1>

          {/* 功能说明 */}
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-[560px] mx-auto mb-2.5">
            NanoStat 是一款轻量级 Windows 硬件性能监控工具。你可以在桌面查看 CPU、GPU、内存、
            磁盘和网络状态，也可以在游戏中打开可自定义的悬浮面板，实时关注使用率、温度、网络速率和 FPS。
          </p>
          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed max-w-[560px] mx-auto">
            使用提示：部分温度、功耗和 FPS 数据依赖硬件、驱动及系统权限；如果数据显示 N/A，请先刷新或检查相关驱动。
          </p>

          {/* 版本信息 */}
          <div className="grid grid-cols-3 gap-2 mt-6 text-left">
            <div className="rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] px-3 py-2.5">
              <p className="text-[11px] text-[var(--color-text-muted)]">当前版本</p>
              <p className="mt-1 text-[13px] font-semibold text-emerald-500">{appVersion || '读取中...'}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] px-3 py-2.5">
              <p className="text-[11px] text-[var(--color-text-muted)]">最近更新</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--color-text-primary)]">2026-08-11</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] px-3 py-2.5">
              <p className="text-[11px] text-[var(--color-text-muted)]">许可证</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--color-text-primary)]">MIT</p>
            </div>
          </div>
        </div>

        {/* 开发者信息 */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            开发者
          </h2>

          <div className="flex items-center gap-4 p-4 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
            <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,#10b981_0%,#059669_100%)] flex items-center justify-center text-xl font-bold text-white overflow-hidden flex-shrink-0">
              <img src={avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                Evan
              </h3>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                一个平平无奇的人。
              </p>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <a
              href="https://github.com/Chunyu33/nano-stat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] no-underline transition-all hover:border-emerald-500/40 hover:text-[var(--color-text-primary)]"
            >
              <Github className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">GitHub</span>
                <span className="block mt-1 text-[11px] leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                  功能建议、问题反馈、查看源码
                </span>
              </span>
            </a>
            <a
              href="mailto:liucygm33@gmail.com"
              className="group flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] no-underline transition-all hover:border-emerald-500/40 hover:text-[var(--color-text-primary)]"
            >
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">邮箱</span>
                <span className="block mt-1 text-[11px] leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                  私下反馈、合作联系和其他问题
                </span>
              </span>
            </a>
            <a
              href="https://space.bilibili.com/387797235"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] no-underline transition-all hover:border-emerald-500/40 hover:text-[var(--color-text-primary)]"
            >
              <Tv className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">B站 · Evan的像素空间</span>
                <span className="block mt-1 text-[11px] leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                  关注更新、教程和使用演示
                </span>
              </span>
            </a>
            <a
              href="https://www.douyin.com/search/Evan%E7%9A%84%E5%83%8F%E7%B4%A0%E7%A9%BA%E9%97%B4"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] no-underline transition-all hover:border-emerald-500/40 hover:text-[var(--color-text-primary)]"
            >
              <Video className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">抖音 · Evan的像素空间</span>
                <span className="block mt-1 text-[11px] leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                  关注更新、教程和使用演示
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* 支持作者 */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            支持作者
          </h2>
          <p className="text-[13px] text-[var(--color-text-muted)] mb-5">
            如果这个项目对你有帮助，可以请作者喝杯咖啡 ☕ 自愿原则，感谢支持！
          </p>
          <div className="grid grid-cols-2 gap-4">
            {donateChannels.map(channel => (
              <button
                key={channel.name}
                onClick={() => setPreviewQr({ src: channel.src, name: channel.name })}
                title={`点击放大${channel.name}`}
                className="flex flex-col items-center gap-2.5 p-4 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)] cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <img
                  src={channel.src}
                  alt={`${channel.name}`}
                  className="w-[150px] h-[150px] object-contain rounded-lg bg-white"
                />
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: channel.color }} />
                  {channel.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center py-5">
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Copyright © {new Date().getFullYear()} NanoStat. All rights reserved.
          </p>
        </div>

        {/* 打赏码放大预览 */}
        <AnimatePresence>
          {previewQr && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: 'linear' }}
              onClick={() => setPreviewQr(null)}
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 cursor-zoom-out will-change-[opacity]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: 'linear' }}
                onClick={e => e.stopPropagation()}
                className="card p-6 text-center max-w-[90vw] max-h-[90vh] will-change-[opacity]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                    {previewQr.name}
                  </span>
                  <button
                    onClick={() => setPreviewQr(null)}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent border-none"
                    aria-label="关闭"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <img
                  src={previewQr.src}
                  alt={`${previewQr.name}`}
                  className="w-[320px] max-w-[70vw] rounded-lg bg-white"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  使用{previewQr.name}扫一扫，感谢您的支持 🎉
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
