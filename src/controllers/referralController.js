const {
    getIncomingReferralsService,
    updateReferralFeedbackService,
    getSentReferralsService,
    getReferralStatsService,
    getReferralDetailsService
} = require("../services/referralService");

const { getIO } = require("../utils/socket");
const { AppError } = require("../middlewares/errorMiddleware");


/**
 * Get Incoming Referrals for a facility
 */
const getIncomingReferrals = async (req, res, next) => {
    try {
        const facilityId = req.user.unit.id;
        const result = await getIncomingReferralsService(facilityId, req.query);

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Provide Feedback on a Referral
 */
const provideReferralFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, service_given, recommendation } = req.body;
        const feedbackBy = req.user.id;
        const facilityId = req.user.unit.id;

        const referral = await updateReferralFeedbackService(id, facilityId, {
            status,
            service_given,
            recommendation,
            feedback_by: feedbackBy
        });

        // Trigger real-time notification back to PC Worker
        try {
            const io = getIO();
            io.to(`user_${referral.pc_worker_id}`).emit("referral_feedback", {
                id: referral.id,
                status: referral.status,
                beneficiary_type: referral.beneficiary_type,
                feedback_date: referral.feedback_date
            });
        } catch (err) {
            console.error("Socket emit failed:", err.message);
        }

        res.status(200).json({
            status: "success",
            data: { referral }
        });
    } catch (error) {
        if (error.message === "referral_not_found") {
            return next(new AppError("referral_not_found", 404));
        }
        if (error.message === "unauthorized_referral_access") {
            return next(new AppError("unauthorized_referral_update", 403));
        }
        next(error);
    }
};

/**
 * Get Referrals sent by the PC Worker
 */
const getSentReferrals = async (req, res, next) => {
    try {
        const pcWorkerId = req.user.id;
        const result = await getSentReferralsService(pcWorkerId, req.query);

        res.status(200).json({                                                  
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Specific Referral details
 */
const getReferralDetails = async (req, res, next) => {
    try {
        const referral = await getReferralDetailsService(req.params.id);
        if (!referral) {
            return next(new AppError("referral_not_found", 404));
        }

        res.status(200).json({
            status: "success",
            data: { referral }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Referral stats
 */
const getReferralStats = async (req, res, next) => {
    try {
        const facilityId = req.user.unit.id;
        const stats = await getReferralStatsService(facilityId);

        res.status(200).json({
            status: "success",
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getIncomingReferrals,
    provideReferralFeedback,
    getSentReferrals,
    getReferralDetails,
    getReferralStats
};
