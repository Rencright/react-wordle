import { VariantKey, variantTitles } from "./variants";

export const getVariantKeyOfDay = (solutionIndex: number): VariantKey => {
  const overrideVariant = 'MINE2' || process.env.REACT_APP_OVERRIDE_VARIANT;
  if (overrideVariant && Object.keys(variantTitles).includes(overrideVariant)) {
    return overrideVariant as VariantKey;
  }
  const difficultyPlus = process.env.REACT_APP_SPECIAL_MODE === 'plus' ||
    (process.env.REACT_APP_SPECIAL_MODE === 'chaoticiteration' && solutionIndex % 13 < 5);

  switch (solutionIndex % 7) {
    case 0:
      return difficultyPlus ? 'AMOG2' : 'AMOG1';
    case 1:
      return difficultyPlus ? 'TOBE2' : 'TOBE1';
    case 2:
      if (difficultyPlus) {
        return 'GREE2';
      }
      if (solutionIndex % 2 === 0) {
        return 'GREE1';
      } else {
        return 'BOND1';
      }
    case 3:
      return difficultyPlus ? 'SHYE2' : 'SHYE1';
    case 4:
      return difficultyPlus ? 'FOUL2' : 'FOUL1';
    case 5:
      switch (solutionIndex % 21) {
        case 5:
          return difficultyPlus ? 'AMOG3' : 'AMOG2';
        case 12:
          return difficultyPlus ? 'TOBE3' : 'TOBE2';
        case 19:
          return difficultyPlus ? 'FOUL3' : 'FOUL2';
        default:
          console.error('ARITHMETIC ERROR IN DATE SWITCH');
          return 'AMOG2';
      }
    case 6:
      return difficultyPlus ? 'MINE2' : 'MINE1';
  }

  console.error('ARITHMETIC ERROR IN DATE SWITCH');
  return 'TOBE1';
};
