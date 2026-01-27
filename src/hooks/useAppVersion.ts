/**
 * 获取应用版本号的 Hook
 */

import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';

export function useAppVersion() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const ver = await getVersion();
        setVersion(`v${ver}`);
      } catch (err) {
        console.error('Failed to get version:', err);
        setVersion('v1.0.0');
      }
    };
    fetchVersion();
  }, []);

  return version;
}
