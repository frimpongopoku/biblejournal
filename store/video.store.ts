import { create } from "zustand";

interface VideoState {
  videoId: string | null;
  sermonId: string | null;
  title: string;
  isVisible: boolean;
  /** Second to start from — set when a sermon page hands its player off. */
  start: number;
  setVideo: (videoId: string, sermonId: string, title: string, start?: number) => void;
  setVisible: (visible: boolean) => void;
  clearVideo: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoId: null,
  sermonId: null,
  title: "",
  isVisible: false,
  start: 0,
  setVideo: (videoId, sermonId, title, start = 0) =>
    set({ videoId, sermonId, title, isVisible: true, start: Math.floor(start) }),
  setVisible: (isVisible) => set({ isVisible }),
  clearVideo: () =>
    set({ videoId: null, sermonId: null, title: "", isVisible: false, start: 0 }),
}));
