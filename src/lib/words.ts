import { WORDS } from '../constants/wordlist';
import { VALID_GUESSES } from '../constants/validGuesses';
import {
  WRONG_SPOT_MESSAGE,
  NOT_CONTAINED_MESSAGE,
} from '../constants/strings';
import { getGuessStatuses } from './statuses';
import { default as GraphemeSplitter } from 'grapheme-splitter';
import {
  generateVariant,
  getVariantKey,
  getVariantTitle,
  VariantKey,
  variantLimits,
  variantTitles,
} from './variants';

export const isWordInWordList = (word: string) => {
  return (
    WORDS.includes(localeAwareLowerCase(word)) ||
    VALID_GUESSES.includes(localeAwareLowerCase(word))
  );
};

export const isWinningWord = (word: string) => {
  return solution === word;
};

// build a set of previously revealed letters - present and correct
// guess must use correct letters in that space and any other revealed letters
// also check if all revealed instances of a letter are used (i.e. two C's)
export const findFirstUnusedReveal = (word: string, guesses: string[]) => {
  if (guesses.length === 0) {
    return false;
  }

  const lettersLeftArray = new Array<string>();
  const guess = guesses[guesses.length - 1];
  const statuses = getGuessStatuses(guess);
  const splitWord = unicodeSplit(word);
  const splitGuess = unicodeSplit(guess);

  for (let i = 0; i < splitGuess.length; i++) {
    if (statuses[i] === 'correct' || statuses[i] === 'present') {
      lettersLeftArray.push(splitGuess[i]);
    }
    if (statuses[i] === 'correct' && splitWord[i] !== splitGuess[i]) {
      return WRONG_SPOT_MESSAGE(splitGuess[i], i + 1);
    }
  }

  // check for the first unused letter, taking duplicate letters
  // into account - see issue #198
  let n;
  for (const letter of splitWord) {
    n = lettersLeftArray.indexOf(letter);
    if (n !== -1) {
      lettersLeftArray.splice(n, 1);
    }
  }

  if (lettersLeftArray.length > 0) {
    return NOT_CONTAINED_MESSAGE(lettersLeftArray[0]);
  }
  return false;
};

export const unicodeSplit = (word: string) => {
  return new GraphemeSplitter().splitGraphemes(word);
};

export const unicodeLength = (word: string) => {
  return unicodeSplit(word).length;
};

export const localeAwareLowerCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleLowerCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toLowerCase();
};

export const localeAwareUpperCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleUpperCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toUpperCase();
};

const getVariantKeyOfDay = (solutionIndex: number): VariantKey => {
  const overrideVariant = process.env.REACT_APP_OVERRIDE_VARIANT;
  if (overrideVariant && Object.keys(variantTitles).includes(overrideVariant)) {
    return overrideVariant as VariantKey;
  }

  switch (solutionIndex % 7) {
    case 0:
      return 'AMOG1';
    case 1:
      if (solutionIndex % 2 === 0) {
        return 'GREE1';
      } else {
        return 'BOND1';
      }
    case 2:
      return 'TOBE1';
    case 3:
      if (solutionIndex % 2 === 0) {
        return 'SHYE1';
      } else {
        return 'MINE1';
      }
    case 4:
      return 'FOUL1';
    case 5:
      switch (solutionIndex % 21) {
        case 5:
          return 'AMOG2';
        case 12:
          return 'TOBE2';
        case 19:
          return 'FOUL2';
        default:
          console.error('ARITHMETIC ERROR IN DATE SWITCH');
          return 'AMOG2';
      }
    case 6:
      switch (solutionIndex % 42) {
        case 6:
          return 'FOUL2';
        case 13:
          return 'FOUL2';
        case 20:
          return 'TOBE2';
        case 27:
          return 'AMOG3';
        case 34:
          return 'AMOG2';
        case 41:
          return 'TOBE3';
        default:
          console.error('ARITHMETIC ERROR IN DATE SWITCH');
          return 'AMOG2';
      }
  }

  console.error('ARITHMETIC ERROR IN DATE SWITCH');
  return 'TOBE1';
  // switch (solutionIndex % 10) {
  //   case 0:
  //     return 'TOBE1';
  //   case 1:
  //     return 'AMOG1';
  //   case 2:
  //     return 'FOUL1';
  //   case 3:
  //     return 'GREE1';
  //   case 4:
  //     return 'BOND1';
  //   case 5:
  //     return 'TOBE2';
  //   case 6:
  //     return 'FOUL2';
  //   case 7:
  //     return 'AMOG2';
  //   case 8:
  //     return 'MINE1';
  //   case 9:
  //     return 'SHYE1';
  //   default:
  //     console.error('ERROR - integers have stopped working!');
  //     return 'GREE1';
  // }
};

export const getVariantOfDay = (data: {
  solution: string;
  solutionIndex: number;
}): string => {
  let variantKey = getVariantKeyOfDay(data.solutionIndex);

  return generateVariant(data.solution, variantKey);
};

export const getWordOfDay = () => {
  // March 22, 2022 Game Epoch
  const epochMs = new Date(2022, 2, 22).valueOf();
  const now = Date.now();
  const msInDay = 86400000;
  let index = Math.floor((now - epochMs) / msInDay);
  const nextday = (index + 1) * msInDay + epochMs;

  if (process.env.REACT_APP_SPECIAL_MODE === 'chaoticiteration') {
    index = now;
  }
  let solution = localeAwareUpperCase(WORDS[index % WORDS.length]);

  const variant = getVariantOfDay({
    solution,
    solutionIndex: index,
  });

  return {
    solution,
    solutionIndex: index,
    tomorrow: nextday,
    variant,
    variantKey: getVariantKey(variant),
    variantTitle: getVariantTitle(variant),
    maxChallenges: variantLimits[getVariantKey(variant)],
  };
};

export const {
  solution,
  solutionIndex,
  tomorrow,
  variant,
  variantKey,
  variantTitle,
  maxChallenges,
} = getWordOfDay();
