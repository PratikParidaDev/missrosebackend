import { errorResponse } from '../utils/apiResponse.js';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.context.key,
      message: err.message
    }));
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

export default validate;
