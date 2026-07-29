import { useState, useEffect, useCallback } from "react";
import { audioManager, type AudioSettings } from "@/services/audio/AudioManager";
import type { SoundKey } from "@/services/audio/sounds";

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(() =>
    audioManager.getSettings(),
  );

  useEffect(() => {
    return audioManager.subscribe(() => {
      setSettings(audioManager.getSettings());
    });
  }, []);

  const play = useCallback((key: SoundKey) => {
    return audioManager.play(key);
  }, []);

  const stop = useCallback((key?: SoundKey) => {
    audioManager.stop(key);
  }, []);

  const setMasterVolume = useCallback((vol: number) => {
    audioManager.setMasterVolume(vol);
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    audioManager.setSfxVolume(vol);
  }, []);

  const setMusicVolume = useCallback((vol: number) => {
    audioManager.setMusicVolume(vol);
  }, []);

  const setUiSoundsEnabled = useCallback((enabled: boolean) => {
    audioManager.setUiSoundsEnabled(enabled);
  }, []);

  const setMatchCuesEnabled = useCallback((enabled: boolean) => {
    audioManager.setMatchCuesEnabled(enabled);
  }, []);

  const toggleMute = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  return {
    play,
    stop,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setUiSoundsEnabled,
    setMatchCuesEnabled,
    toggleMute,
    settings,
  };
}
