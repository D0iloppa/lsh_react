// hooks/useWebviewBackBlock.js
import { useEffect } from 'react';

export default function useWebviewBackBlock(goBack) {
  useEffect(() => {
    const pushDummy = () => {
      // 현재 URL로 더미 state 쌓기
      window.history.pushState({ wv: true }, '', window.location.href);
    };

    // 진입 시 한 번 쌓아둔다
    pushDummy();

    const onPopState = (e) => {
      e?.preventDefault?.();
      // 원하는 동작 수행 (무조건 goBack)
      goBack();

      // 다시 더미 state를 쌓아서 실제 브라우저 back으로 빠져나가지 않게
      pushDummy();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [goBack]);
}
