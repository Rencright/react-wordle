import { MAX_CHALLENGES } from '../constants/settings';
import { VariantKey, variantLimits } from './variants';

const gameStateKey = 'gameState';
const highContrastKey = 'highContrast';

type StoredGameState = {
  guesses: string[];
  solution: string;
};

export const saveGameStateToLocalStorage = (gameState: StoredGameState) => {
  localStorage.setItem(gameStateKey, JSON.stringify(gameState));
};

export const loadGameStateFromLocalStorage = () => {
  const state = localStorage.getItem(gameStateKey);
  return state ? (JSON.parse(state) as StoredGameState) : null;
};

const gameStatKey = 'gameStats';

export interface GameTypeStats {
  winDistribution: number[];
  gamesFailed: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  successRate: number;
}

const updateDistributionLength = (stats: GameStats) => {
  while (stats.winDistribution.length < MAX_CHALLENGES) {
    stats.winDistribution.push(0);
  }
  (Object.keys(stats.statsByVariant) as VariantKey[]).forEach(
    (variantKey: VariantKey) => {
      while (
        stats.statsByVariant[variantKey].winDistribution.length <
        variantLimits[variantKey]
      ) {
        stats.statsByVariant[variantKey].winDistribution.push(0);
      }
    }
  );
};

export interface GameStats extends GameTypeStats {
  statsByVariant: {
    [key: string]: GameTypeStats;
  };
}

export const saveStatsToLocalStorage = (gameStats: GameStats) => {
  localStorage.setItem(gameStatKey, JSON.stringify(gameStats));
};

export const loadStatsFromLocalStorage = () => {
  const stats = localStorage.getItem(gameStatKey);
  const gameStats = stats ? (JSON.parse(stats) as GameStats) : null;
  if (gameStats) {
    updateDistributionLength(gameStats);
  }
  return gameStats;
};

export const setStoredIsHighContrastMode = (isHighContrast: boolean) => {
  if (isHighContrast) {
    localStorage.setItem(highContrastKey, '1');
  } else {
    localStorage.removeItem(highContrastKey);
  }
};

export const getStoredIsHighContrastMode = () => {
  const highContrast = localStorage.getItem(highContrastKey);
  return highContrast === '1';
};
