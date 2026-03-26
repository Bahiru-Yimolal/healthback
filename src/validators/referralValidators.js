const Joi = require("joi");

const validateReferralFeedbackInput = (req, res, next) => {
    const schema = Joi.object({
        status: Joi.string().valid("ACCEPTED", "COMPLETED", "REJECTED").required(),
        service_given: Joi.string().required(),
        recommendation: Joi.string().allow(null, "").optional(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

const validateReferralQuery = (req, res, next) => {
    const schema = Joi.object({
        status: Joi.string().valid("PENDING", "ACCEPTED", "COMPLETED", "REJECTED", "all").optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    const { error } = schema.validate(req.query);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

module.exports = {
    validateReferralFeedbackInput,
    validateReferralQuery
};
