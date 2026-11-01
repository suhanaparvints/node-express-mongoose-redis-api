import Joi from "joi";

const id = Joi.string().hex().length(24).required();

export const updateNameSchema = {
  params: Joi.object({
    id,
  }),
  body: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .pattern(/^[A-Za-z ]+$/)
      .required(),
  }),
};

export const replaceUserSchema = {
  params: Joi.object({
    id,
  }),
  body: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .pattern(/^[A-Za-z ]+$/)
      .required(),
    age: Joi.number().integer().min(10).max(150).required(),
    email: Joi.string().trim().lowercase().email().required(),
    address: Joi.string().trim().min(1).max(300).required(),
    password: Joi.forbidden(),
    role: Joi.forbidden(),
  }),
};

export const deleteUserSchema = {
  params: Joi.object({
    id,
  }),
};
