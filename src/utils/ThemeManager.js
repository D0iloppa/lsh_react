// utils/ThemeManager.js
class ThemeManager {
  static applyTheme(currentPage = null) {
    console.log('ThemeManager.applyTheme 호출됨:', currentPage);
    
    // HOME 페이지인 경우 무조건 기본 테마 적용
    if (currentPage === 'HOME') {
      console.log('HOME 페이지 - 기본 테마 적용');
      document.body.classList.remove('theme-bar', 'theme-massage');
      return;
    }
    
    // 테마 소스를 별도로 관리 (덮어써지지 않음)
    const themeSource = localStorage.getItem('themeSource'); // 'BARLIST' 또는 'MASSAGELIST'
    const currentCategory = localStorage.getItem('currentVenueCategory');
    
    console.log('테마 결정 요소:', { 
      themeSource, 
      currentCategory, 
      currentPage 
    });
    
    // 이전 테마 클래스 제거
    document.body.classList.remove('theme-bar', 'theme-massage');
    
    // 테마 적용 우선순위:
    // 1. currentCategory (현재 카테고리 페이지에 있을 때)
    // 2. themeSource (다른 페이지로 이동했지만 테마 유지)
    if (currentCategory === 'BARLIST' || themeSource === 'BARLIST') {
      console.log('BAR 테마 적용');
      document.body.classList.add('theme-bar');
    } else if (currentCategory === 'MASSAGELIST' || themeSource === 'MASSAGELIST') {
      console.log('MASSAGE 테마 적용');
      document.body.classList.add('theme-massage');
    } else {
      console.log('기본 테마 적용');
    }
  }
  
  // 테마 소스 설정 (BARLIST나 MASSAGELIST에서 호출)
  static setThemeSource(source) {
    localStorage.setItem('themeSource', source);
    console.log('테마 소스 설정:', source);
  }
  
  static resetTheme() {
    console.log('ThemeManager.resetTheme 호출됨');
    document.body.classList.remove('theme-bar', 'theme-massage');
    localStorage.removeItem('rankingFromPage');
    localStorage.removeItem('currentVenueCategory');
    localStorage.removeItem('themeSource'); // 테마 소스도 초기화
  }
  
  static initThemeWatcher() {
    const handleStorageChange = () => {
      console.log('localStorage 변경 감지');
      this.applyTheme();
    };
    
    window.addEventListener('storage', handleStorageChange);
    this.applyTheme();
  }
  
  static cleanup() {
    window.removeEventListener('storage', this.applyTheme);
  }
}

export default ThemeManager;