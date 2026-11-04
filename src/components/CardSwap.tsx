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
    className={`absolute top-1/2 left-1/2 rounded-xl border backdrop-blur-lg [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] bg-white border-black/10 ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
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
  const numericHeight = typeof height === 'number' ? height : (isDesktop ? 560 : 500);

  const maxStackShiftX = isDesktop ? 36 : 8;
  const maxStackShiftY = isDesktop ? 36 : 10;

  const distX = Math.min(cardDistance, Math.max(4, Math.floor(maxStackShiftX / Math.max(1, totalCards - 1))));
  const distY = Math.min(verticalDistance, Math.max(4, Math.floor(maxStackShiftY / Math.max(1, totalCards - 1))));

  const totalOffsetX = (totalCards - 1) * distX;
  const totalOffsetY = (totalCards - 1) * distY;

  const effectiveCardWidth = isDesktop
    ? Math.min(numericWidth, availableW - totalOffsetX - 32)
    : Math.max(220, Math.min(numericWidth, availableW - totalOffsetX - 12));

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

  const isPausedRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const total = refs.length;
    if (total === 0) return;

    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, distX, distY, total), skewAmount);
      }
    });

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: `+=${effectiveCardHeight * 0.4}`,
        x: `-=${distX * 2}`,
        z: 80,
        rotationZ: -4,
        duration: config.durDrop,
        ease: config.ease
      });

      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const targetSlot = makeSlot(i, distX, distY, total);

        tl.to(
          el,
          {
            x: targetSlot.x,
            y: targetSlot.y,
            z: targetSlot.z,
            duration: config.durMove,
            ease: config.ease,
            onStart: () => {
              gsap.set(el, { zIndex: targetSlot.zIndex });
            }
          },
          `<+=${config.promoteOverlap}`
        );
      });

      const backSlot = makeSlot(total - 1, distX, distY, total);
      tl.set(elFront, { zIndex: backSlot.zIndex, rotationZ: 0 }, 'return');

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
      intervalRef.current = window.setInterval(swap, delay);
    };

    startTimer();

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
    }

    return () => {
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
      if (node && pauseOnHover) {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
      }
    };
  }, [distX, distY, delay, pauseOnHover, skewAmount, easing, refs, config, effectiveCardHeight]);

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
      className="relative w-full max-w-[600px] perspective-[900px] overflow-visible select-none"
      style={{
        height: `${effectiveCardHeight + totalOffsetY}px`,
        margin: '0 auto'
      }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
