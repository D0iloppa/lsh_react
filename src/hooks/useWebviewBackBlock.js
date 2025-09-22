// hooks/useWebviewBackBlock.js
import { useEffect } from 'react';

export default function useWebviewBackBlock(goBack) {
  useEffect(() => {
    const pushDummy = () => {
      if (window.history.state?.wv !== true) {
        window.history.pushState({ wv: true }, '', window.location.href);
      }
    };

    pushDummy();

    const onPopState = (e) => {
      e?.preventDefault?.();

      alert("1234");
      goBack?.();
      pushDummy(); // 다시 쌓아 앱 종료 방지
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [goBack]);
}
