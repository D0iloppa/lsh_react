export const getVersionCheck = () => {
    const stored = localStorage.getItem('versionCheck');
    
    if (!stored) {
        return { isLatestVersion: true, isAndroid: false, isIOS: false };
    }
  
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('❌ versionCheck JSON 파싱 실패:', e);
      return { isLatestVersion: true, isAndroid: false, isIOS: false };
    }
};


export const compareVersions = (v1, v2) => {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return 1;
    if ((a[i] || 0) < (b[i] || 0)) return -1;
  }
  return 0;
};

export const getVersionInfo = () => {
  let app_version = localStorage.getItem('app_version');
  let app_device = localStorage.getItem('app_device');

  return {
    app_version, app_device
  }
}