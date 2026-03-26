const Joi = require("joi");

const validateVisitStartingInput = (req, res, next) => {
    const schema = Joi.object({
        family_id: Joi.string().uuid().required(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
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

const validateVisitUpdateInput = (req, res, next) => {
    const schema = Joi.object({
        next_appointment_date: Joi.date().iso().optional(),
        service_type: Joi.string().optional(),
        is_eligible_for_support: Joi.boolean().optional(),
        is_vulnerable: Joi.boolean().optional(),
        course_completed: Joi.boolean().optional(),
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

module.exports = {
    validateVisitStartingInput,
    validateVisitUpdateInput,
};
