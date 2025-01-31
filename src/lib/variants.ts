/* eslint-disable no-loop-func */
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
  | 'TOBE3'
  | 'AMOG3'
  | 'GREE2'
  | 'SHYE2'
  | 'MINE2'
  | 'FOUL3'
  | 'SHIF1'
  | 'SHIF2'
  | 'OUTO1'
  | 'OUTO2';

export const variantTitles: Record<VariantKey, string> = {
  FOUL1: 'Fair is Foul',
  TOBE1: 'To Be or Not to Be',
  AMOG1: 'One Impostor',
  GREE1: 'The Optimist',
  BOND1: 'Sweet Sorrow',
  MINE1: '[REDACTED]',
  SHYE1: "Don't Be Shy",
  SHIF1: 'Shifty',
  OUTO1: 'Out of Touch',

  FOUL2: 'Fair is Foul II',
  TOBE2: 'To Be or Not to Be II',
  AMOG2: 'Two Impostors',
  GREE2: 'The Optimist II',
  SHYE2: "Don't Be Shy II",
  MINE2: '[DATA EXPUNGED]',
  SHIF2: 'Shifty II',
  OUTO2: 'Out of Touch II',

  TOBE3: 'To Be or Not to Be III',
  AMOG3: 'Three Impostors',
  FOUL3: 'Fair is Foul III',
};

export const variantLimits: Record<VariantKey, number> = {
  FOUL1: 7,
  TOBE1: 7,
  AMOG1: 7,
  GREE1: 7,
  BOND1: 7,
  MINE1: 7,
  SHYE1: 7,
  SHIF1: 6,
  OUTO1: 6,

  FOUL2: 9,
  TOBE2: 8,
  AMOG2: 8,
  GREE2: 8,
  SHYE2: 8,
  MINE2: 9,
  SHIF2: 7,
  OUTO2: 7,

  TOBE3: 10,
  AMOG3: 9,
  FOUL3: 12,
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
    case 'AMOG3':
      [variant[6], variant[7], variant[8]].forEach((impostor) => {
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
    case 'GREE2':
      if (charObj[variant[6]] === 'present') {
        charObj[variant[6]] = 'correct';
      }
      if (charObj[variant[7]] === 'present') {
        charObj[variant[7]] = 'correct';
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
    case 'SHYE2':
      if (charObj[variant[6]] === 'present') {
        charObj[variant[6]] = 'absent';
      }
      if (charObj[variant[7]] === 'present') {
        charObj[variant[7]] = 'absent';
      }
      break;
  }
  return charObj;
};

export const getVariantKeyboardStatusModifier = (
  guesses: string[]
): VariantKeyboardStatusModifier => {
  const variantKey = getVariantKey(variant);
  let swaps: string;
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
      swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3]),
      };
    case 'FOUL3':
      swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3])
          .replaceAll(swaps[4], '!')
          .replaceAll(swaps[5], swaps[4])
          .replaceAll('!', swaps[5]),
      };
    case 'MINE1':
      return {
        guesses: guesses.filter((guess) => !guess.includes(variant[6])),
      };
    case 'MINE2':
      return {
        guesses: guesses.filter((guess) => !guess.includes(variant[6]) && !guess.includes(variant[7])),
      };
    case 'OUTO1':
    case 'OUTO2':
      // No information is reliable so don't even try.
      return {
        override: {},
      };
    default:
      return { tweak: (charObj) => augmentCharObjForVariant(charObj) };
  }
};

