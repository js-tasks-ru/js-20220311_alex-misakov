/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) return string;
  if (size === 0) return "";

  let result = "";
  let char = "";
  let char_counter = 0;

  for (let i = 0; i < string.length; ++i) {
    if (string[i] === char) {
      if (++char_counter < size) {
        result += string[i];
      }
    } else {
      char_counter = 0;
      result += string[i];
      char = string[i];
    }
  }

  return result;
}
