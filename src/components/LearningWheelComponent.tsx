import { useState, useRef } from 'react';
import { distributeColors, getSegmentPath } from '../utils/wheelUtils';
import { LearningSlice } from '../types/learningWheel';

interface LearningWheelComponentProps {
  slices: LearningSlice[];
  onSelectSlice: (slice: LearningSlice) => void;
  onSpinStart: () => void;
  onSpinEnd: () => void;
}

const CENTER_X = 300;
const CENTER_Y = 300;
const WHEEL_RADIUS = 290;
const TEXT_RADIUS = 270;

export default function LearningWheelComponent({ 
  slices, 
  onSelectSlice, 
  onSpinStart, 
  onSpinEnd 
}: LearningWheelComponentProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const spinTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const segmentColors = distributeColors(slices.length);

  function spinWheel() {
    if (isSpinning || slices.length === 0) return;
    
    setIsSpinning(true);
    onSpinStart();
    
    const spinDuration = 6000 + Math.random() * 2000;
    const totalSpins = 5 + Math.random() * 5;
    const finalRotation = rotation + (360 * totalSpins) + Math.random() * 360;
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const easeOut = (t: number) => {
        const t1 = Math.pow(1 - t, 4);
        const t2 = Math.pow(1 - t, 2);
        return 1 - (0.7 * t1 + 0.3 * t2);
      };
      
      const currentRotation = rotation + (finalRotation - rotation) * easeOut(progress);
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (spinTimeoutRef.current) {
          clearTimeout(spinTimeoutRef.current);
        }
        spinTimeoutRef.current = window.setTimeout(() => {
          setIsSpinning(false);
          const selectedIndex = Math.floor(((360 - (currentRotation % 360)) / (360 / slices.length)));
          onSelectSlice(slices[selectedIndex]);
          onSpinEnd();
        }, 500);
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }

  if (slices.length === 0) {
    return (
      <div className="flex items-center justify-center w-[600px] h-[600px] bg-gray-100 rounded-full">
        <p className="text-gray-500 text-lg">Add slices to start using the wheel</p>
      </div>
    );
  }

  return (
    <div className="relative w-[600px] h-[600px] overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center">
        <div 
          style={{
            width: 0,
            height: 0,
            borderLeft: '22px solid transparent',
            borderRight: '22px solid transparent',
            borderTop: '37px solid black',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            marginBottom: '-18px',
            zIndex: 20
          }}
        />
        
        <svg
          ref={wheelRef}
          viewBox="0 0 600 600"
          width="600"
          height="600"
          style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'none' : 'transform 0.3s ease-out' }}
        >
          {slices.map((slice, index) => {
            const angle = 360 / slices.length;
            const midAngle = index * angle + angle / 2;
            const x = CENTER_X + TEXT_RADIUS * Math.cos((midAngle - 90) * Math.PI / 180);
            const y = CENTER_Y + TEXT_RADIUS * Math.sin((midAngle - 90) * Math.PI / 180);
            
            return (
              <g key={slice.id}>
                <path
                  d={getSegmentPath(index, slices.length, CENTER_X, CENTER_Y, WHEEL_RADIUS)}
                  fill={segmentColors[index]}
                  stroke="#fff"
                  strokeWidth="1"
                />
                <g transform={`translate(${x},${y}) rotate(${midAngle})`}>
                  <text
                    x="0"
                    y="0"
                    fill="#fff"
                    fontSize="20"
                    fontWeight="bold"
                    textAnchor="end"
                    dominantBaseline="middle"
                    transform="rotate(-90)"
                    className="select-none"
                  >
                    {slice.name}
                  </text>
                </g>
              </g>
            );
          })}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="70"
            fill="white"
            className="cursor-pointer"
            onClick={spinWheel}
          />
        </svg>
      </div>
    </div>
  );
}