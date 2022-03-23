// import { solutionIndex } from "./words";
import { WORDS } from "../constants/wordlist";
import { randBetweenRange } from "./random";
import { CharStatus } from "./shared";
import { localeAwareLowerCase, localeAwareUpperCase, solution, solutionIndex, variant } from "./words";


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
    // case 'TOBE1':
    //   charObj['B'] = 'secret';
    //   charObj['E'] = 'secret';
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
