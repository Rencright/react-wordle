// import { solutionIndex } from "./words";
import { WORDS } from "../constants/wordlist";
import { randBetweenRange } from "./random";
import { CharStatus } from "./shared";
import { localeAwareLowerCase, localeAwareUpperCase, solution, solutionIndex, unicodeSplit, variant } from "./words";


export const variantTitles: { [key: string]: string } = {
  FOUL1: 'Fair is Foul',
  TOBE1: 'To Be or Not to Be',
  AMOG1: 'One Impostor',
  GREE1: 'Being Green',

  FOUL2: 'Fair is Foul II',
  TOBE2: 'To Be or Not to Be II',
  AMOG2: 'Two Impostors',
};

export const variantLimits: { [key: string]: number } = {
  FOUL1: 7,
  TOBE1: 7,
  AMOG1: 7,
  GREE1: 7,

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

export const augmentCharObjForVariant = (charObj: { [key: string]: CharStatus }, guesses: string[]) => {
  console.log(solution);
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
    case 'FOUL1':
    case 'FOUL2':
      const swap1 = variant[6];
      const swap2 = variant[7];
      let modifiedSolution = solution.replace(swap1, '!').replace(swap2, swap1).replace('!', swap2);
      if (variantKey === 'FOUL2') {
        const swap3 = variant[8];
        const swap4 = variant[9];
        modifiedSolution = modifiedSolution.replace(swap3, '!').replace(swap4, swap3).replace('!', swap4);
      }
      const splitSolution = unicodeSplit(modifiedSolution);
      charObj = {};
      guesses.forEach((word) => {
        unicodeSplit(word).forEach((letter, i) => {
          if (!splitSolution.includes(letter)) {
            // make status absent
            return (charObj[letter] = 'absent');
          }
          if (letter === splitSolution[i]) {
            //make status correct
            return (charObj[letter] = 'correct');
          }
          if (charObj[letter] !== 'correct') {
            //make status present
            return (charObj[letter] = 'present');
          }
        });
      });
      break;
  }
  return charObj;
};

export const getVariantStatusModifier = (guess: string): VariantStatusModifier => {
  const variantKey = getVariantKey(variant);
  switch (variantKey) {
    case 'AMOG1':
      const impostor = variant[6];
      return {
        tweak: (statuses) => statuses.map((status, i) => (guess[i] === impostor ? 'present' : status)),
      };
    case 'AMOG2':
      const impostors = [variant[6], variant[7]];
      return {
        tweak: (statuses) => statuses.map((status, i) => (impostors.includes(guess[i]) ? 'present' : status)),
      };
    case 'TOBE1':
      return {
        tweak: (statuses) => {
          const ignoreSecret = statuses.every((status, i) => status === 'correct' || ('BE'.includes(guess[i]) && 'BE'.includes(solution[i])));
          if (ignoreSecret) {
            return statuses;
          } else {
            return statuses.map((status, i) => 'BE'.includes(guess[i]) ? 'secret' : status);
          }
        },
      };
    case 'TOBE2':
      return {
        tweak: (statuses) => {
          const ignoreSecret = statuses.every((status, i) => status === 'correct' || ('TOBE'.includes(guess[i]) && 'TOBE'.includes(solution[i])));
          if (ignoreSecret) {
            return statuses;
          } else {
            return statuses.map((status, i) => 'TOBE'.includes(guess[i]) ? 'secret' : status);
          }
        },
      };
    case 'FOUL1':
      const swap1 = variant[6];
      const swap2 = variant[7];
      return {
        solution: solution.replace(swap1, '!').replace(swap2, swap1).replace('!', swap2),
      };
    case 'FOUL2':
      const swaps = variant.substr(6);
      return {
        solution: solution.replace(swaps[0], '!').replace(swaps[1], swaps[0]).replace('!', swaps[1])
          .replace(swaps[2], '!').replace(swaps[3], swaps[2]).replace('!', swaps[3]),
      };
    case 'GREE1':
      return {
        tweak: (statuses) => (statuses.map((status, i) => guess[i] === variant[6] && status === 'present' ? 'correct' : status)),
      };
  }

  return {};
}

export const getVariantKey = (variantSpecifier: string): string =>
  variantSpecifier.slice(0, 5);

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
        impostor = ['E', 'A', 'I', 'O', 'U', 'Y'].find((letter) => !solutionLower.includes(letter) && !bannedLetters.includes(letter)) || ';';
      } else {
        impostor = null;
        tries += 1;
      }
    }
  }
  return localeAwareUpperCase(impostor);
}

export const getVariantOfDay = (): string => {
  console.log(solutionIndex);
  return 'AMOG1:E';

  // return `AMOG1:${generateImpostor([])}`;

};

// export const variant = getVariantOfDay();
