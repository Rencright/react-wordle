/* eslint-disable no-loop-func */
// import { solutionIndex } from "./words";
import { VALID_GUESSES } from '../constants/validGuesses';
import { WORDS } from '../constants/wordlist';
import { randBetweenRange } from './random';
import { CharStatus } from './shared';
import {
  localeAwareLowerCase,
  localeAwareUpperCase,
  solution,
  unicodeSplit,
  variant,
} from './words';

export type VariantKey =
  | 'FOUL1'
  | 'FOUL2'
  | 'TOBE1'
  | 'TOBE2'
  | 'AMOG1'
  | 'AMOG2'
  | 'GREE1'
  | 'BOND1'
  | 'MINE1'
  | 'SHYE1'
  | 'TOBE3';

export const variantTitles: Record<VariantKey, string> = {
  FOUL1: 'Fair is Foul',
  TOBE1: 'To Be or Not to Be',
  AMOG1: 'One Impostor',
  GREE1: 'The Optimist',
  BOND1: 'Sweet Sorrow',
  MINE1: '[REDACTED]',
  SHYE1: "Don't Be Shy",

  FOUL2: 'Fair is Foul II',
  TOBE2: 'To Be or Not to Be II',
  AMOG2: 'Two Impostors',

  TOBE3: 'To Be or Not to Be III',
};

export const variantLimits: Record<VariantKey, number> = {
  FOUL1: 7,
  TOBE1: 7,
  AMOG1: 7,
  GREE1: 7,
  BOND1: 7,
  MINE1: 7,
  SHYE1: 7,

  FOUL2: 8,
  TOBE2: 8,
  AMOG2: 8,

  TOBE3: 10,
};

export type VariantStatusModifier = {
  guess?: string;
  solution?: string;
  override?: CharStatus[];
  tweak?: (realValues: CharStatus[]) => CharStatus[];
};

export type VariantKeyboardStatusModifier = {
  guesses?: string[];
  solution?: string;
  override?: { [key: string]: CharStatus };
  tweak?: (charStatus: { [key: string]: CharStatus }) => {
    [key: string]: CharStatus;
  };
};

const augmentCharObjForVariant = (charObj: { [key: string]: CharStatus }) => {
  const variantKey = getVariantKey(variant);
  switch (variantKey) {
    case 'AMOG1':
      const impostor = variant[6];
      if (charObj[impostor] === 'absent') {
        charObj[impostor] = 'present';
      }
      break;
    case 'AMOG2':
      [variant[6], variant[7]].forEach((impostor) => {
        if (charObj[impostor] === 'absent') {
          charObj[impostor] = 'present';
        }
      });
      break;
    case 'TOBE3':
      charObj['T'] = 'secret';
      charObj['O'] = 'secret';
      charObj['B'] = 'secret';
      charObj['E'] = 'secret';
      charObj['R'] = 'secret';
      charObj['N'] = 'secret';
      break;
    case 'TOBE2':
      charObj['T'] = 'secret';
      charObj['O'] = 'secret';
      charObj['B'] = 'secret';
      charObj['E'] = 'secret';
      break;
    case 'TOBE1':
      charObj['B'] = 'secret';
      charObj['E'] = 'secret';
      break;
    case 'GREE1':
      if (charObj[variant[6]] === 'present') {
        charObj[variant[6]] = 'correct';
      }
      break;
    case 'BOND1':
      Object.keys(charObj).forEach((char) => {
        if (charObj[char] === 'correct') {
          charObj[char] = 'present';
        }
      });
      break;
    case 'SHYE1':
      if (charObj[variant[6]] === 'present') {
        charObj[variant[6]] = 'absent';
      }
      break;
  }
  return charObj;
};

export const getVariantKeyboardStatusModifier = (
  guesses: string[]
): VariantKeyboardStatusModifier => {
  const variantKey = getVariantKey(variant);
  switch (variantKey) {
    case 'FOUL1':
      const swap1 = variant[6];
      const swap2 = variant[7];
      return {
        solution: solution
          .replaceAll(swap1, '!')
          .replaceAll(swap2, swap1)
          .replaceAll('!', swap2),
      };
    case 'FOUL2':
      const swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3]),
      };
    case 'MINE1':
      return {
        guesses: guesses.filter((guess) => !guess.includes(variant[6])),
      };
    default:
      return { tweak: (charObj) => augmentCharObjForVariant(charObj) };
  }
};

