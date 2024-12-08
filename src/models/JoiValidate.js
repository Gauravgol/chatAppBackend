const Joi = require('joi');

// register user schema validation
const ValidationUserSchema = Joi.object({
    username: Joi.string().min(5).max(15).alphanum().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    name: Joi.string().optional(),
    DOB: Joi.string().required(),
    mobile: Joi.number().min(600000000).max(9999999999).required(),

}).options({ abortEarly: false });

// Login user validation
const ValidationUserSchemaLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
}).options({ abortEarly: false });

// validation for update users
const ValidationUserSchemaUpdate = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    mobile: Joi.number().min(6000000000).max(9999999999).required(),
    DOB: Joi.string().required(),
}).options({ abortEarly: false });

// validating group user for register
const ValidateGroupUser = Joi.object({
    user_name: Joi.string().required(),
    email: Joi.string().email().required(),
    createAt: Joi.number(),
}).options({ abortEarly: false });

// validate group chat data 
const ValidationForGroupChat = Joi.object({
    room_name: Joi.string().required(),
    users: Joi.array().items(ValidateGroupUser),
}).options({ abortEarly: false });


module.exports = { ValidationUserSchema, ValidationUserSchemaLogin, ValidationUserSchemaUpdate, ValidationForGroupChat }