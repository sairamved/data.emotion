import { create } from "zustand";

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

interface AudioState {
  audioUrl: string | null;
  isPlaying: boolean;
  isPlayerVisible: boolean;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRate;
  title: string;
  author: string;
}

interface AudioActions {
  setAudioData: (url: string | null, title: string, author: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsPlayerVisible: (visible: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  reset: () => void;
}

export type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  audioUrl: null,
  isPlaying: false,
  isPlayerVisible: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  title: "",
  author: "",
};

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,
  setAudioData: (audioUrl, title, author) =>
    set({ audioUrl, title, author, isPlayerVisible: true, currentTime: 0, duration: 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPlayerVisible: (isPlayerVisible) => set({ isPlayerVisible }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  reset: () => set(initialState),
}));
