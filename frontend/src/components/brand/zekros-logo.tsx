import React from "react";

interface ZekrosLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "stencil" | "minimal" | "emblem";
  className?: string;
  size?: number | string;
}

/**
 * Custom Handcrafted Vector Logotypes for ZEKROS
 * Pure vector SVG implementation, fully scalable, monochrome white-on-black design.
 */
export function ZekrosLogo({
  variant = "stencil",
  className = "",
  size = "100%",
  ...props
}: ZekrosLogoProps) {
  if (variant === "emblem") {
    return (
      <svg
        viewBox="0 0 480 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ width: size, height: "auto" }}
        {...props}
      >
        {/* Emblem Mark (Left) */}
        <g id="EmblemMark">
          <path
            d="M 15 20 L 55 20 L 25 80 L 65 80"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d="M 50 15 L 75 50 L 50 85"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
          />
          <circle cx="20" cy="80" r="3" fill="currentColor" />
          <circle cx="60" cy="20" r="3" fill="currentColor" />
        </g>

        {/* Geometric Wordmark */}
        <g id="Wordmark" fill="currentColor">
          {/* Z */}
          <path d="M 100 25 L 140 25 L 140 33 L 112 72 L 140 72 L 140 80 L 100 80 L 100 72 L 128 33 L 100 33 Z" />
          {/* E */}
          <path d="M 150 25 L 185 25 L 185 33 L 159 33 L 159 48 L 181 48 L 181 56 L 159 56 L 159 72 L 185 72 L 185 80 L 150 80 Z" />
          {/* K */}
          <path d="M 195 25 L 204 25 L 204 46 L 226 25 L 238 25 L 217 48 L 240 80 L 227 80 L 208 53 L 204 57 L 204 80 L 195 80 Z" />
          {/* R */}
          <path d="M 250 25 L 280 25 C 289 25 294 30 294 39 C 294 46 288 51 278 52 L 295 80 L 284 80 L 268 53 L 259 53 L 259 80 L 250 80 Z M 259 33 L 259 45 L 278 45 C 283 45 285 43 285 39 C 285 35 283 33 278 33 Z" />
          {/* O */}
          <path d="M 315 25 L 345 25 C 354 25 359 30 359 39 L 359 66 C 359 75 354 80 345 80 L 315 80 C 306 80 301 75 301 66 L 301 39 C 301 30 306 25 315 25 Z M 315 33 C 311 33 310 35 310 39 L 310 66 C 310 70 311 72 315 72 L 345 72 C 349 72 350 70 350 66 L 350 39 C 350 35 349 33 345 33 Z" />
          {/* S */}
          <path d="M 370 25 L 410 25 L 410 33 L 379 33 L 379 48 L 410 48 L 410 80 L 370 80 L 370 72 L 401 72 L 401 56 L 370 56 Z" />
        </g>
      </svg>
    );
  }

  if (variant === "minimal") {
    return (
      <svg
        viewBox="0 0 500 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ width: size, height: "auto" }}
        {...props}
      >
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
          {/* Z */}
          <path d="M 20 20 L 75 20 L 25 70 L 80 70" />
          <line x1="20" y1="20" x2="20" y2="30" />
          <line x1="80" y1="60" x2="80" y2="70" />

          {/* E */}
          <path d="M 110 20 L 165 20" />
          <path d="M 110 20 L 110 70 L 165 70" />
          <line x1="110" y1="45" x2="155" y2="45" />

          {/* K */}
          <path d="M 195 20 L 195 70" />
          <path d="M 245 20 L 196 45 L 248 70" />

          {/* R */}
          <path d="M 280 20 L 330 20 L 330 45 L 280 45 L 280 20" />
          <path d="M 280 45 L 280 70" />
          <path d="M 310 45 L 335 70" />

          {/* O */}
          <path d="M 375 20 L 415 20 L 425 30 L 425 60 L 415 70 L 375 70 L 365 60 L 365 30 Z" />

          {/* S */}
          <path d="M 490 25 L 460 20 L 445 35 L 485 55 L 470 70 L 445 65" />
        </g>
      </svg>
    );
  }

  // Default: "stencil" (AAA Cyber Stencil Wordmark)
  return (
    <svg
      viewBox="0 0 540 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: "auto" }}
      {...props}
    >
      <g fill="currentColor">
        {/* Z - Chamfered Cutouts & Sharp Slant */}
        <path d="M 10 15 L 85 15 L 85 27 L 36 73 L 85 73 L 85 85 L 10 85 L 10 73 L 59 27 L 10 27 Z" />
        <polygon points="88,15 95,15 95,27 88,27" />

        {/* E - Futuristic Block Stencil */}
        <path d="M 105 15 L 175 15 L 175 27 L 123 27 L 123 44 L 165 44 L 165 56 L 123 56 L 123 73 L 175 73 L 175 85 L 105 85 Z" />

        {/* K - Angular Vertex Cutout */}
        <path d="M 188 15 L 205 15 L 205 45 L 248 15 L 270 15 L 227 48 L 273 85 L 250 85 L 212 53 L 205 59 L 205 85 L 188 85 Z" />

        {/* R - Beveled Outer Loop & Diagonal Leg */}
        <path d="M 285 15 L 335 15 C 352 15 362 24 362 38 C 362 50 351 57 334 58 L 364 85 L 342 85 L 316 57 L 303 57 L 303 85 L 285 85 Z M 303 27 L 303 45 L 333 45 C 342 45 345 42 345 36 C 345 30 342 27 333 27 Z" />

        {/* O - Octagonal Cyber Ring */}
        <path d="M 390 15 L 435 15 L 452 32 L 452 68 L 435 85 L 390 85 L 373 68 L 373 32 Z M 393 27 L 388 32 L 388 68 L 393 73 L 432 73 L 437 68 L 437 32 L 432 27 Z" />

        {/* S - Dual 45-Degree Stencil Slant */}
        <path d="M 465 15 L 535 15 L 535 27 L 483 27 L 483 45 L 535 55 L 535 85 L 465 85 L 465 73 L 517 73 L 517 57 L 465 47 Z" />
      </g>
    </svg>
  );
}