export const getVariantStatusModifier = (
  guess: string
): VariantStatusModifier => {
  const variantKey = getVariantKey(variant);
  let lettersOfNote: string[];
  let swaps: string;
  let num1: number;
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
      lettersOfNote = [variant[6], variant[7]];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            lettersOfNote.includes(guess[i]) ? 'present' : status
          ),
      };
    case 'AMOG3':
      lettersOfNote = [variant[6], variant[7], variant[8]];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            lettersOfNote.includes(guess[i]) ? 'present' : status
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
      swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3]),
      };
    case 'FOUL3':
      swaps = variant.substr(6);
      return {
        solution: solution
          .replaceAll(swaps[0], '!')
          .replaceAll(swaps[1], swaps[0])
          .replaceAll('!', swaps[1])
          .replaceAll(swaps[2], '!')
          .replaceAll(swaps[3], swaps[2])
          .replaceAll('!', swaps[3])
          .replaceAll(swaps[4], '!')
          .replaceAll(swaps[5], swaps[4])
          .replaceAll('!', swaps[5]),
      };
    case 'GREE1':
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            guess[i] === variant[6] && status === 'present' ? 'correct' : status
          ),
      };
    case 'GREE2':
      const happyLetters = [variant[6], variant[7]];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            happyLetters.includes(guess[i]) && status === 'present' ? 'correct' : status
          ),
      };
    case 'BOND1':
      const bondIndex = parseInt(variant[6]);
      return {
        tweak: (statuses) => {
          let newStatuses = [...statuses];
          let romeoIndex = bondIndex - 1;
          let julietIndex = bondIndex;
          let romeo = solution[bondIndex - 1];
          let juliet = solution[bondIndex];
          const splitSolution = unicodeSplit(solution);
          const splitGuess = unicodeSplit(guess);
          let romeoDuplicateIndex = splitSolution.reduce(
            (count, l, i) =>
              l === romeo && i < romeoIndex ? count + 1 : count,
            0
          );
          let julietDuplicateIndex = splitSolution.reduce(
            (count, l, i) =>
              l === juliet && i < julietIndex ? count + 1 : count,
            0
          );
          let romeoInstances = splitSolution.reduce(
            (count, l, i) => (l === romeo ? count + 1 : count),
            0
          );
          let julietInstances = splitSolution.reduce(
            (count, l, i) => (l === juliet ? count + 1 : count),
            0
          );

          let romeoIndicesInGuess = splitGuess
            .map((letter, i) => (letter === romeo ? i : -1))
            .filter((i) => i >= 0);
          let julietIndicesInGuess = splitGuess
            .map((letter, i) => (letter === juliet ? i : -1))
            .filter((i) => i >= 0);

          let correctRomeos: number[] = [];
          romeoIndicesInGuess.forEach((index, duplicateIndex) => {
            if (duplicateIndex === romeoDuplicateIndex) {
              if (index < 4 && splitGuess[index + 1] === juliet) {
                newStatuses[index] = 'correct';
                correctRomeos.push(index);
              }
            } else if (
              romeo === juliet &&
              duplicateIndex === julietDuplicateIndex
            ) {
              if (index > 0 && splitGuess[index - 1] === romeo) {
                newStatuses[index] = 'correct';
                correctRomeos.push(index);
              }
            } else {
              if (index !== romeoIndex && splitSolution[index] === romeo) {
                newStatuses[index] = 'correct';
                correctRomeos.push(index);
              }
            }
          });
          let runningRomeoCount = correctRomeos.length;
          romeoIndicesInGuess.forEach((index) => {
            if (!correctRomeos.includes(index)) {
              if (runningRomeoCount < romeoInstances) {
                newStatuses[index] = 'present';
                runningRomeoCount += 1;
              } else {
                newStatuses[index] = 'absent';
              }
            }
          });

          if (romeo !== juliet) {
            let correctJuliets: number[] = [];
            julietIndicesInGuess.forEach((index, duplicateIndex) => {
              if (duplicateIndex === julietDuplicateIndex) {
                if (index > 0 && splitGuess[index - 1] === romeo) {
                  newStatuses[index] = 'correct';
                  correctJuliets.push(index);
                }
              } else {
                if (index !== julietIndex && splitSolution[index] === juliet) {
                  newStatuses[index] = 'correct';
                  correctJuliets.push(index);
                }
              }
            });
            let runningJulietCount = correctJuliets.length;
            julietIndicesInGuess.forEach((index) => {
              if (!correctJuliets.includes(index)) {
                if (runningJulietCount < julietInstances) {
                  newStatuses[index] = 'present';
                  runningJulietCount += 1;
                } else {
                  newStatuses[index] = 'absent';
                }
              }
            });
          }
          return newStatuses;
        },
      };
    case 'MINE1':
      if (guess.includes(variant[6])) {
        return {
          override: ['secret', 'secret', 'secret', 'secret', 'secret'],
        };
      } else {
        return {};
      }
    case 'MINE2':
      if (guess.includes(variant[6]) || guess.includes(variant[7])) {
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
    case 'SHYE2':
      lettersOfNote = [variant[6], variant[7]];
      return {
        tweak: (statuses) =>
          statuses.map((status, i) =>
            lettersOfNote.includes(guess[i]) && status === 'present' ? 'absent' : status
          ),
      };
    case 'SHIF1':
    case 'SHIF2':
      return {};
    case 'OUTO1':
    case 'OUTO2':
      num1 = parseInt(variant[6]);
      return {
        tweak: (statuses) => statuses.slice(num1).concat(statuses.slice(0, num1)),
      };
  }
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

