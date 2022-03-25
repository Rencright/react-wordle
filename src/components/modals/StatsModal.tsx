import Countdown from 'react-countdown';
import { StatBar } from '../stats/StatBar';
import { Histogram } from '../stats/Histogram';
import { GameStats } from '../../lib/localStorage';
import { shareStatus } from '../../lib/share';
import { maxChallenges, tomorrow, variantKey } from '../../lib/words';
import { BaseModal } from './BaseModal';
import {
  STATISTICS_TITLE,
  GUESS_DISTRIBUTION_TEXT,
  NEW_WORD_TEXT,
  SHARE_TEXT,
} from '../../constants/strings';
import { getVariantTitle, variantLimits } from '../../lib/variants';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  guesses: string[];
  gameStats: GameStats;
  isGameLost: boolean;
  isGameWon: boolean;
  handleShareToClipboard: () => void;
  isHardMode: boolean;
  isDarkMode: boolean;
  isHighContrastMode: boolean;
  numberOfGuessesMade: number;
};

export const StatsModal = ({
  isOpen,
  handleClose,
  guesses,
  gameStats,
  isGameLost,
  isGameWon,
  handleShareToClipboard,
  isHardMode,
  isDarkMode,
  isHighContrastMode,
  numberOfGuessesMade,
}: Props) => {
  if (gameStats.totalGames <= 0) {
    return (
      <BaseModal
        title={STATISTICS_TITLE}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <StatBar gameStats={gameStats} />
      </BaseModal>
    );
  }
  if ((gameStats.statsByVariant[variantKey]?.totalGames || 0) <= 0) {
    return (
      <BaseModal
        title={STATISTICS_TITLE}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <StatBar gameStats={gameStats} />
        <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
          {getVariantTitle(variantKey)}
        </h4>
        <StatBar
          gameStats={
            gameStats.statsByVariant[variantKey] || {
              winDistribution: Array.from(
                new Array(variantLimits[variantKey]),
                () => 0
              ),
              gamesFailed: 0,
              currentStreak: 0,
              bestStreak: 0,
              totalGames: 0,
              successRate: 0,
            }
          }
        />
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <StatBar gameStats={gameStats} />
      <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
        {getVariantTitle(variantKey)}
      </h4>
      <StatBar gameStats={gameStats.statsByVariant[variantKey]} />
      <h4 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
        {GUESS_DISTRIBUTION_TEXT}
      </h4>
      <Histogram
        gameStats={gameStats.statsByVariant[variantKey]}
        numberOfGuessesMade={numberOfGuessesMade}
        maxGuesses={maxChallenges}
      />
      {(isGameLost || isGameWon) && (
        <div className="mt-5 sm:mt-6 columns-2 dark:text-white">
          <div>
            <h5>{NEW_WORD_TEXT}</h5>
            <Countdown
              className="text-lg font-medium text-gray-900 dark:text-gray-100"
              date={tomorrow}
              daysInHours={true}
            />
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={() => {
              shareStatus(
                guesses,
                isGameLost,
                isHardMode,
                isDarkMode,
                isHighContrastMode,
                handleShareToClipboard
              );
            }}
          >
            {SHARE_TEXT}
          </button>
        </div>
      )}
    </BaseModal>
  );
};
