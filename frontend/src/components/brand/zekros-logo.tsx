import React from "react";

interface ZekrosLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: "stencil" | "minimal" | "emblem";
  className?: string;
  size?: number | string;
}

/**
 * ZEKROS official brand logo component using /assets/zekroslogo.png
 */
export function ZekrosLogo({
  className = "",
  size,
  alt = "ZEKROS Logo",
  style,
  ...props
}: ZekrosLogoProps) {
  return (
    <img
      src="/assets/zekroslogo.png"
      alt={alt}
      className={`object-contain ${className}`}
      style={{
        width: size ? size : undefined,
        height: size ? size : "auto",
        ...style,
      }}
      {...props}
    />
  );
}
