// @flow
export function findNodePathCardId(nodePath: Array<HTMLElement>): string {
  if (nodePath && nodePath.length !== 0) {
    for (let i = 0; i < nodePath.length; i += 1) {
      const element = nodePath[i];
      if (element.className === 'card-wrapper') {
        return element.id;
      }
    }
  }
  return '';
}

export function getNearestThreshold(
  intersectionRatio: number,
  thresholds: Array<number>,
): number {
  let triggeredThreshold = thresholds[0];
  for (let i = 1; i < thresholds.length; i += 1) {
    if (intersectionRatio >= thresholds[i]) {
      triggeredThreshold = thresholds[i];
    }
  }
  return triggeredThreshold;
}
