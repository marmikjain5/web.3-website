import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 rounded-2xl border [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] bg-card border-border shadow-md ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
  opacity: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => {
  const centerOffsetX = ((total - 1) * distX) / 2;
  const centerOffsetY = ((total - 1) * distY) / 2;
  return {
    x: i * distX - centerOffsetX,
    y: -i * distY + centerOffsetY,
    z: -i * distX * 1.5,
    zIndex: total - i,
    opacity: i === 0 ? 1 : Math.max(0.7, 1 - i * 0.12)
  };
};

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    opacity: slot.opacity,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap: React.FC<CardSwapProps> = ({
  width = 560,
  height = 530,
  cardDistance = 20,
  verticalDistance = 16,
  delay = 2500,
  pauseOnHover = true,
  onCardClick,
  skewAmount = 2,
  easing = 'elastic',
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr]);
  const order = useRef<number[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    order.current = Array.from({ length: childArr.length }, (_, i) => i);
  }, [childArr.length]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setContainerWidth(Math.floor(w));
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalCards = childArr.length;
  const availableW = containerWidth ?? (typeof width === 'number' ? width : 560);
  const isDesktop = availableW >= 640;

  const numericWidth = typeof width === 'number' ? width : 560;
  const numericHeight = typeof height === 'number' ? height : 530;

  const maxStackShiftX = isDesktop ? 36 : 16;
  const maxStackShiftY = isDesktop ? 24 : 14;

  const distX = Math.min(cardDistance, Math.max(6, Math.floor(maxStackShiftX / Math.max(1, totalCards - 1))));
  const distY = Math.min(verticalDistance, Math.max(6, Math.floor(maxStackShiftY / Math.max(1, totalCards - 1))));

  const totalOffset = (totalCards - 1) * distX;
  const effectiveCardWidth = Math.min(numericWidth, availableW - totalOffset - 8);
  const effectiveCardHeight = isDesktop
    ? numericHeight
    : Math.min(520, Math.max(460, Math.round(effectiveCardWidth * 1.38)));

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  const reLayout = useCallback(() => {
    if (!order.current || order.current.length === 0) return;
    order.current.forEach((cardIdx, slotIdx) => {
      const el = refs[cardIdx]?.current;
      if (el) {
        placeNow(el, makeSlot(slotIdx, distX, distY, refs.length), skewAmount);
      }
    });
  }, [distX, distY, refs, skewAmount]);

  useEffect(() => {
    reLayout();
  }, [reLayout, effectiveCardWidth, effectiveCardHeight]);

  useEffect(() => {
    if (refs.length < 2) return;

    const config =
      easing === 'elastic'
        ? {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
          }
        : {
            ease: 'power1.inOut',
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2
          };

    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;

    const swap = () => {
      if (order.current.length < 2 || isPausedRef.current) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(i, distX, distY, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            opacity: slot.opacity,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, distX, distY, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: backSlot.opacity,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    const startTimer = () => {
      clearInterval(intervalRef.current);
      if (!prefersReducedMotion) {
        intervalRef.current = window.setInterval(swap, delay);
      }
    };

    startTimer();

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        clearInterval(intervalRef.current);
        tlRef.current?.pause();
      } else {
        startTimer();
      }
    };

    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleMotionChange);
    }

    const node = container.current;
    const pause = () => {
      isPausedRef.current = true;
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };
    const resume = () => {
      isPausedRef.current = false;
      tlRef.current?.play();
      startTimer();
    };

    if (node && pauseOnHover) {
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      node.addEventListener('touchstart', pause, { passive: true });
      node.addEventListener('touchend', resume, { passive: true });
      node.addEventListener('touchcancel', resume, { passive: true });
    }

    return () => {
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      }
      if (node && pauseOnHover) {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        node.removeEventListener('touchstart', pause);
        node.removeEventListener('touchend', resume);
        node.removeEventListener('touchcancel', resume);
      }
    };
  }, [distX, distY, delay, pauseOnHover, easing, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: {
            width: `${effectiveCardWidth}px`,
            minWidth: `${effectiveCardWidth}px`,
            maxWidth: `${effectiveCardWidth}px`,
            height: `${effectiveCardHeight}px`,
            ...(child.props.style ?? {})
          },
          onClick: (e) => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div
      ref={container}
      className="relative w-full max-w-[580px] perspective-[900px] overflow-visible select-none"
      style={{
        height: `${effectiveCardHeight + (totalCards > 1 ? distY : 0)}px`,
        margin: '0 auto'
      }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
