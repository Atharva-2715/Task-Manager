const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    const totalItems = await AuditLog.countDocuments();
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const safePage = Math.min(page, totalPages);

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit);

    return res.json({
      data: logs,
      pagination: {
        totalItems,
        currentPage: safePage,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    return next(error);
  }
};

