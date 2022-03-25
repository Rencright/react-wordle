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
  VariantKey,
  variantLimits,
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

export const getVariantOfDay = (data: {
  solution: string;
  solutionIndex: number;
}): string => {
  // console.log(solutionIndex);
  // return 'AMOG1:E';

  console.log(data.solutionIndex);
  let variantKey: VariantKey;
  switch (data.solutionIndex % 7) {
    case 0:
      variantKey = 'TOBE1';
      break;
    case 1:
      variantKey = 'AMOG1';
      break;
    case 2:
      variantKey = 'FOUL1';
      break;
    case 3:
      variantKey = 'GREE1';
      break;
    case 4:
      variantKey = 'BOND1';
      break;
    case 5:
      variantKey = 'TOBE2';
      break;
    case 6:
      variantKey = 'FOUL2';
      break;
    default:
      console.error('ERROR - integers have stopped working!');
      variantKey = 'GREE1';
  }

  // if (true) {
  //   variantKey = 'BOND1';
  // }

  return generateVariant(data.solution, variantKey);

  // if (data.solutionIndex < 4) {
  //   return 'TOBE1';
  // }
  // if (data.solutionIndex < 5) {
  //   const impostor1 = generateImpostor(data.solution, []);
  //   const impostor2 = generateImpostor(data.solution, [impostor1]);
  //   return `AMOG2:${impostor1}${impostor2}`;
  // }

  // return `AMOG1:${generateImpostor(data.solution, [])}`;
};

export const getWordOfDay = () => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date(2022, 2, 22).valueOf();
  const now = Date.now();
  const msInDay = 86400000;
  const index =
    process.env.REACT_APP_SPECIAL_MODE === 'chaoticiteration'
      ? now
      : Math.floor((now - epochMs) / msInDay);
  const nextday = (index + 1) * msInDay + epochMs;
  console.log(index);
  console.log(WORDS.length);
  console.log(process.env.SPECIAL_MODE);
  console.log(process.env.RANDOM_SEED);
  console.log(process.env);
  const solution = localeAwareUpperCase(WORDS[index % WORDS.length]);

  const variant = getVariantOfDay({
    solution,
    solutionIndex: index,
  });

  console.log(variant);

  return {
    solution,
    solutionIndex: index,
    tomorrow: nextday,
    variant,
    maxChallenges: variantLimits[getVariantKey(variant)],
  };
};

export const { solution, solutionIndex, tomorrow, variant, maxChallenges } =
  getWordOfDay();
