import { GAME_INFO, type GameInfoDetail } from "./gameinfoconst";

export interface AppDescription {
  short: string;
  full: string;
  hero: string;
}

export interface AppInfo {
  name: string;
  symbol: string;
  tagline: string;
  logoText: string;
  description: AppDescription;
}

export interface CompanyInfo {
  name: string;
  shortName: string;
  tagline: string;
  copyrightYear: number;
  website: string;
  supportEmail: string;
}

export interface EngineInfo {
  name: string;
  version: string;
  description: string;
}

export interface VersionInfo {
  version: string;
  build: string;
  stage: string;
  releaseDate: string;
  engine: EngineInfo;
}

export interface SocialLinks {
  github?: string;
  twitter?: string;
  discord?: string;
  linkedin?: string;
  docs?: string;
}

export interface AppConstants {
  app: AppInfo;
  company: CompanyInfo;
  version: VersionInfo;
  socials: SocialLinks;
}

export const APP_CONSTANTS: AppConstants = {
  app: {
    name: "ZEKROS",
    symbol: "Z",
    tagline: "Strategy, evolved.",
    logoText: "ZEKROS",
    description: {
      short:
        "A premium real-time strategy game built on adaptive boards, vanishing pieces, and decisions that compound.",
      full:
        "ZEKROS turns a familiar grid into a living arena. Boards shift in size, pieces decay, and tokens let you rewrite the board mid-fight. It is built for fast, expressive matches — beautifully simple to play, deep to master.",
      hero:
        "ZEKROS is a real-time strategy game where boards adapt, pieces vanish, and decisions compound.",
    },
  },
  company: {
    name: "KEOS Labs",
    shortName: "KEOS",
    tagline:
      "A studio crafting premium digital products with obsessive attention to detail.",
    copyrightYear: 2026,
    website: "https://keos.studio",
    supportEmail: "support@zerothlabs.com",
  },
  version: {
    version: "0.1.0",
    build: "0.1.0-preview.3",
    stage: "Alpha",
    releaseDate: "August 1, 2026",
    engine: {
      name: "D3T Engine",
      version: "D3T · pre-alpha",
      description:
        "Custom strategy engine handling dynamic boards, vanish queues, and reclaim logic.",
    },
  },
  socials: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    discord: "https://discord.gg",
    linkedin: "https://linkedin.com",
    docs: "#",
  },
};

// Convenient Shorthand Exports
export const APP_NAME = APP_CONSTANTS.app.name;
export const APP_SYMBOL = APP_CONSTANTS.app.symbol;
export const APP_TAGLINE = APP_CONSTANTS.app.tagline;
export const COMPANY_NAME = APP_CONSTANTS.company.name;
export const APP_VERSION = APP_CONSTANTS.version.version;
export const BUILD_VERSION = APP_CONSTANTS.version.build;
export const ENGINE_NAME = APP_CONSTANTS.version.engine.name;

/**
 * Generates standardized page titles for metadata.
 * Example: `getPageTitle("Play")` => `"Play — ZEKROS"`
 * Example: `getPageTitle()` => `"ZEKROS — Strategy, evolved."`
 */
export function getPageTitle(pageName?: string): string {
  if (!pageName) {
    return `${APP_CONSTANTS.app.name} — ${APP_CONSTANTS.app.tagline}`;
  }
  return `${pageName} — ${APP_CONSTANTS.app.name}`;
}

/**
 * Generates the standardized copyright string.
 * Example: `"© 2026 ZEROTH Labs. All rights reserved."`
 */
export function getCopyrightString(): string {
  const year = new Date().getFullYear();
  return `© ${year} ${APP_CONSTANTS.company.name}. All rights reserved.`;
}

// Re-export game info for single-import convenience
export { GAME_INFO };
export type { GameInfoDetail };
