const Joi = require("joi");

const familyCreationSchema = Joi.object({
    block_id: Joi.string().uuid().required().messages({
        "string.base": "errors.invalid_uuid",
        "string.empty": "errors.field_required",
        "string.uuid": "errors.invalid_uuid",
        "any.required": "errors.field_required",
    }),
    registration_number: Joi.string().required().messages({
        "string.empty": "errors.field_required",
        "any.required": "errors.field_required",
    }),
    house_number: Joi.string().allow(null, "").optional(),
    head_of_household_name: Joi.string().required().messages({
        "string.empty": "errors.field_required",
        "any.required": "errors.field_required",
    }),
    phone_number: Joi.string().allow(null, "").optional(),
    is_vulnerable: Joi.boolean().default(false),
    is_safetynet_beneficiary: Joi.boolean().default(false),
    health_insurance_type: Joi.string().valid("FREE_OR_SPONSORED", "PAYING", "NOT_BENEFICIARY").required().messages({
        "any.only": "errors.invalid_insurance_type",
        "any.required": "errors.field_required",
    }),
    is_temporary_direct_support_beneficiary: Joi.boolean().default(false),

    latitude: Joi.number().allow(null).optional(),
    longitude: Joi.number().allow(null).optional(),

    guardian_name: Joi.string().allow(null, "").optional(),
    guardian_gender: Joi.string().valid("MALE", "FEMALE").allow(null).optional(),
    guardian_dob: Joi.date().iso().allow(null).optional(),
    guardian_phone_number: Joi.string().allow(null, "").optional(),

    pregnant_mother: Joi.object({
        name: Joi.string().required(),
        dob: Joi.date().iso().required(),
    }).allow(null).optional(),

    lactating_mother: Joi.object({
        name: Joi.string().required(),
        dob: Joi.date().iso().required(),
    }).allow(null).optional(),

    children: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            gender: Joi.string().valid("MALE", "FEMALE").required(),
            dob: Joi.date().iso().required(),
            vulnerable_to_growth_restriction: Joi.boolean().default(false),
        })
    ).allow(null).optional(),
});

const familyUpdateSchema = Joi.object({
    block_id: Joi.string().uuid().optional(),
    registration_number: Joi.string().optional(),
    house_number: Joi.string().allow(null, "").optional(),
    head_of_household_name: Joi.string().optional(),
    phone_number: Joi.string().allow(null, "").optional(),
    is_vulnerable: Joi.boolean().optional(),
    is_safetynet_beneficiary: Joi.boolean().optional(),
    health_insurance_type: Joi.string().valid("FREE_OR_SPONSORED", "PAYING", "NOT_BENEFICIARY").optional(),
    is_temporary_direct_support_beneficiary: Joi.boolean().optional(),

    latitude: Joi.number().allow(null).optional(),
    longitude: Joi.number().allow(null).optional(),

    guardian_name: Joi.string().allow(null, "").optional(),
    guardian_gender: Joi.string().valid("MALE", "FEMALE").allow(null).optional(),
    guardian_dob: Joi.date().iso().allow(null).optional(),
    guardian_phone_number: Joi.string().allow(null, "").optional(),

    pregnant_mother: Joi.object({
        name: Joi.string().required(),
        dob: Joi.date().iso().required(),
    }).allow(null).optional(),

    lactating_mother: Joi.object({
        name: Joi.string().required(),
        dob: Joi.date().iso().required(),
    }).allow(null).optional(),

    children: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            gender: Joi.string().valid("MALE", "FEMALE").required(),
            dob: Joi.date().iso().required(),
            vulnerable_to_growth_restriction: Joi.boolean().default(false),
        })
    ).allow(null).optional(),
});

const validateFamilyCreationInput = (req, res, next) => {
    const { error } = familyCreationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        // Find the first error message and return it localized
        const key = error.details[0].message;
        const fieldName = error.details[0].context.key;

        let translatedMessage = req.t(key);
        if (key === "errors.field_required") {
            // replace {{field}} with actual field name if template is used
            translatedMessage = translatedMessage.replace("{{field}}", fieldName);
        }

        return res.status(400).json({
            success: false,
            message: translatedMessage,
        });
    }
    next();
};

const validateFamilyUpdateInput = (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: req.t("errors.family_id_required") });
    }

    const { error } = familyUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const key = error.details[0].message;
        const fieldName = error.details[0].context.key;

        let translatedMessage = req.t(key) || key; // fallback
        if (typeof translatedMessage === 'string' && key === "errors.field_required") {
            translatedMessage = translatedMessage.replace("{{field}}", fieldName);
        }

        return res.status(400).json({
            success: false,
            message: translatedMessage,
        });
    }
    next();
};

module.exports = {
    validateFamilyCreationInput,
    validateFamilyUpdateInput,
};
