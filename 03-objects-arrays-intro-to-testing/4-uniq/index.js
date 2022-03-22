/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  if (arr === undefined) return [];

  let result = [];

  for (const item of arr) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}
