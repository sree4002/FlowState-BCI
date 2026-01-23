/**
 * Mock for expo-av
 */

export const Audio = {
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  Sound: {
    createAsync: jest.fn().mockResolvedValue({
      sound: {
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 1000,
        }),
      },
      status: {
        isLoaded: true,
      },
    }),
  },
};

export type AVPlaybackStatus =
  | { isLoaded: false; error?: string }
  | {
      isLoaded: true;
      isPlaying: boolean;
      positionMillis: number;
      durationMillis?: number;
    };

export default {
  Audio,
};
