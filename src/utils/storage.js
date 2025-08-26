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