export const getVariantStatusModifier = (
  guess: string
): VariantStatusModifier => {
  const variantKey = getVariantKey(variant);
  switch (variantKey) {
    case 'AMOG1':
      const impostor = variant[6];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            guess[i] === impostor ? 'present' : status
          ),
      };
    case 'AMOG2':
      const impostors = [variant[6], variant[7]];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            impostors.includes(guess[i]) ? 'present' : status
          ),
      };
    case 'TOBE1':
      return {
        tweak: (statuses) => {
          const ignoreSecret = statuses.every(
            (status, i) =>
              status === 'correct' ||
              ('BE'.includes(guess[i]) && 'BE'.includes(solution[i]))
          );
          if (ignoreSecret) {
            return statuses;
          } else {
            return statuses.map((status, i) =>
              'BE'.includes(guess[i]) ? 'secret' : status
            );
          }
        },
      };
    case 'TOBE2':
      return {
        tweak: (statuses) => {
          const ignoreSecret = statuses.every(
            (status, i) =>
              status === 'correct' ||
              ('TOBE'.includes(guess[i]) && 'TOBE'.includes(solution[i]))
          );
          if (ignoreSecret) {
            return statuses;
          } else {
            return statuses.map((status, i) =>
              'TOBE'.includes(guess[i]) ? 'secret' : status
            );
          }
        },
      };
    case 'TOBE3':
      return {
        tweak: (statuses) => {
          const ignoreSecret = statuses.every(
            (status, i) =>
              status === 'correct' ||
              ('TOBERN'.includes(guess[i]) && 'TOBERN'.includes(solution[i]))
          );
          if (ignoreSecret) {
            return statuses;
          } else {
            return statuses.map((status, i) =>
              'TOBERN'.includes(guess[i]) ? 'secret' : status
            );
          }
        },
      };
    case 'FOUL1':
      const swap1 = variant[6];
      const swap2 = variant[7];
      return {
        solution: solution
          .replaceAll(swap1, '!')
          .replaceAll(swap2, swap1)
          .replaceAll('!', swap2),
      };
    case 'FOUL2':
      const swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3]),
      };
    case 'GREE1':
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            guess[i] === variant[6] && status === 'present' ? 'correct' : status
          ),
      };
    case 'BOND1':
      const bondIndex = parseInt(variant[6]);
      return {
        tweak: (statuses) =>
          statuses.map((status, i) => {
            // Make sure that this is the correct instance of the letter.
            let countDiscrepancy = 0;
            if (
              guess[i] === solution[bondIndex - 1] ||
              guess[i] === solution[bondIndex]
            ) {
              const targetIndex =
                guess[i] === solution[bondIndex] ? bondIndex : bondIndex - 1;
              const guessCount = unicodeSplit(guess.substr(0, i)).filter(
                (l) => l === guess[i]
              ).length;
              const solutionCount = unicodeSplit(
                solution.substr(0, targetIndex)
              ).filter((l) => l === guess[i]).length;
              countDiscrepancy = guessCount - solutionCount;
            }

            if (
              guess[i] === solution[bondIndex - 1] &&
              countDiscrepancy === 0
            ) {
              if (i < 4 && guess[i + 1] === solution[bondIndex]) {
                return 'correct';
              } else {
                return 'present';
              }
            } else if (guess[i] === solution[bondIndex]) {
              if (i > 0 && guess[i - 1] === solution[bondIndex - 1]) {
                return 'correct';
              } else {
                return 'present';
              }
            } else {
              return status;
            }
          }),
      };
    case 'MINE1':
      if (guess.includes(variant[6])) {
        return {
          override: ['secret', 'secret', 'secret', 'secret', 'secret'],
        };
      } else {
        return {};
      }
    case 'SHYE1':
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            guess[i] === variant[6] && status === 'present' ? 'absent' : status
          ),
      };
  }

  return {};
};

export const getVariantKey = (variantSpecifier: string): VariantKey =>
  variantSpecifier.substr(0, 5) as VariantKey;

export const getVariantTitle = (variantSpecifier: string): string => {
  return variantTitles[getVariantKey(variantSpecifier)];
};

export const generateImpostor = (solution: string, bannedLetters: string[]) => {
  const solutionLower = localeAwareLowerCase(solution);
  let impostor: string | null = null;
  let tries = 0;
  while (impostor === null) {
    impostor = WORDS[randBetweenRange(0, WORDS.length)][randBetweenRange(0, 5)];
    if (solutionLower.includes(impostor) || bannedLetters.includes(impostor)) {
      if (tries === 20) {
        impostor =
          ['E', 'A', 'I', 'O', 'U', 'Y'].find(
            (letter) =>
              !solutionLower.includes(letter) && !bannedLetters.includes(letter)
          ) || ';';
      } else {
        impostor = null;
        tries += 1;
      }
    }
  }
  return localeAwareUpperCase(impostor);
};

