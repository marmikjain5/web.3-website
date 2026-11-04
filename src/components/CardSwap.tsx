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
  useState
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
    className={`absolute top-1/2 left-1/2 rounded-xl border backdrop-blur-lg [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] bg-slate-700 border-slate-600/30 dark:bg-[#0d1015]/90 dark:border-white/20 ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap: React.FC<CardSwapProps> = ({
  width = 600,
  height = 560,
  cardDistance = 40,
  verticalDistance = 40,
  delay = 2500,
  pauseOnHover = true,
  onCardClick,
  skewAmount = 4,
  easing = 'elastic',
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr]);
  const order = useRef<number[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

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
  const availableW = containerWidth ?? (typeof width === 'number' ? width : 600);
  const isDesktop = availableW >= 640;

  const numericWidth = typeof width === 'number' ? width : 600;
  const numericHeight = typeof height === 'number' ? height : 560;

  const maxStackShiftX = isDesktop ? 36 : 14;
  const maxStackShiftY = isDesktop ? 36 : 14;

  const distX = Math.min(cardDistance, Math.max(6, Math.floor(maxStackShiftX / Math.max(1, totalCards - 1))));
  const distY = Math.min(verticalDistance, Math.max(6, Math.floor(maxStackShiftY / Math.max(1, totalCards - 1))));

  const totalOffsetX = (totalCards - 1) * distX;
  const totalOffsetY = (totalCards - 1) * distY;

  const effectiveCardWidth = isDesktop
    ? Math.min(numericWidth, availableW - totalOffsetX - 32)
    : Math.max(280, availableW - totalOffsetX);

  useEffect(() => {
    const timer = setTimeout(() => {
      let maxH = 0;
      refs.forEach((r) => {
        if (r.current) {
          let childTotal = 0;
          for (let i = 0; i < r.current.children.length; i++) {
            childTotal += (r.current.children[i] as HTMLElement).offsetHeight || 0;
          }
          const h = Math.max(r.current.scrollHeight, childTotal);
          if (h > maxH) maxH = h;
        }
      });
      if (maxH > 200) {
        setMeasuredHeight(maxH);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [refs, effectiveCardWidth, childArr.length]);

  const effectiveCardHeight = measuredHeight ?? numericHeight;

  const config = useMemo(() => {
    return easing === 'elastic'
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
  }, [easing]);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    if (refs.length === 0) return;

    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;

    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, distX, distY, refs.length), skewAmount);
      }
    });

    const swap = () => {
      if (order.current.length < 2 || isPausedRef.current || prefersReducedMotion) return;

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
  }, [distX, distY, delay, pauseOnHover, skewAmount, easing, refs, config]);

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
      className="relative perspective-[900px] overflow-visible select-none"
      style={{
        width: `${effectiveCardWidth + totalOffsetX}px`,
        maxWidth: '100%',
        height: `${effectiveCardHeight + totalOffsetY}px`,
        margin: '0 auto'
      }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
