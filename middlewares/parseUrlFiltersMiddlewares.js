/**
 * Middleware для парсингу параметрів фільтрації з URL
 */
export const parseFiltersMiddleware = (req, res, next) => {
    // Витягуємо частину шляху після '/filter/'
    const path = req.path.split('/filter/')[1];
  
    if (path) {
      // Парсимо параметри у форматі key=value1,value2;key2=value3
      const parsedFilters = path.split(';').reduce((acc, param) => {
        const [key, value] = param.split('=');
        if (value) acc[key] = value;
        return acc;
      }, {});
  
      // Додаємо розпарсені параметри до `req.query`
      req.query = { ...req.query, ...parsedFilters };
    }
  
    next();
  };
  