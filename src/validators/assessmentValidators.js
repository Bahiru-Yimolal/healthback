const Joi = require("joi");

const validatePregnantAssessmentInput = (req, res, next) => {
    const schema = Joi.object({
        visit_id: Joi.string().uuid().required(),
        mother_id: Joi.string().uuid().required(),
        anc_followup_started: Joi.string().valid("YES", "NO", "NA").required(),
        anc_followup_dropped: Joi.string().valid("YES", "NO", "NA").required(),
        substance_use: Joi.boolean().optional(),
        substance_type: Joi.string().allow(null, "").optional(),
        maternal_depression_signs: Joi.boolean().optional(),
        diverse_diet_extra_meal: Joi.boolean().optional(),
        iron_folic_acid_supplement: Joi.string().valid("YES", "NO", "NA").required(),
        partner_family_support: Joi.boolean().optional(),
        violence_signs: Joi.boolean().optional(),
        fetal_stimulation_activities: Joi.array().items(Joi.string()).optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow(null, "").optional(),
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

const validatePregnantAssessmentUpdateInput = (req, res, next) => {
    const schema = Joi.object({
        anc_followup_started: Joi.string().valid("YES", "NO", "NA").optional(),
        anc_followup_dropped: Joi.string().valid("YES", "NO", "NA").optional(),
        substance_use: Joi.boolean().optional(),
        substance_type: Joi.string().allow(null, "").optional(),
        maternal_depression_signs: Joi.boolean().optional(),
        diverse_diet_extra_meal: Joi.boolean().optional(),
        iron_folic_acid_supplement: Joi.string().valid("YES", "NO", "NA").optional(),
        partner_family_support: Joi.boolean().optional(),
        violence_signs: Joi.boolean().optional(),
        fetal_stimulation_activities: Joi.array().items(Joi.string()).optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow(null, "").optional(),
    }).min(1);

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

const validatePostnatalAssessmentInput = (req, res, next) => {
    const schema = Joi.object({
        visit_id: Joi.string().uuid().required(),
        mother_id: Joi.string().uuid().required(),
        pnc_followup_started: Joi.string().valid("YES", "NO", "NA").required(),
        pnc_followup_dropped: Joi.string().valid("YES", "NO", "NA").required(),
        health_danger_signs: Joi.boolean().optional(),
        substance_use: Joi.boolean().optional(),
        maternal_depression_signs: Joi.boolean().optional(),
        diverse_diet_extra_meal: Joi.boolean().optional(),
        iron_folic_acid_supplement: Joi.boolean().optional(),
        partner_family_support: Joi.boolean().optional(),
        violence_signs: Joi.boolean().optional(),
        newborn_stimulation_activities: Joi.array().items(Joi.string()).optional(),
        infant_care_practices: Joi.array().items(Joi.string()).optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow(null, "").optional(),
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

const validatePostnatalAssessmentUpdateInput = (req, res, next) => {
    const schema = Joi.object({
        pnc_followup_started: Joi.string().valid("YES", "NO", "NA").optional(),
        pnc_followup_dropped: Joi.string().valid("YES", "NO", "NA").optional(),
        health_danger_signs: Joi.boolean().optional(),
        substance_use: Joi.boolean().optional(),
        maternal_depression_signs: Joi.boolean().optional(),
        diverse_diet_extra_meal: Joi.boolean().optional(),
        iron_folic_acid_supplement: Joi.boolean().optional(),
        partner_family_support: Joi.boolean().optional(),
        violence_signs: Joi.boolean().optional(),
        newborn_stimulation_activities: Joi.array().items(Joi.string()).optional(),
        infant_care_practices: Joi.array().items(Joi.string()).optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow(null, "").optional(),
    }).min(1);

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

const validateChildAssessmentInput = (req, res, next) => {
    const schema = Joi.object({
        visit_id: Joi.string().guid({ version: "uuidv4" }).required(),
        child_id: Joi.string().guid({ version: "uuidv4" }).required(),
        talk_sing_frequency: Joi.number().integer().min(0).max(2).required(),
        play_frequency: Joi.number().integer().min(0).max(2).required(),
        story_read_frequency: Joi.number().integer().min(0).max(2).required(),
        outdoor_play_frequency: Joi.number().integer().min(0).max(2).required(),
        responsive_care: Joi.boolean().optional(),
        positive_discipline: Joi.array().items(Joi.string()).optional(),
        up_to_date_vaccination: Joi.string().valid("YES", "NO", "NA").required(),
        feeding_status: Joi.array().items(Joi.string()).optional(),
        nutritional_status: Joi.string().valid("SAM", "MAM", "NORMAL", "NA").required(),
        abuse_violence_signs: Joi.boolean().optional(),
        abuse_violence_specification: Joi.string().allow("", null).optional(),
        developmental_milestone: Joi.string().valid("ND", "SD", "DD").required(),
        disability_screening: Joi.array().items(Joi.string()).optional(),
        has_books: Joi.boolean().optional(),
        plays_with_toys: Joi.boolean().optional(),
        toy_type: Joi.string().valid("HOMEMADE", "SHOP", "BOTH", "NA").optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow("", null).optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateChildAssessmentUpdateInput = (req, res, next) => {
    const schema = Joi.object({
        talk_sing_frequency: Joi.number().integer().min(0).max(2).optional(),
        play_frequency: Joi.number().integer().min(0).max(2).optional(),
        story_read_frequency: Joi.number().integer().min(0).max(2).optional(),
        outdoor_play_frequency: Joi.number().integer().min(0).max(2).optional(),
        responsive_care: Joi.boolean().optional(),
        positive_discipline: Joi.array().items(Joi.string()).optional(),
        up_to_date_vaccination: Joi.string().valid("YES", "NO", "NA").optional(),
        feeding_status: Joi.array().items(Joi.string()).optional(),
        nutritional_status: Joi.string().valid("SAM", "MAM", "NORMAL", "NA").optional(),
        abuse_violence_signs: Joi.boolean().optional(),
        abuse_violence_specification: Joi.string().allow("", null).optional(),
        developmental_milestone: Joi.string().valid("ND", "SD", "DD").optional(),
        disability_screening: Joi.array().items(Joi.string()).optional(),
        has_books: Joi.boolean().optional(),
        plays_with_toys: Joi.boolean().optional(),
        toy_type: Joi.string().valid("HOMEMADE", "SHOP", "BOTH", "NA").optional(),
        referred_to_facility: Joi.boolean().optional(),
        referral_reason: Joi.string().allow("", null).optional(),
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validatePregnantAssessmentInput,
    validatePregnantAssessmentUpdateInput,
    validatePostnatalAssessmentInput,
    validatePostnatalAssessmentUpdateInput,
    validateChildAssessmentInput,
    validateChildAssessmentUpdateInput,
};
