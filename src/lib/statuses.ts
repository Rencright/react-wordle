import { CharStatus } from './shared';
import {
  getVariantKeyboardStatusModifier,
  getVariantStatusModifier,
} from './variants';
import { solution, unicodeSplit } from './words';

export const getStatuses = (
  guesses: string[]
): { [key: string]: CharStatus } => {
  const modifier = getVariantKeyboardStatusModifier(guesses);
  if (modifier.override) {
    return modifier.override;
  }

  const charObj: { [key: string]: CharStatus } = {};
  const splitSolution = unicodeSplit(modifier.solution || solution);

  (modifier.guesses || guesses).forEach((word) => {
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

  if (modifier.tweak) {
    return modifier.tweak(charObj);
  } else {
    return charObj;
  }
};

export const getGuessStatuses = (guess: string): CharStatus[] => {
  if (guess === solution) {
    return ['correct', 'correct', 'correct', 'correct', 'correct'];
  }

  const modifier = getVariantStatusModifier(guess);

  if (modifier.override) {
    return modifier.override;
  }

  const splitSolution = unicodeSplit(modifier.solution || solution);
  const splitGuess = unicodeSplit(modifier.guess || guess);

  const solutionCharsTaken = splitSolution.map((_) => false);

  const statuses: CharStatus[] = Array.from(Array(guess.length));

  // handle all correct cases first
  splitGuess.forEach((letter, i) => {
    if (letter === splitSolution[i]) {
      statuses[i] = 'correct';
      solutionCharsTaken[i] = true;
      return;
    }
  });

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return;

    if (!splitSolution.includes(letter)) {
      // handles the absent case
      statuses[i] = 'absent';
      return;
    }

    // now we are left with "present"s
    const indexOfPresentChar = splitSolution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = 'present';
      solutionCharsTaken[indexOfPresentChar] = true;
      return;
    } else {
      statuses[i] = 'absent';
      return;
    }
  });

  if (modifier.tweak) {
    return modifier.tweak(statuses);
  }
  return statuses;
};
