// transliterate.js
const generateSlug = (text) => {
  const cyrillicToLatinMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ю: "iu",
    я: "ia",
    ь: "",
    ъ: "",
    ы: "y",
    э: "e",
    ё: "e",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => cyrillicToLatinMap[char] || char)
    .join("")
    .replace(/\s+/g, "-"); // Замінюємо пробіли на дефіси
};

export default generateSlug;
