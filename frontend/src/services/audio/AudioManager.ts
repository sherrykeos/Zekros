import { Howl, Howler } from "howler";
import {
  SOUND_LIBRARY,
  type SoundKey,
  type SoundCategory,
} from "./sounds";

export interface AudioSettings {
  masterVolume: number; // 0 to 100
  sfxVolume: number; // 0 to 100
  musicVolume: number; // 0 to 100 (preserved for future expansion)
  uiSoundsEnabled: boolean;
  matchCuesEnabled: boolean;
  muted: boolean;
}

const SETTINGS_KEY = "zekros_audio_settings_v1";

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 70,
  sfxVolume: 80,
  musicVolume: 10,
  uiSoundsEnabled: true,
  matchCuesEnabled: true,
  muted: false,
};

class AudioManager {
  private settings: AudioSettings;
  private soundInstances: Map<SoundKey, Howl> = new Map();
  private failedSounds: Set<SoundKey> = new Set();
  private lastPlayedMap: Map<SoundKey, number> = new Map();
  private subscribers: Set<() => void> = new Set();
  private unlocked = false;

  constructor() {
    this.settings = this.loadSettings();
    this.initAutoUnlock();
    this.updateGlobalVolume();
  }

  private loadSettings(): AudioSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback silently if localStorage fails
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore write errors
    }
    this.notifySubscribers();
  }

  private initAutoUnlock() {
    if (typeof window === "undefined") return;
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      try {
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          void Howler.ctx.resume();
        }
      } catch {
        // Ignore silent failure
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  private updateGlobalVolume() {
    const effectiveMaster = this.settings.muted
      ? 0
      : this.settings.masterVolume / 100;
    Howler.volume(effectiveMaster);
  }

  private getOrLoadSound(key: SoundKey): Howl | null {
    if (this.failedSounds.has(key)) return null;

    if (this.soundInstances.has(key)) {
      return this.soundInstances.get(key)!;
    }

    const def = SOUND_LIBRARY[key];
    if (!def || !def.src || (def.src as readonly string[]).length === 0) return null;

    try {
      const instance = new Howl({
        src: def.src as string[],
        volume: def.volume,
        preload: true,
        onloaderror: () => {
          this.failedSounds.add(key);
        },
        onplayerror: () => {
          // Fail silently on playback block
        },
      });

      this.soundInstances.set(key, instance);
      return instance;
    } catch {
      this.failedSounds.add(key);
      return null;
    }
  }

  /**
   * Preload all defined sounds in the library
   */
  public preload() {
    (Object.keys(SOUND_LIBRARY) as SoundKey[]).forEach((key) => {
      this.getOrLoadSound(key);
    });
  }

  /**
   * Play a sound by its key
   */
  public play(key: SoundKey): number | null {
    if (this.settings.muted) return null;

    const def = SOUND_LIBRARY[key];
    if (!def) return null;

    // Check UI / Match category toggle filters
    if (def.category === "ui" && !this.settings.uiSoundsEnabled) return null;
    if (def.category === "gameplay" && !this.settings.matchCuesEnabled) return null;

    // Check per-sound cooldown
    const now = Date.now();
    const cooldown = def.cooldown ?? 0;
    const lastPlayed = this.lastPlayedMap.get(key) ?? 0;

    if (cooldown > 0 && now - lastPlayed < cooldown) {
      return null;
    }

    const sound = this.getOrLoadSound(key);
    if (!sound) return null;

    try {
      // Calculate effective sound volume (def.volume * sfxVolume ratio)
      const categoryRatio = this.settings.sfxVolume / 100;
      sound.volume(def.volume * categoryRatio);

      this.lastPlayedMap.set(key, now);
      return sound.play();
    } catch {
      return null;
    }
  }

  /**
   * Stop playing sound(s)
   */
  public stop(key?: SoundKey) {
    if (key) {
      const sound = this.soundInstances.get(key);
      if (sound) sound.stop();
    } else {
      Howler.stop();
    }
  }

  /**
   * Fade sound volume over duration
   */
  public fade(key: SoundKey, from: number, to: number, duration: number) {
    const sound = this.soundInstances.get(key);
    if (sound) {
      sound.fade(from, to, duration);
    }
  }

  /**
   * Returns current mute status
   */
  public isMuted(): boolean {
    return this.settings.muted;
  }

  /**
   * Set Master Volume (0 - 100)
   */
  public setMasterVolume(vol: number) {
    this.settings.masterVolume = Math.max(0, Math.min(100, vol));
    this.updateGlobalVolume();
    this.saveSettings();
  }

  /**
   * Set SFX Volume (0 - 100)
   */
  public setSfxVolume(vol: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(100, vol));
    this.saveSettings();
  }

  /**
   * Set Music Volume (0 - 100)
   */
  public setMusicVolume(vol: number) {
    this.settings.musicVolume = Math.max(0, Math.min(100, vol));
    this.saveSettings();
  }

  /**
   * Toggle UI sounds
   */
  public setUiSoundsEnabled(enabled: boolean) {
    this.settings.uiSoundsEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Toggle Match Cues
   */
  public setMatchCuesEnabled(enabled: boolean) {
    this.settings.matchCuesEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Toggle Mute
   */
  public toggleMute() {
    this.settings.muted = !this.settings.muted;
    this.updateGlobalVolume();
    this.saveSettings();
  }

  /**
   * Get settings copy
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Subscribe to setting changes
   */
  public subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((fn) => fn());
  }

  /**
   * Clean up all loaded audio instances
   */
  public dispose() {
    this.soundInstances.forEach((sound) => sound.unload());
    this.soundInstances.clear();
    this.lastPlayedMap.clear();
    this.subscribers.clear();
  }
}

export const audioManager = new AudioManager();
