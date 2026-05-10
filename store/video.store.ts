import { create } from "zustand";

interface VideoState {
  videoId: string | null;
  sermonId: string | null;
  title: string;
  isVisible: boolean;
  setVideo: (videoId: string, sermonId: string, title: string) => void;
  setVisible: (visible: boolean) => void;
  clearVideo: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoId: null,
  sermonId: null,
  title: "",
  isVisible: false,
  setVideo: (videoId, sermonId, title) =>
    set({ videoId, sermonId, title, isVisible: true }),
  setVisible: (isVisible) => set({ isVisible }),
  clearVideo: () =>
    set({ videoId: null, sermonId: null, title: "", isVisible: false }),
}));
