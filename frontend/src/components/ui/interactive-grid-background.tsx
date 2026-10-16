"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface InteractiveGridBackgroundProps {
  /** Opacity of the base blueprint grid (0.0 to 1.0). Default is 0.3 */
  opacity?: number;
  /** Hover spotlight radius in pixels. Default is 260px (diameter 520px) */
  hoverRadius?: number;
  /** Hover glow opacity (0.0 to 1.0). Default is 0.9 */
  hoverOpacity?: number;
  /** Grid magnification scale factor under cursor. Default is 1.05 (5% scaleup) */
  hoverScale?: number;
  /** Custom line color on hover for light mode (e.g. "#2563eb", "#3b82f6", "#10b981") */
  hoverColorLight?: string;
  /** Custom line color on hover for dark mode (e.g. "#38bdf8", "#60a5fa", "#34d399") */
  hoverColorDark?: string;
  /** Size of each grid cell in pixels. Default is 48px (3rem) */
  gridSize?: number;
  className?: string;
}

export function InteractiveGridBackground({
  opacity = 0.3,
  hoverRadius = 260,
  hoverOpacity = 0.9,
  hoverScale = 1.05,
  hoverColorLight = "#2563eb",
  hoverColorDark = "#38bdf8",
  gridSize = 48,
  className = "",
}: InteractiveGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mouse coordinates relative to container
  const mousePos = useRef({ x: -1000, y: -1000 });
  const targetPos = useRef({ x: -1000, y: -1000 });
  const [isInside, setIsInside] = useState(false);
  const [renderPos, setRenderPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    let animId: number;
    let isTracking = true;

    const lastClientPos = { current: null as { x: number; y: number } | null };

    const updateMouse = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Check if cursor is within container boundaries (plus generous vertical margin)
      if (
        clientX >= rect.left - 100 &&
        clientX <= rect.right + 100 &&
        clientY >= rect.top - 50 &&
        clientY <= rect.bottom + 50
      ) {
        targetPos.current = { x, y };
        setIsInside(true);
      } else {
        setIsInside(false);
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      lastClientPos.current = { x: e.clientX, y: e.clientY };
      updateMouse(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      if (lastClientPos.current) {
        updateMouse(lastClientPos.current.x, lastClientPos.current.y);
      }
    };

    const onMouseLeave = () => {
      setIsInside(false);
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    // Smooth RAF loop to fluidly lerp position towards target
    const loop = () => {
      if (!isTracking) return;

      const dx = targetPos.current.x - mousePos.current.x;
      const dy = targetPos.current.y - mousePos.current.y;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        mousePos.current.x += dx * 0.22;
        mousePos.current.y += dy * 0.22;
        setRenderPos({
          x: Math.round(mousePos.current.x * 10) / 10,
          y: Math.round(mousePos.current.y * 10) / 10,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      isTracking = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Active color based on current resolved theme
  const activeHoverColor = isDark ? hoverColorDark : hoverColorLight;
  const haloRadius = Math.round(hoverRadius * 1.4);

  // Compute background offset so scaled grid lines align with base grid at cursor center
  const bgOffsetX = -(renderPos.x % gridSize) + hoverRadius;
  const bgOffsetY = -(renderPos.y % gridSize) + hoverRadius;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)",
      }}
    >
      {/* 1. Base Blueprint Grid: Controlled by opacity & gridSize props */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          backgroundImage: isDark
            ? "linear-gradient(to right, rgba(51, 65, 85, 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(51, 65, 85, 0.7) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(203, 213, 225, 0.95) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.95) 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* 2. Interactive Glowing Grid Spotlight Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isInside ? hoverOpacity : 0,
          WebkitMaskImage: `radial-gradient(${haloRadius}px circle at ${renderPos.x}px ${renderPos.y}px, black 0%, transparent 80%)`,
          maskImage: `radial-gradient(${haloRadius}px circle at ${renderPos.x}px ${renderPos.y}px, black 0%, transparent 80%)`,
          backgroundImage: `linear-gradient(to right, ${activeHoverColor} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${activeHoverColor} 1.5px, transparent 1.5px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          filter: isDark
            ? "drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))"
            : "drop-shadow(0 0 3px rgba(37, 99, 235, 0.5))",
        }}
      />

      {/* 3. Interactive Magnification Lens (Controlled by hoverRadius, hoverScale, hoverOpacity) */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ease-out will-change-transform"
        style={{
          left: `${renderPos.x}px`,
          top: `${renderPos.y}px`,
          width: `${hoverRadius * 2}px`,
          height: `${hoverRadius * 2}px`,
          opacity: isInside ? hoverOpacity : 0,
          borderRadius: "50%",
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
        }}
      >
        {/* Scaled Grid Lines (Magnified by hoverScale centered at cursor) */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${hoverScale})`,
            transformOrigin: "center center",
            backgroundImage: `linear-gradient(to right, ${activeHoverColor} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${activeHoverColor} 1.5px, transparent 1.5px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${bgOffsetX}px ${bgOffsetY}px`,
            filter: isDark
              ? "drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))"
              : "drop-shadow(0 0 4px rgba(37, 99, 235, 0.6))",
          }}
        />

        {/* Ambient Radial Spotlight Aura */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at center, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 75%)"
              : "radial-gradient(circle at center, rgba(37, 99, 235, 0.18) 0%, rgba(147, 197, 253, 0.08) 45%, transparent 75%)",
          }}
        />
      </div>
    </div>
  );
}
