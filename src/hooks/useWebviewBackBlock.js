// hooks/useBlockBack.js
import { useEffect } from 'react';

export default function useBlockBack() {
  useEffect(() => {
    const pushDummy = () => {
      if (window.history.state?.blockBack !== true) {
        window.history.pushState({ blockBack: true }, '', window.location.href);
      }
    };

    pushDummy();

    const onPopState = (e) => {
      e.preventDefault();
      pushDummy(); // 다시 state 쌓아서 실제 이동 방지
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
}
