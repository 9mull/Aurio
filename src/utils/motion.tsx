import React from 'react';

type MotionProps = {
  whileHover?: {
    scale?: number;
  };
  whileTap?: {
    scale?: number;
  };
  initial?: {
    opacity?: number;
    scale?: number;
  };
  animate?: {
    opacity?: number;
    scale?: number;
  };
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export const motion: React.FC<MotionProps> = ({ 
  children, 
  whileHover, 
  whileTap,
  initial,
  animate,
  className,
  onClick,
  ...props 
}: React.PropsWithChildren<MotionProps> & Record<string, any>) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  let style: React.CSSProperties = {};
  
  if (isHovered && whileHover) {
    style = {
      ...style,
      transform: whileHover.scale ? `scale(${whileHover.scale})` : style.transform,
    };
  }
  
  if (isPressed && whileTap) {
    style = {
      ...style,
      transform: whileTap.scale ? `scale(${whileTap.scale})` : style.transform,
    };
  }

  style = {
    ...style,
    transition: 'transform 0.2s ease',
  };

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};