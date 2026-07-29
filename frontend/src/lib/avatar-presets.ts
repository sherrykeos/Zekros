export interface AvatarPreset {
  id: string;
  name: string;
  dataUrl: string;
}

// 10 premium, cyber-themed, high-quality SVGs encoded as Data URLs
export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: "cosmic-singularity",
    name: "Cosmic Singularity",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%231a0e36"/><stop offset="100%" stop-color="%23070314"/></radialGradient><linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23a855f7"/><stop offset="100%" stop-color="%236366f1"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="%23a855f7" flood-opacity="0.6"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><circle cx="50" cy="50" r="28" fill="none" stroke="url(%23glow)" stroke-width="2" filter="url(%23shadow)"/><circle cx="50" cy="50" r="18" fill="none" stroke="url(%23glow)" stroke-width="1.5" stroke-dasharray="8,4" filter="url(%23shadow)"/><circle cx="50" cy="50" r="6" fill="%23ffffff" filter="url(%23shadow)"/></svg>`,
  },
  {
    id: "quantum-core",
    name: "Quantum Core",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%230b2e24"/><stop offset="100%" stop-color="%23020907"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="%2310b981" stroke-width="2" filter="url(%23glow)"/><circle cx="50" cy="50" r="8" fill="%2310b981" filter="url(%23glow)"/><line x1="50" y1="20" x2="50" y2="80" stroke="%2310b981" stroke-width="1" opacity="0.4"/><line x1="20" y1="50" x2="80" y2="50" stroke="%2310b981" stroke-width="1" opacity="0.4"/></svg>`,
  },
  {
    id: "cyber-visor",
    name: "Cyber Visor",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%231f1f2e"/><stop offset="100%" stop-color="%230a0a0f"/></radialGradient><filter id="neon"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="%2306b6d4" flood-opacity="0.8"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><rect x="25" y="42" width="50" height="16" rx="8" fill="none" stroke="%2306b6d4" stroke-width="3" filter="url(%23neon)"/><rect x="32" y="47" width="36" height="6" rx="3" fill="%2306b6d4" filter="url(%23neon)"/><circle cx="38" cy="50" r="1.5" fill="%23ffffff"/><circle cx="62" cy="50" r="1.5" fill="%23ffffff"/></svg>`,
  },
  {
    id: "nebula-core",
    name: "Nebula Core",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%232e0828"/><stop offset="100%" stop-color="%230c020a"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M50 15 C60 30, 80 40, 80 50 C80 65, 65 80, 50 80 C35 80, 20 65, 20 50 C20 40, 40 30, 50 15 Z" fill="none" stroke="%23d946ef" stroke-width="2" filter="url(%23glow)"/><circle cx="50" cy="50" r="12" fill="none" stroke="%23ff007f" stroke-width="1.5" filter="url(%23glow)"/><circle cx="50" cy="50" r="5" fill="%23ffffff"/></svg>`,
  },
  {
    id: "aether-shield",
    name: "Aether Shield",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%233b0f0f"/><stop offset="100%" stop-color="%230f0404"/></radialGradient><filter id="shieldGlow"><feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="%23ef4444" flood-opacity="0.75"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M50 20 L78 30 L68 65 L50 82 L32 65 L22 30 Z" fill="none" stroke="%23ef4444" stroke-width="2.5" stroke-linejoin="round" filter="url(%23shieldGlow)"/><path d="M50 32 L68 38 L60 62 L50 72 L40 62 L32 38 Z" fill="none" stroke="%23ef4444" stroke-width="1" stroke-linejoin="round" opacity="0.5"/><circle cx="50" cy="50" r="4" fill="%23ffffff" filter="url(%23shieldGlow)"/></svg>`,
  },
  {
    id: "star-forge",
    name: "Star Forge",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23302008"/><stop offset="100%" stop-color="%230d0802"/></radialGradient><filter id="forgeGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><circle cx="50" cy="50" r="26" fill="none" stroke="%23f59e0b" stroke-width="2" filter="url(%23forgeGlow)"/><circle cx="50" cy="50" r="16" fill="none" stroke="%23f59e0b" stroke-width="1" stroke-dasharray="10,6" filter="url(%23forgeGlow)"/><line x1="50" y1="10" x2="50" y2="90" stroke="%23f59e0b" stroke-width="1.5" stroke-dasharray="6,4" filter="url(%23forgeGlow)"/><line x1="10" y1="50" x2="90" y2="50" stroke="%23f59e0b" stroke-width="1.5" stroke-dasharray="6,4" filter="url(%23forgeGlow)"/></svg>`,
  },
  {
    id: "solar-corona",
    name: "Solar Corona",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%233b2a0a"/><stop offset="100%" stop-color="%23120c02"/></radialGradient><filter id="coronaGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="%23eab308" flood-opacity="0.8"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><circle cx="50" cy="50" r="22" fill="none" stroke="%23eab308" stroke-width="3" filter="url(%23coronaGlow)"/><path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50 M24 24 L30 30 M70 70 L76 76 M70 30 L76 24 M24 70 L30 64" stroke="%23eab308" stroke-width="2" filter="url(%23coronaGlow)"/><circle cx="50" cy="50" r="10" fill="%23ffffff" filter="url(%23coronaGlow)"/></svg>`,
  },
  {
    id: "glitch-scan",
    name: "Glitch Scan",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%230d210d"/><stop offset="100%" stop-color="%23030803"/></radialGradient><filter id="matrixGlow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="%2322c55e" flood-opacity="0.9"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M20 20 H80 V80 H20 Z" fill="none" stroke="%2322c55e" stroke-width="2" filter="url(%23matrixGlow)"/><line x1="20" y1="35" x2="80" y2="35" stroke="%2322c55e" stroke-width="1" opacity="0.6" filter="url(%23matrixGlow)"/><line x1="20" y1="50" x2="80" y2="50" stroke="%2322c55e" stroke-width="1.5" filter="url(%23matrixGlow)"/><line x1="20" y1="65" x2="80" y2="65" stroke="%2322c55e" stroke-width="1" opacity="0.6" filter="url(%23matrixGlow)"/><rect x="35" y="44" width="8" height="12" fill="%2322c55e" filter="url(%23matrixGlow)"/><rect x="57" y="44" width="8" height="12" fill="%2322c55e" filter="url(%23matrixGlow)"/></svg>`,
  },
  {
    id: "vortex-eye",
    name: "Vortex Eye",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%232c1033"/><stop offset="100%" stop-color="%230b040d"/></radialGradient><filter id="eyeGlow"><feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="%23ec4899" flood-opacity="0.85"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M22 50 Q50 24 78 50 Q50 76 22 50 Z" fill="none" stroke="%23ec4899" stroke-width="2.5" filter="url(%23eyeGlow)"/><circle cx="50" cy="50" r="14" fill="none" stroke="%23ec4899" stroke-width="1.5" filter="url(%23eyeGlow)"/><circle cx="50" cy="50" r="6" fill="%23ffffff" filter="url(%23eyeGlow)"/></svg>`,
  },
  {
    id: "hyper-drive",
    name: "Hyper Drive",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%230f2c3d"/><stop offset="100%" stop-color="%23040c12"/></radialGradient><filter id="driveGlow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><circle cx="50" cy="50" r="28" fill="none" stroke="%233b82f6" stroke-width="2.5" filter="url(%23driveGlow)"/><path d="M50 50 L80 20 M50 50 L80 80 M50 50 L20 80 M50 50 L20 20" stroke="%233b82f6" stroke-width="1.5" opacity="0.6" filter="url(%23driveGlow)"/><circle cx="50" cy="50" r="10" fill="none" stroke="%2360a5fa" stroke-width="1.5" stroke-dasharray="4,2" filter="url(%23driveGlow)"/><circle cx="50" cy="50" r="4" fill="%23ffffff" filter="url(%23driveGlow)"/></svg>`,
  },
  {
    id: "neon-eclipse",
    name: "Neon Eclipse",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%231b0e36"/><stop offset="100%" stop-color="%23070314"/></radialGradient><filter id="eclipseGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="%23a855f7" flood-opacity="0.8"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M50 20 C66.5 20, 80 33.5, 80 50 C80 66.5, 66.5 80, 50 80 C40 80, 31 75, 26 67 C36 72, 49 70, 56 61 C63 52, 62 38, 52 30 C45 25, 36 24, 28 27 C34 22.5, 42 20, 50 20 Z" fill="%23d946ef" filter="url(%23eclipseGlow)"/><circle cx="35" cy="40" r="2" fill="%23ffffff" opacity="0.8"/></svg>`,
  },
  {
    id: "pulse-wave",
    name: "Pulse Wave",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23381a08"/><stop offset="100%" stop-color="%230d0602"/></radialGradient><filter id="waveGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M15 50 Q23.75 30, 32.5 50 T50 50 T67.5 50 T85 50" fill="none" stroke="%23f97316" stroke-width="3.5" stroke-linecap="round" filter="url(%23waveGlow)"/><path d="M15 62 Q23.75 42, 32.5 62 T50 62 T67.5 62 T85 62" fill="none" stroke="%23ef4444" stroke-width="1.5" opacity="0.6" filter="url(%23waveGlow)"/><circle cx="50" cy="50" r="5" fill="%23ffffff" filter="url(%23waveGlow)"/></svg>`,
  },
  {
    id: "vector-helix",
    name: "Vector Helix",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23092830"/><stop offset="100%" stop-color="%2302090c"/></radialGradient><filter id="helixGlow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="%2306b6d4" flood-opacity="0.85"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><path d="M30 20 Q50 50, 70 80 M70 20 Q50 50, 30 80" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-dasharray="2,6" stroke-linecap="round" filter="url(%23helixGlow)"/><circle cx="40" cy="35" r="4" fill="%2306b6d4" filter="url(%23helixGlow)"/><circle cx="60" cy="65" r="4" fill="%2306b6d4" filter="url(%23helixGlow)"/><circle cx="60" cy="35" r="4" fill="%233b82f6" filter="url(%23helixGlow)"/><circle cx="40" cy="65" r="4" fill="%233b82f6" filter="url(%23helixGlow)"/><circle cx="50" cy="50" r="6" fill="%23ffffff" filter="url(%23helixGlow)"/></svg>`,
  },
  {
    id: "rogue-node",
    name: "Rogue Node",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%2330080c"/><stop offset="100%" stop-color="%230c0203"/></radialGradient><filter id="nodeGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="%23ef4444" flood-opacity="0.9"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><rect x="34" y="34" width="32" height="32" rx="6" fill="none" stroke="%23ef4444" stroke-width="3" filter="url(%23nodeGlow)"/><rect x="42" y="42" width="16" height="16" rx="2" fill="%23ef4444" filter="url(%23nodeGlow)"/><circle cx="50" cy="50" r="2" fill="%23ffffff"/></svg>`,
  },
  {
    id: "prism-lattice",
    name: "Prism Lattice",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%232d0d30"/><stop offset="100%" stop-color="%230a030b"/></radialGradient><filter id="prismGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><polygon points="50,18 78,68 22,68" fill="none" stroke="%23ec4899" stroke-width="2.5" filter="url(%23prismGlow)"/><polygon points="50,32 68,64 32,64" fill="none" stroke="%238b5cf6" stroke-width="1.5" filter="url(%23prismGlow)"/><circle cx="50" cy="53" r="5" fill="%233b82f6" filter="url(%23prismGlow)"/><circle cx="50" cy="53" r="2" fill="%23ffffff"/></svg>`,
  },
  {
    id: "plasma-orb",
    name: "Plasma Orb",
    dataUrl: `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%230d2a1d"/><stop offset="100%" stop-color="%23020c08"/></radialGradient><filter id="plasmaGlow"><feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="%2310b981" flood-opacity="0.8"/></filter></defs><rect width="100" height="100" fill="url(%23bg)"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2310b981" stroke-width="2" filter="url(%23plasmaGlow)"/><path d="M50 20 Q55 35, 45 50 T50 80 M20 50 Q35 55, 50 45 T80 50" fill="none" stroke="%2334d399" stroke-width="1.5" stroke-linecap="round" filter="url(%23plasmaGlow)"/><circle cx="50" cy="50" r="6" fill="%23ffffff" filter="url(%23plasmaGlow)"/></svg>`,
  },
];
