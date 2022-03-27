import { MAX_CHALLENGES } from '../constants/settings';
import {
  GameStats,
  GameTypeStats,
  loadStatsFromLocalStorage,
  saveStatsToLocalStorage,
} from './localStorage';
import { getVariantKey, variantLimits } from './variants';
import { maxChallenges, variant } from './words';

// In stats array elements 0-5 are successes in 1-6 trys

export const addStatsForCompletedGame = (
  gameStats: GameStats,
  count: number
) => {
  // Count is number of incorrect guesses before end.
  const stats = { ...gameStats };

  stats.totalGames += 1;

  const variantKey = getVariantKey(variant);

  const variantStats = stats.statsByVariant[variantKey] || {
    winDistribution: Array.from(new Array(variantLimits[variantKey]), () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  };

  variantStats.totalGames += 1;

  if (count >= maxChallenges) {
    // A fail situation
    stats.currentStreak = 0;
    stats.gamesFailed += 1;
    variantStats.currentStreak = 0;
    variantStats.gamesFailed += 1;
  } else {
    stats.winDistribution[count] += 1;
    stats.currentStreak += 1;

    if (stats.bestStreak < stats.currentStreak) {
      stats.bestStreak = stats.currentStreak;
    }

    variantStats.winDistribution[count] += 1;
    variantStats.currentStreak += 1;

    if (variantStats.bestStreak < variantStats.currentStreak) {
      variantStats.bestStreak = variantStats.currentStreak;
    }
  }

  stats.successRate = getSuccessRate(stats);
  variantStats.successRate = getSuccessRate(variantStats);

  stats.statsByVariant[variantKey] = variantStats;

  saveStatsToLocalStorage(stats);
  return stats;
};

const defaultStats: GameStats = {
  winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
  statsByVariant: {},
};

export const loadStats = () => {
  return loadStatsFromLocalStorage() || defaultStats;
};

const getSuccessRate = (gameStats: GameTypeStats) => {
  const { totalGames, gamesFailed } = gameStats;

  return Math.round(
    (100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1)
  );
};
