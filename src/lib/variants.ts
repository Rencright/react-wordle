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
  | 'BOND1';

export const variantTitles: Record<VariantKey, string> = {
  FOUL1: 'Fair is Foul',
  TOBE1: 'To Be or Not to Be',
  AMOG1: 'One Impostor',
  GREE1: 'Being Green',
  BOND1: 'Sweet Sorrow',

  FOUL2: 'Fair is Foul II',
  TOBE2: 'To Be or Not to Be II',
  AMOG2: 'Two Impostors',
};

export const variantLimits: Record<VariantKey, number> = {
  FOUL1: 7,
  TOBE1: 7,
  AMOG1: 7,
  GREE1: 7,
  BOND1: 7,

  FOUL2: 8,
  TOBE2: 8,
  AMOG2: 8,
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

const augmentCharObjForVariant = (
  charObj: { [key: string]: CharStatus },
  guesses: string[]
) => {
  // console.log(solution);
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
          .replace(swap1, '!')
          .replace(swap2, swap1)
          .replace('!', swap2),
      };
    case 'FOUL2':
      const swaps = variant.substr(6);
      return {
        solution: solution
          .replace(swaps[0], '!')
          .replace(swaps[1], swaps[0])
          .replace('!', swaps[1])
          .replace(swaps[2], '!')
          .replace(swaps[3], swaps[2])
          .replace('!', swaps[3]),
      };
    default:
      return { tweak: (charObj) => augmentCharObjForVariant(charObj, guesses) };
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
    case 'FOUL1':
      const swap1 = variant[6];
      const swap2 = variant[7];
      return {
        solution: solution
          .replace(swap1, '!')
          .replace(swap2, swap1)
          .replace('!', swap2),
      };
    case 'FOUL2':
      const swaps = variant.substr(6);
      return {
        solution: solution
          .replace(swaps[0], '!')
          .replace(swaps[1], swaps[0])
          .replace('!', swaps[1])
          .replace(swaps[2], '!')
          .replace(swaps[3], swaps[2])
          .replace('!', swaps[3]),
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
            if (guess[i] === solution[bondIndex - 1] || guess[i] === solution[bondIndex]) {
              const targetIndex = (guess[i] === solution[bondIndex]) ? bondIndex : (bondIndex - 1);
              const guessCount = unicodeSplit(guess.substr(0, i)).filter((l) => l === guess[i]).length;
              const solutionCount =  unicodeSplit(solution.substr(0, targetIndex)).filter((l) => l === guess[i]).length;
              countDiscrepancy = guessCount - solutionCount;
            }

            if (guess[i] === solution[bondIndex - 1] && countDiscrepancy === 0) {
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
      }
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
  let numResets = 0;
  for (let i = 0; i < numPairs; ++i) {
    let x: string | null = null;
    let y: string | null = null;
    let tries = 0;
    while (x === null) {
      if (tries >= 10) {
        const skipLetters = includedLetters;
        let pair = [
          'AE',
          'EI',
          'EO',
          'EU',
          'AI',
          'AO',
          'AU',
          'IO',
          'IU',
          'OU',
        ].find((letters) => {
          const a = letters[0];
          const b = letters[1];
          if (
            skipLetters.includes(letters[0]) ||
            skipLetters.includes(letters[1])
          ) {
            return false;
          }
          const pseudoSolution = solution
            .replace(a, '!')
            .replace(b, a)
            .replace('!', b);
          return (
            pseudoSolution === solution ||
            !VALID_GUESSES.includes(pseudoSolution)
          );
        });
        if (pair) {
          x = pair[0];
          y = pair[1];
        } else {
          x = 'RESET';
          y = null;
        }
      }
      tries += 1;
      for (let j = 0; j < 2; ++j) {
        let vowel: string;
        if (randBetweenRange(0, 2) === 0) {
          vowel = solutionVowels[randBetweenRange(0, solutionVowels.length)];
        } else {
          const wordWithVowel = WORDS[randBetweenRange(0, WORDS.length)];
          const vowels = unicodeSplit(wordWithVowel).filter((letter) =>
            'aeiou'.includes(letter)
          );
          vowel = vowels[randBetweenRange(0, solutionVowels.length)];
        }
        if (includedLetters.includes(vowel)) {
          break;
        }
        if (j === 0) {
          x = vowel;
        } else {
          y = vowel;
          if (x === y) {
            x = null;
          } else {
            const pseudoSolution = solution
              .replace(x as string, '!')
              .replace(y, x as string)
              .replace('!', y);
            if (
              pseudoSolution !== solution &&
              VALID_GUESSES.includes(pseudoSolution)
            ) {
              x = null;
              y = null;
            }
          }
        }
      }
    }
    if (x !== null && y !== null) {
      includedLetters.push(x, y);
    } else if (includedLetters.length > 0 && numResets < 5) {
      includedLetters = [];
      numResets += 1;
    } else {
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
  }
};

// export const getVariantOfDay = (): string => {
//   console.log(solutionIndex);
//   return 'AMOG1:E';

//   // return `AMOG1:${generateImpostor([])}`;

// };

// export const variant = getVariantOfDay();