const generateFoulPairs = (solution: string, numPairs: number): string => {
  const solutionLower = localeAwareLowerCase(solution);
  const solutionVowels = unicodeSplit(solutionLower).filter((letter) =>
    'aeiou'.includes(letter)
  );
  let includedLetters: string[] = [];
  let includedPairs: string[][] = [];
  let numResets = 0;

  while (includedPairs.length < numPairs) {
    let existingPairCount = includedPairs.length;
    let x: string | null = null;
    let y: string | null = null;
    let tries = 0;
    const reducedSolutionVowels =
      includedPairs.length === 0
        ? solutionVowels
        : solutionVowels.filter((letter) => !includedLetters.includes(letter));
    while (x === null) {
      y = null;
      if (tries >= 10) {
        const skipLetters = includedLetters;
        let pair = [
          'ae',
          'ei',
          'eo',
          'eu',
          'ai',
          'ao',
          'au',
          'io',
          'iu',
          'ou',
        ].find((letters) => {
          const a = letters[0];
          const b = letters[1];
          if (
            skipLetters.includes(letters[0]) ||
            skipLetters.includes(letters[1])
          ) {
            return false;
          }
          if (existingPairCount < numPairs - 1) {
            return true;
          }
          let pseudoSolution = includedPairs.reduce(
            (sol, pair) =>
              sol
                .replaceAll(pair[0], '!')
                .replaceAll(pair[1], pair[0])
                .replaceAll('!', pair[1]),
            solutionLower
          );
          pseudoSolution = pseudoSolution
            .replaceAll(a as string, '!')
            .replaceAll(b, a as string)
            .replaceAll('!', b);

          return (
            pseudoSolution === solutionLower ||
            (!VALID_GUESSES.includes(pseudoSolution) &&
              !WORDS.includes(pseudoSolution))
          );
        });
        if (pair) {
          x = pair[0];
          y = pair[1];
          // console.log('SUCCESS?');
        } else {
          // console.log('RESET');
          x = 'RESET';
          y = null;
        }
        continue;
      }
      tries += 1;
      // console.log(tries);
      for (let j = 0; j < 2; ++j) {
        let vowel: string;
        if (reducedSolutionVowels.length > 0 && randBetweenRange(0, 3) === 0) {
          vowel =
            reducedSolutionVowels[
              randBetweenRange(0, reducedSolutionVowels.length)
            ];
        } else {
          const wordWithVowel = WORDS[randBetweenRange(0, WORDS.length)];
          let vowels = unicodeSplit(wordWithVowel).filter(
            (letter) =>
              'aeiou'.includes(letter) && !includedLetters.includes(letter)
          );
          if (vowels.length === 0) {
            // console.log('bad word choice');
            x = null;
            j = 2;
            continue;
          }
          vowel = vowels[randBetweenRange(0, vowels.length)];
        }
        if (includedLetters.includes(vowel)) {
          // console.log('!!', vowel, x, includedLetters);
          j = 2;
          x = null;
          continue;
        }
        if (j === 0) {
          x = vowel;
        } else {
          y = vowel;
          if (x === y) {
            // console.log(x);
            x = null;
          } else if (existingPairCount === numPairs - 1) {
            let pseudoSolution = includedPairs.reduce(
              (sol, pair) =>
                sol
                  .replaceAll(pair[0], '!')
                  .replaceAll(pair[1], pair[0])
                  .replaceAll('!', pair[1]),
              solutionLower
            );
            pseudoSolution = pseudoSolution
              .replaceAll(x as string, '!')
              .replaceAll(y, x as string)
              .replaceAll('!', y);
            if (
              pseudoSolution !== solutionLower &&
              (VALID_GUESSES.includes(pseudoSolution) ||
                WORDS.includes(pseudoSolution))
            ) {
              // console.log(x, y);
              // console.log(pseudoSolution);
              x = null;
              y = null;
            }
            // else {
            //   console.log('VALIDATED: ', pseudoSolution);
            //   console.log(includedPairs);
            // }
          }
        }
      }
    }
    if (x && y) {
      includedLetters.push(x, y);
      includedPairs.push([x, y]);
      // console.log('ADDED!', x, y);
    } else if (includedLetters.length > 0 && numResets < 5) {
      // console.log(':(');
      // console.log(includedLetters);
      // console.log(x, y);
      includedLetters = [];
      includedPairs = [];
      numResets += 1;
      tries = 0;
    } else {
      // console.log('????');
      // console.log(numResets);
      return '';
    }
  }
  return localeAwareUpperCase(includedLetters.join(''));
};

export const generateVariant = (solution: string, key: VariantKey): string => {
  let foulLetters: string;
  switch (key) {
    case 'TOBE1':
    case 'TOBE2':
    case 'TOBE3':
      return key;
    case 'AMOG1':
      return `AMOG1:${generateImpostor(solution, [])}`;
    case 'AMOG2':
      const impostor1 = generateImpostor(solution, []);
      const impostor2 = generateImpostor(solution, [impostor1]);
      return `AMOG1:${impostor1}${impostor2}`;
    case 'FOUL1':
      foulLetters = generateFoulPairs(solution, 1);
      if (foulLetters.length === 0) {
        console.error('FAILED TO GENERATE FOUL PAIR!');
        return 'TOBE1';
      }
      return `FOUL1:${foulLetters}`;
    case 'FOUL2':
      foulLetters = generateFoulPairs(solution, 2);
      if (foulLetters.length === 0) {
        console.error('FAILED TO GENERATE FOUL PAIRS!');
        return 'TOBE2';
      }
      return `FOUL2:${foulLetters}`;
    case 'GREE1':
      let greenLetter = solution[randBetweenRange(0, 5)];
      return `GREE1:${greenLetter}`;
    case 'BOND1':
      let n = randBetweenRange(1, 5);
      return `BOND1:${n}`;
    case 'MINE1':
      return `MINE1:${generateImpostor(solution, [])}`;
    case 'SHYE1':
      let shyLetter = solution[randBetweenRange(0, 5)];
      return `SHYE1:${shyLetter}`;
  }
};
