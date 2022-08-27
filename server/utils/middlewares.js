const getPagination = async (req, res, next) => {
  const { page = 1, size = 10 } = req.query;
  if (Number(page) > 0 && Number(size) > 0) {
    res.locals.limit = Number(size);
    res.locals.offset = Number(page - 1) * 10;
  } else if (Number(page) === 0 && Number(size) === 0) {
    res.locals.limit = null;
    res.locals.offset = null;
  }
  next();
};

module.exports = {
  getPagination,
};
