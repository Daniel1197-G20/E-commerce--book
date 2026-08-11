const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Error', statusCode = 500, code = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: { code },
  });
};

module.exports = { success, error };