const generateFoulVowels = (solution: string, numPairs: number, existingPairs?: string[][]): string => {
  const originalPairs = existingPairs ? [...existingPairs] : [];

  const solutionLower = localeAwareLowerCase(solution);
  const solutionVowels = unicodeSplit(solutionLower).filter((letter) =>
    'aeiou'.includes(letter)
  );
  let includedLetters: string[] = [];
  let includedPairs: string[][] = [...originalPairs];

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
    } else if (numResets < 5) {
      // console.log(':(');
      // console.log(includedLetters);
      // console.log(x, y);
      includedLetters = [];
      includedPairs = [...originalPairs];
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

const generateFoulConsonantsAndVowels = (solution: string): string => {
  const consonantGroups = [
    'bdg',
    'ckpqt',
    'cfsx',
    'gjvz',
    // 'BCDGKPQT',
    // 'CFGJSVXZ',
    'lr',
    'mn',
    'wy',
  ];

  const solutionLower = localeAwareLowerCase(solution);
  const solutionSwappableConsonants = unicodeSplit(solutionLower).filter((letter) =>
    !'haeiou'.includes(letter)
  );

  let x: string | null = null;
  let y: string | null = null;
  let vowels: string | null = null;
  let tries = 0;
  while (x === null || y === null) {
    x = null;
    y = null;
    if (tries > 10) {
      const possiblePairs = [
        'lr',
        'mn',
        'pt',
        'sc',
        'sf',
        'tc',
        'gv',
        'gj',
        'vz',
        'bd',
        'bg',
        'dg',
        'wy',
        'xz',
      ];
      for (let pair of possiblePairs) {
        vowels = generateFoulVowels(solution, 3, [[pair[0], pair[1]]]);
        if (vowels.length === 4) {
          return localeAwareUpperCase(pair + vowels);
        }
      }
      console.log(':(');
      return '';
    }

    if (solutionSwappableConsonants.length > 0 && randBetweenRange(0, 3) === 0) {
      x = solutionSwappableConsonants[randBetweenRange(0, solutionSwappableConsonants.length)];
    } else {
      const word = WORDS[randBetweenRange(0, WORDS.length)];
      const wordConsonants = unicodeSplit(word).filter((letter) =>
        !'haeiou'.includes(letter)
      );
      if (wordConsonants.length > 0) {
        x = wordConsonants[randBetweenRange(0, wordConsonants.length)];
      }
    }
    if (x !== null) {
      const letterGroup = consonantGroups.filter((group) => group.includes(x as string)).join('').split('').filter(letter => letter !== x);

      const stillSwappableConsonants = solutionSwappableConsonants.filter(letter => letterGroup.includes(letter));
      if (stillSwappableConsonants.length === 1) {
        y = stillSwappableConsonants[0];
      } else if (stillSwappableConsonants.length > 0 && randBetweenRange(0, 5) === 0) {
        y = stillSwappableConsonants[randBetweenRange(0, stillSwappableConsonants.length)];
      } else {
        const filteredWords = WORDS.filter(word => letterGroup.some(letter => word.includes(letter)));
        const word = filteredWords[randBetweenRange(0, filteredWords.length)];
        const wordConsonants = unicodeSplit(word).filter((letter) =>
          letterGroup.includes(letter)
        );
        if (wordConsonants.length > 0) {
          y = wordConsonants[randBetweenRange(0, wordConsonants.length)];
        }
      }
    }
    if (x && y) {
      vowels = generateFoulVowels(solution, 3, [[x, y]]);
      // console.log(x, y, vowels);
      if (vowels.length < 4) {
        x = null;
        y = null;
      }
    }
    tries += 1;
  }
  if (x && y && vowels) {
    return localeAwareUpperCase(x + y + vowels);
  } else {
    return '';
  }
}

export const generateVariant = (solution: string, key: VariantKey): string => {
  let foulLetters: string;
  let modifiedWord: string | string[];
  let letter1: string;
  let letter2: string;
  let letter3: string;
  switch (key) {
    case 'TOBE1':
    case 'TOBE2':
    case 'TOBE3':
      return key;
    case 'AMOG1':
      return `AMOG1:${generateImpostor(solution, [])}`;
    case 'AMOG2':
      letter1 = generateImpostor(solution, []);
      letter2 = generateImpostor(solution, [letter1]);
      return `AMOG2:${letter1}${letter2}`;
    case 'AMOG3':
      letter1 = generateImpostor(solution, []);
      letter2 = generateImpostor(solution, [letter1]);
      letter3 = generateImpostor(solution, [letter1, letter2]);
      return `AMOG3:${letter1}${letter2}${letter3}`;
    case 'FOUL1':
      foulLetters = generateFoulVowels(solution, 1);
      if (foulLetters.length < 2) {
        console.error('FAILED TO GENERATE FOUL PAIR!');
        return 'TOBE1';
      }
      return `FOUL1:${foulLetters}`;
    case 'FOUL2':
      foulLetters = generateFoulVowels(solution, 2);
      if (foulLetters.length < 4) {
        console.error('FAILED TO GENERATE FOUL PAIRS!');
        return 'TOBE2';
      }
      return `FOUL2:${foulLetters}`;
    case 'FOUL3':
      foulLetters = generateFoulConsonantsAndVowels(solution);
      if (foulLetters.length < 6) {
        console.error('FAILED TO GENERATE FOUL PAIRS!');
        return 'TOBE3';
      }
      return `FOUL3:${foulLetters}`;
    case 'GREE1':
      letter1 = solution[randBetweenRange(0, 5)];
      return `GREE1:${letter1}`;
    case 'GREE2':
      letter1 = solution[randBetweenRange(0, 5)];
      modifiedWord = unicodeSplit(solution).filter(letter => letter !== letter1);
      letter2 = modifiedWord[randBetweenRange(0, modifiedWord.length)];
      return `GREE2:${letter1}${letter2}`;
    case 'BOND1':
      let n = randBetweenRange(1, 5);
      return `BOND1:${n}`;
    case 'MINE1':
      return `MINE1:${generateImpostor(solution, [])}`;
    case 'MINE2':
      letter1 = generateImpostor(solution, []);
      letter2 = generateImpostor(solution, [letter1]);
      return `MINE2:${letter1}${letter2}`;
    case 'SHYE1':
      let shyLetter = solution[randBetweenRange(0, 5)];
      return `SHYE1:${shyLetter}`;
    case 'SHYE2':
      letter1 = solution[randBetweenRange(0, 5)];
      modifiedWord = unicodeSplit(solution).filter(letter => letter !== letter1);
      letter2 = modifiedWord[randBetweenRange(0, modifiedWord.length)];
      return `SHYE2:${letter1}${letter2}`;
    case 'SHIF1':
      return `SHIF1:${[0, 1, 4][randBetweenRange(0, 3)]}`;
    case 'SHIF2':
      return `SHIF2:${randBetweenRange(0, 5)}`;
    case 'OUTO1':
      return `OUTO1:${[1, 4][randBetweenRange(0, 2)]}`;
    case 'OUTO2':
      return `OUTO2:${randBetweenRange(0, 5)}`;
  }
};
