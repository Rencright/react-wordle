import seedrandom from 'seedrandom';

const rand = seedrandom(process.env.REACT_APP_RANDOM_SEED);

export const randBetweenRange = (start: number, stop: number): number => {
  const range = stop - start;
  const x = Math.floor(rand() * range) % range;
  return (x === range ? 0 : x) + start;
};

export const randomShuffle = <T>(items: T[]): T[] => {
  // const startTime = new Date().getTime();
  let shuffledItems = [...items];
  for (let i = items.length - 2; i >= 0; i = i - 1) {
    const j = randBetweenRange(0, i + 1);
    const temp = shuffledItems[i];
    shuffledItems[i] = shuffledItems[j];
    shuffledItems[j] = temp;
  }
  // console.info(new Date().getTime() - startTime);
  return shuffledItems;
};
