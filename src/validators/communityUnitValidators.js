const Joi = require("joi");

// Define the Woreda validation schema
const woredaSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "errors.woreda_name_required",
        "any.required": "errors.woreda_name_required",
    }),
});

// Define the Ketena creation validation schema
const ketenaCreationSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "errors.ketena_name_required",
        "any.required": "errors.ketena_name_required",
    }),
    woreda_id: Joi.string().uuid().required().messages({
        "string.empty": "errors.woreda_id_required",
        "any.required": "errors.woreda_id_required",
        "string.guid": "errors.invalid_uuid"
    }),
});

// Define the Ketena update validation schema
const ketenaUpdateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "errors.ketena_name_required",
        "any.required": "errors.ketena_name_required",
    }),
});

// Middleware for validating woreda input
const validateWoredaInput = (req, res, next) => {
    const { error } = woredaSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: req.t(error.details[0].message),
        });
    }

    next();
};

// Middleware for validating ketena creation input
const validateKetenaCreationInput = (req, res, next) => {
    const { error } = ketenaCreationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: req.t(error.details[0].message),
        });
    }

    next();
};

// Middleware for validating ketena update input
const validateKetenaUpdateInput = (req, res, next) => {
    const { error } = ketenaUpdateSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: req.t(error.details[0].message),
        });
    }

    next();
};

// Define the Block creation validation schema
const blockCreationSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "errors.block_name_required",
        "any.required": "errors.block_name_required",
    }),
    ketenaId: Joi.string().uuid().required().messages({
        "string.empty": "errors.ketena_id_required",
        "any.required": "errors.ketena_id_required",
        "string.guid": "errors.invalid_uuid"
    }),
});

// Define the Block update validation schema
const blockUpdateSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "errors.block_name_required",
        "any.required": "errors.block_name_required",
    }),
});

// Middleware for validating block creation input
const validateBlockCreationInput = (req, res, next) => {
    const { error } = blockCreationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: req.t(error.details[0].message),
        });
    }

    next();
};

// Middleware for validating block update input
const validateBlockUpdateInput = (req, res, next) => {
    const { error } = blockUpdateSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: req.t(error.details[0].message),
        });
    }

    next();
};

module.exports = {
    validateWoredaInput,
    validateKetenaCreationInput,
    validateKetenaUpdateInput,
    validateBlockCreationInput,
    validateBlockUpdateInput,
};
