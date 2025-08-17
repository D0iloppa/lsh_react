// hooks/useBackSwipe.js
import { useEffect, useRef } from 'react';

export default function useBackSwipe({
  containerSelector = '.discover-container',
  onBack,
  // 튜닝 파라미터
  minDistance = 90,         // 최소 수평 이동(px)
  maxAngleDeg = 22,         // 허용 각도(수평 기준)
  minVelocity = 0.25,       // px/ms (250px/s)
  deadzone = 12,            // 초기 미세 이동 무시
  consecutiveNeeded = 4,    // 수평 판정 연속 횟수
  leftEdgeOnly = true,      // 왼쪽 엣지에서만 시작 허용
  leftEdgeWidth = 24        // 엣지 너비(px)
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const startT = useRef(0);
  const decided = useRef(false);
  const isHorizontal = useRef(false);
  const consec = useRef(0);
  const activePointerId = useRef(null);

  const MAX_SLOPE = Math.tan((Math.PI / 180) * maxAngleDeg);

  const isIgnoredTarget = (el) => (
    el.closest('.map-section') ||
    el.closest('#map') ||
    el.closest('.venue-rotation') ||
    el.closest('.girls-rotation') ||
    el.closest('.girl-image-box') ||
    el.closest('.girl-image-box-top') ||
    el.closest('.first-place-container') ||
    el.closest('.second-third-container')
  );

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // 수직 스크롤 허용, 수평은 우리가 제어
    container.style.touchAction = 'pan-y';

    const onPointerDown = (e) => {
      if (e.pointerType !== 'touch') return;
      if (isIgnoredTarget(e.target)) return;

      // 엣지 스와이프만 허용(옵션)
      if (leftEdgeOnly) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x > leftEdgeWidth) return;
      }

      activePointerId.current = e.pointerId;
      container.setPointerCapture?.(e.pointerId);

      startX.current = e.clientX;
      startY.current = e.clientY;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      startT.current = performance.now();

      decided.current = false;
      isHorizontal.current = false;
      consec.current = 0;
    };

    const onPointerMove = (e) => {
      if (e.pointerType !== 'touch') return;
      if (activePointerId.current !== e.pointerId) return;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      // deadzone 이전엔 판단 X
      if (!decided.current && (adx > deadzone || ady > deadzone)) {
        const slope = adx > 0 ? ady / adx : Infinity;
        if (slope < MAX_SLOPE) {
          consec.current += 1;
          if (consec.current >= consecutiveNeeded) {
            decided.current = true;
            isHorizontal.current = true;
          }
        } else {
          // 수직/대각선 경향이면 바로 "수평 아님" 확정
          decided.current = true;
          isHorizontal.current = false;
        }
      } else if (decided.current && isHorizontal.current) {
        // 수평으로 확정된 이후엔 스크롤 방지
        e.preventDefault(); // capture 단계에서 동작
      }

      lastX.current = e.clientX;
      lastY.current = e.clientY;
    };

    const onPointerUpCancel = (e) => {
      if (e.pointerType !== 'touch') return;
      if (activePointerId.current !== e.pointerId) return;

      const endX = lastX.current;
      const endY = lastY.current;

      const dx = endX - startX.current;
      const dy = endY - startY.current;

      const dt = Math.max(performance.now() - startT.current, 1);
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      const slope = adx > 0 ? ady / adx : Infinity;
      const velocity = adx / dt; // 수평 기준 속도(px/ms)

      const angleOk = slope < MAX_SLOPE;
      const distanceOk = adx >= minDistance;
      const velocityOk = velocity >= minVelocity;

      if (decided.current && isHorizontal.current && angleOk && distanceOk && velocityOk && dx > 0) {
        onBack?.();
      }

      // 초기화
      container.releasePointerCapture?.(e.pointerId);
      activePointerId.current = null;
      decided.current = false;
      isHorizontal.current = false;
      consec.current = 0;
    };

    // capture 단계에서 등록(중첩 요소 제스처보다 먼저 관여)
    container.addEventListener('pointerdown', onPointerDown, { capture: true });
    container.addEventListener('pointermove', onPointerMove, { capture: true });
    container.addEventListener('pointerup', onPointerUpCancel, { capture: true });
    container.addEventListener('pointercancel', onPointerUpCancel, { capture: true });

    return () => {
      container.removeEventListener('pointerdown', onPointerDown, { capture: true });
      container.removeEventListener('pointermove', onPointerMove, { capture: true });
      container.removeEventListener('pointerup', onPointerUpCancel, { capture: true });
      container.removeEventListener('pointercancel', onPointerUpCancel, { capture: true });
    };
  }, [
    containerSelector,
    onBack,
    minDistance,
    maxAngleDeg,
    minVelocity,
    deadzone,
    consecutiveNeeded,
    leftEdgeOnly,
    leftEdgeWidth,
  ]);
}
