import Joi from "joi";

export const validateBcryptPasswordLength = (value, helpers) => {
  if (Buffer.byteLength(value, "utf8") > 72) {
    return helpers.error("string.maxBytes");
  }

  return value;
};

const bcryptPasswordLengthMessage = {
  "string.maxBytes": "Password must not exceed bcrypt's 72-byte limit",
};

export const loginValidation = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().custom(validateBcryptPasswordLength).required().messages(bcryptPasswordLengthMessage),
});

export const registerValidation = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z]+(\s[A-Za-z]+)*$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters long",
      "string.pattern.base": "Username can only contain letters and spaces (e.g., 'John Doe')",
    }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Invalid email format",
  }),

  address: Joi.string().trim().min(5).max(300).required().messages({
    "string.empty": "Address is required",
    "string.min": "Address must be at least 5 characters long",
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/)
    .custom(validateBcryptPasswordLength)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must include at least one uppercase, one lowercase, one number, and one special character",
      ...bcryptPasswordLengthMessage,
    }),

  role: Joi.forbidden().messages({
    "any.unknown": "Role cannot be set during registration",
  }),

  age: Joi.number().integer().min(10).max(150).required().messages({
    "number.base": "Age must be a number",
    "number.min": "Age must be at least 10",
    "number.max": "Age cannot exceed 150",
  }),
});
