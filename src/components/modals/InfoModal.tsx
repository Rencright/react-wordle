import React from 'react';
import { CharStatus } from '../../lib/shared';
import { getVariantKey, getVariantTitle, VariantKey } from '../../lib/variants';
import { maxChallenges, variant } from '../../lib/words';
import { Cell } from '../grid/Cell';
import { BaseModal } from './BaseModal';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

type Info = {
  title?: string;
  description: string[];
  examples: {
    guess: string;
    statuses: (CharStatus | null)[];
    explanation: string;
  }[];
};

// const originalInfo: Info = {
//   title: 'How to play',
//   description: ['Guess the word in 6 tries. After each guess, the color of the tiles will change to show how ' +
//     'close your guess was to the word.'],
//   examples: [
//     {
//       guess: 'WEARY',
//       statuses: ['correct', null, null, null, null],
//       explanation: 'The letter W is in the word and in the correct spot.',
//     },
//     {
//       guess: 'PILOT',
//       statuses: [null, null, 'present', null, null],
//       explanation: 'The letter L is in the word but in the wrong spot.',
//     },
//     {
//       guess: 'VAGUE',
//       statuses: [null, null, null, 'absent', null],
//       explanation: 'The letter U is not in the word in any spot.',
//     },
//   ],
// }

const modalContentForVariant: Record<VariantKey, Info> = {
  AMOG1: {
    description: [
      "Today's variation: one letter is an impostor. It is not in the word, but appears yellow (blue in high-contrast). More common letters are more likely to be impostors.",
    ],
    examples: [
      {
        guess: 'PILOT',
        statuses: [null, null, 'present', null, null],
        explanation:
          'The letter L could be in the word but in the wrong spot, or it could be the impostor.',
      },
    ],
  },
  AMOG2: {
    description: [
      "Today's variation: two letters are impostors. They are not in the word, but appear yellow (blue in high-contrast). More common letters are more likely to be impostors.",
    ],
    examples: [
      {
        guess: 'PILOT',
        statuses: [null, null, 'present', null, null],
        explanation:
          'The letter L could be in the word but in the wrong spot, or it could be an impostor.',
      },
    ],
  },
  AMOG3: {
    description: [
      "Today's variation: three letters are impostors. They are not in the word, but appear yellow (blue in high-contrast). More common letters are more likely to be impostors.",
    ],
    examples: [
      {
        guess: 'PILOT',
        statuses: [null, null, 'present', null, null],
        explanation:
          'The letter L could be in the word but in the wrong spot, or it could be an impostor.',
      },
    ],
  },
  TOBE1: {
    description: [
      "Today's variation: the letters B and E are red. They will only change colour if you place all other letters correctly.",
    ],
    examples: [
      {
        guess: 'LABOR',
        statuses: [null, null, 'secret', null, null],
        explanation:
          'You cannot learn anything about whether B is in the word or not.',
      },
    ],
  },
  TOBE2: {
    description: [
      "Today's variation: the letters T, O, B, and E are red. They will only change colour if you place all other letters correctly.",
    ],
    examples: [
      {
        guess: 'LABOR',
        statuses: [null, null, 'secret', null, null],
        explanation:
          'You cannot learn anything about whether B is in the word or not.',
      },
      {
        guess: 'THESE',
        statuses: ['correct', 'correct', 'absent', 'correct', 'correct'],
        explanation:
          "The correct word is clearly THOSE. Now that you've placed all non-red letters, the red letters reveal their true colours.",
      },
    ],
  },
  TOBE3: {
    description: [
      "Today's variation: the letters T, O, B, E, R, and N are ALL red. They will only change colour if you place all other letters correctly.",
      'There are some words that can be spelled entirely using these letters.',
    ],
    examples: [
      {
        guess: 'LABOR',
        statuses: [null, null, 'secret', null, null],
        explanation:
          'You cannot learn anything about whether B is in the word or not.',
      },
      {
        guess: 'THESE',
        statuses: ['correct', 'correct', 'absent', 'correct', 'correct'],
        explanation:
          "The correct word is clearly THOSE. Now that you've placed all non-red letters, the red letters reveal their true colours.",
      },
      {
        guess: 'BREAK',
        statuses: ['secret', 'secret', 'secret', 'correct', 'correct'],
        explanation:
          "A and K are in the right spots, but there must be at least one more non-red letter or the red letters wouldn't still be red.",
      },
    ],
  },
  GREE1: {
    description: [
      "Today's variation: one letter in the word is happy. It always thinks it's in the right spot - it will appear green (or orange - right letter in right spot) whenever it would appear yellow (or blue - right letter in wrong spot).",
    ],
    examples: [
      {
        guess: 'WEARY',
        statuses: [null, null, 'correct', null, null],
        explanation:
          'The letter A is in the word. It could be in the correct spot, or it could be the happy letter.',
      },
      {
        guess: 'EMCEE',
        statuses: ['correct', null, null, 'correct', 'absent'],
        explanation:
          'The letter E occurs twice. It occurs in the first and fourth position, unless E is the happy letter, in which case it could occur in any two spots.',
      },
      {
        guess: 'NAVAL',
        statuses: [null, 'absent', null, 'correct', null],
        explanation:
          'The letter A is in the fourth spot. We know this for a fact whether A is the happy letter or not.',
      },
    ],
  },
  GREE2: {
    description: [
      "Today's variation: two letters in the word are happy. A happy letter always thinks it's in the right spot - it will appear green (or orange - right letter in right spot) whenever it would appear yellow (or blue - right letter in wrong spot).",
    ],
    examples: [
      {
        guess: 'WEARY',
        statuses: [null, null, 'correct', null, null],
        explanation:
          'The letter A is in the word. It could be in the correct spot, or it could be a happy letter.',
      },
      {
        guess: 'EMCEE',
        statuses: ['correct', null, null, 'correct', 'absent'],
        explanation:
          'The letter E occurs twice. It occurs in the first and fourth position, unless E is a happy letter, in which case it could occur in any two spots.',
      },
      {
        guess: 'NAVAL',
        statuses: [null, 'absent', null, 'correct', null],
        explanation:
          'The letter A is in the fourth spot. We know this for a fact whether A is a happy letter or not.',
      },
    ],
  },
  FOUL1: {
    description: [
      "Today's variation: there are two vowels in the alphabet (not including Y) that are swapped - each one appears the colour that the other would appear in its place. More precisely, the game swaps all instance of one letter in your guess for the other before determining colours.",
      "Vowels in the word are more likely to be swapped, as are more common vowels.",
      "Rest assured that you'll never see an all-green word that's not the correct answer.",
    ],
    examples: [
      {
        guess: 'VIDEO',
        statuses: [null, 'present', null, 'correct', 'absent'],
        explanation:
          'It appears that I is in the word but not in the second spot, E is in the fourth spot, and O is not in the word, but that could be wrong. If O and E are swapped, then O belongs in the fourth spot and E is not in the word. If O and I are swapped, then O is somewhere but not the second spot and I is not in the word. If A and E are swapped, then A is in the fourth spot and we have no real information about E. If A and U are swapped, then this information is all correct.',
      },
    ],
  },
  FOUL2: {
    description: [
      "Today's variation: two pairs of vowels (not including Y) are swapped - each vowel in a pair will always appear the colour that the other would appear in its place.",
      "Vowels in the word are more likely to be swapped, as are more common vowels.",
      "Rest assured that you'll never see an all-green word that's not the correct answer.",
    ],
    examples: [
      {
        guess: 'VIDEO',
        statuses: [null, 'present', null, 'correct', 'absent'],
        explanation:
          'It appears that I is in the word but not in the second spot, E is in the fourth spot, and O is not in the word, but that could be wrong. If O and E are swapped, then O belongs in the fourth spot and E is not in the word. If O and I are swapped, then O is somewhere but not the second spot and I is not in the word. If A and E are swapped, then A is in the fourth spot and we have no real information about E. Remember that there are two different swaps, so all information on all but one vowel is wrong.',
      },
    ],
  },
  FOUL3: {
    description: [
      "Today's variation: two pairs of vowels (not including Y) are swapped - each vowel in a pair appears the colour that the other would appear in its place. Vowels in the word are more likely to be swapped, as are more common vowels.",
      "In addition, two consonants are swapped. The swapped consonants will both be in one of the following groups:",
      "Voiced stops: B, D, G.",
      "Voiceless stops: C, K, P, Q, T.",
      "Voiced fricatives/affricates: G, J, V, Z.",
      "Voiceless fricatives/affricates: C, F, S, X.",
      "Liquids: L, R.",
      "Nasals: M, N.",
      "Glides: W, Y.",
      "(H cannot be swapped.)",
      "Rest assured that you'll never see an all-green word that's not the correct answer.",
    ],
    examples: [
      {
        guess: 'VIDEO',
        statuses: ['present', 'present', 'absent', 'correct', 'absent'],
        explanation:
          'It appears that I is in the word but not in the second spot, E is in the fourth spot, and O is not in the word, but that could be wrong. If O and E are swapped, then O belongs in the fourth spot and E is not in the word. If O and I are swapped, then O is somewhere but not the second spot and I is not in the word. If A and E are swapped, then A is in the fourth spot and we have no real information about E. In addition, V could be swapped with G, J, or Z, or D could be swapped with B or G.',
      },
    ],
  },
  BOND1: {
    description: [
      "Today's variation: there are two adjacent letters in the word that are married - their colour is determined not by which spot they're in, but whether or not the other letter is next to it on the correct side. If the letter appears multiple times in a word, only one instance of the letter is married.",
    ],
    examples: [
      {
        guess: 'SWING',
        statuses: [null, null, 'correct', 'correct', null],
        explanation:
          'I and N seem to be in the third and fourth spots. It\'s also possible that the letters are married, in which case all we know is that "IN" appears somewhere in the real word.',
      },
      {
        guess: 'HELLO',
        statuses: ['present', null, null, null, null],
        explanation:
          'H is in the word. It seems that it is in the wrong spot, but if H is one of the married letters, then it would appear yellow even in the correct spot, unless its partner is next to it.',
      },
    ],
  },
  MINE1: {
    description: [
      "Today's variation: one letter that's not in the word is classified - if you use it in a word, you get no information from that word.",
    ],
    examples: [
      {
        guess: 'FRANK',
        statuses: ['secret', 'secret', 'secret', 'secret', 'secret'],
        explanation:
          'One of the letters F, R, A, N, or K is the classified letter, and thus not in the word. That is all you learn from this guess.',
      },
      {
        guess: 'BLING',
        statuses: ['absent', 'present', 'correct', 'absent', 'absent'],
        explanation:
          "B, N, and G are not in the word, but they're not the classified letter, so you can safely use them in other guesses.",
      },
    ],
  },
  MINE2: {
    description: [
      "Today's variation: two letters that are not in the word are classified - if you use one of them in a word, you get no information from that word.",
    ],
    examples: [
      {
        guess: 'FRANK',
        statuses: ['secret', 'secret', 'secret', 'secret', 'secret'],
        explanation:
          'At least one of the letters F, R, A, N, or K is a classified letter, and thus not in the word. That is all you learn from this guess.',
      },
      {
        guess: 'BLING',
        statuses: ['absent', 'present', 'correct', 'absent', 'absent'],
        explanation:
          "B, N, and G are not in the word, but they're not classified letters, so you can safely use them in other guesses.",
      },
    ],
  },
  SHYE1: {
    description: [
      "Today's variation: one letter in the word is shy. A shy letter will appear grey (not in the word) when it's not in the correct spot, despite being in the word.",
    ],
    examples: [
      {
        guess: 'FLYER',
        statuses: [null, null, null, 'absent', null],
        explanation:
          "The letter E is not in the word, unless it's the shy letter, in which case it's not in the fourth position.",
      },
      {
        guess: 'BOOTS',
        statuses: ['correct', null, null, null, null],
        explanation:
          "B is in the word in the first position, whether it's the shy letter or not.",
      },
    ],
  },
  SHYE2: {
    description: [
      "Today's variation: two letters in the word are shy. A shy letter will appear grey (not in the word) when it's not in the correct spot.",
    ],
    examples: [
      {
        guess: 'FLYER',
        statuses: [null, null, null, 'absent', null],
        explanation:
          "The letter E is not in the word, unless it's a shy letter, in which case it's not in the fourth position.",
      },
      {
        guess: 'BOOTS',
        statuses: ['correct', null, null, null, null],
        explanation:
          "B is in the word in the first position, whether it's a shy letter or not.",
      },
    ],
  },
  SHIF1: {
    description: [
      "Today's variation: the word list includes words where one letter was removed from one end and added to the other. This applies to guesses and the solution.",
    ],
    examples: [
      {
        guess: 'BREAD',
        statuses: [null, null, null, null, null],
        explanation:
          'BREAD is valid because it\'s a word.',
      },
      {
        guess: 'RANEC',
        statuses: [null, null, null, null, null],
        explanation:
          'RANEC is valid because CRANE is a word.',
      },
      {
        guess: 'YDECO',
        statuses: [null, null, null, null, null],
        explanation:
          'YDECO is valid because DECOY is a word.',
      },
    ],
  },
  SHIF2: {
    description: [
      "Today's variation: the word list includes words where any number of letters were removed from one end and added to the other. This applies to guesses and the solution.",
    ],
    examples: [
      {
        guess: 'BREAD',
        statuses: [null, null, null, null, null],
        explanation:
          'BREAD is valid because it\'s a word.',
      },
      {
        guess: 'ANECR',
        statuses: [null, null, null, null, null],
        explanation:
          'ANECR is valid because CRANE is a word.',
      },
      {
        guess: 'YDECO',
        statuses: [null, null, null, null, null],
        explanation:
          'YDECO is valid because DECOY is a word.',
      },
    ],
  },
  OUTO1: {
    description: [
      "Today's variation: each row of colours is shifted once either left or right (same direction each time).",
    ],
    examples: [
      {
        guess: 'TOUCH',
        statuses: [null, 'correct', null, null, null],
        explanation: 'Either T is in spot 1 or U is in spot 3.',
      },
      {
        guess: 'SPARE',
        statuses: ['present', null, null, null, null],
        explanation: 'Either P is in the word but not in spot 2, or E is in the word but not in spot 5.',
      }
    ],
  },
  OUTO2: {
    description: [
      "Today's variation: each row of colours is shifted (the same amount each time).",
    ],
    examples: [
      {
        guess: 'TOUCH',
        statuses: [null, 'correct', 'present', null, null],
        explanation: 'One letter is in the correct spot, and the letter after it is in the word but in the wrong spot.',
      },
    ],
  }
};

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  const modalContent = modalContentForVariant[getVariantKey(variant)];

  return (
    <BaseModal
      title={modalContent.title || getVariantTitle(variant)}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <p className="text-sm text-gray-500 dark:text-gray-300">
        {"It's Wordle with a twist!"}
      </p>
      {modalContent.description.map((line) => (
        <p key={line} className="text-sm text-gray-500 dark:text-gray-300">
          {line}
        </p>
      ))}
      <p className="text-sm text-gray-500 dark:text-gray-300">
        {`You have ${maxChallenges} guesses.`}
      </p>

      {modalContent.examples.map((example) => (
        <React.Fragment key={example.guess}>
          <div className="flex justify-center mb-1 mt-4">
            {example.statuses.map((status, i) => (
              <Cell
                key={i}
                value={example.guess[i]}
                {...(status !== null
                  ? {
                      isRevealing: true,
                      isCompleted: true,
                      status,
                    }
                  : {})}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {example.explanation}
          </p>
        </React.Fragment>
      ))}

      <p className="mt-6 italic text-sm text-gray-500 dark:text-gray-300">
        This is an open source version of the word guessing game we all know and
        love -{' '}
        <a
          href="https://github.com/rencright/react-wordle"
          className="underline font-bold"
        >
          check out the code here
        </a>{' '}
      </p>
    </BaseModal>
  );
};
