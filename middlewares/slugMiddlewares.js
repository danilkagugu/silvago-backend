import generateSlug from "../helpers/slugHelpers.js";

const autoGenerateItemSlugs = (req, res, next) => {
  if (Array.isArray(req.body.items)) {
    req.body.items = req.body.items.map((item) => {
      const name = item.name || "";
      const slug = item.slug || generateSlug(name); // Генерація slug для кожного елемента
      // console.log(`Generated slug for '${name}': ${slug}`);
      return {
        name,
        slug,
      };
    });
  } else {
    req.body.items = []; // Якщо items не є масивом, ініціалізуйте як пустий масив
  }
  next();
};

export default autoGenerateItemSlugs;
