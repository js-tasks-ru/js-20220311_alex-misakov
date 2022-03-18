/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const directions = {
    asc: 1,
    desc: -1
  }
  const direction = directions[param];

  return [...arr].sort((s1, s2) => {
    return direction * s1.localeCompare(s2, ['ru', 'en'], {caseFirst: 'upper'});
  });
}
