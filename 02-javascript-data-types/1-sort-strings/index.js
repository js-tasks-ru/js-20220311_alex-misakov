/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  return arr.slice().sort((s1, s2) => {
    return param === 'desc' ?
      s2.localeCompare(s1, 'ru-u-kf-upper') :
      s1.localeCompare(s2, 'ru-u-kf-upper');
  });
}
