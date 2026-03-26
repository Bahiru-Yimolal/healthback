const Referral = require("../models/referral");
const HouseholdVisit = require("../models/householdVisit");
const User = require("../models/userModel");
const Family = require("../models/familyModel");
const AdministrativeUnit = require("../models/administrativeUnitModel");

/**
 * Get Incoming Referrals for a specific health facility (with pagination)
 * @param {string} facilityId - The ID of the Health Center
 * @param {Object} query - Query parameters (status, page, limit)
 * @returns {Object} - Object containing referrals and pagination metadata
 */
const getIncomingReferralsService = async (facilityId, query) => {
    const { status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const whereClause = {

       
        
        health_facility_id: facilityId
    };

    // Only apply status filter if it's not 'all'
    if (status && status !== "all") {
        whereClause.status = status;
    } else if (!status) {
        // Default to PENDING if no status provided and not 'all'
        whereClause.status = "PENDING";
    }

    const { count, rows } = await Referral.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: HouseholdVisit,
                include: [
                    {
                        model: Family,
                        as: "Family",
                        attributes: ["id", "head_of_household_name", "house_number", "phone_number"]
                    }
                ]
            },
            {
                model: User,
                as: "PCWorker",
                attributes: ["first_name", "last_name", "phone_number"]
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["referral_date", "DESC"]]
    });

    return {
        referrals: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
    };
};

/**
 * Update Referral Feedback (Facility Side)
 * @param {string} id - Referral ID
 * @param {string} facilityId - ID of the processing facility
 * @param {Object} feedbackData - Status and clinical feedback
 * @returns {Object} - Updated referral record
 */
const updateReferralFeedbackService = async (id, facilityId, feedbackData) => {
    const { status, service_given, recommendation, feedback_by } = feedbackData;

    const referral = await Referral.findByPk(id);
    if (!referral) {
        throw new Error("referral_not_found");
    }

    // Security: Ensure the referral belongs to this facility
    if (referral.health_facility_id !== facilityId) {
        throw new Error("unauthorized_referral_access");
    }

    // Update the record
    await referral.update({
        status,
        service_given,
        recommendation,
        feedback_by,
        feedback_date: new Date()
    });

    return referral;
};

/**
 * Get Referrals sent by a PC Worker (with pagination)
 * @param {string} pcWorkerId - ID of the PC Worker
 * @param {Object} query - Query parameters (status, page, limit)
 * @returns {Object} - Object containing referrals and pagination metadata
 */
const getSentReferralsService = async (pcWorkerId, query) => {
    const { status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const whereClause = { pc_worker_id: pcWorkerId };

    if (status && status !== "all") {
        whereClause.status = status;
    }

    const { count, rows } = await Referral.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: AdministrativeUnit,
                as: "HealthFacility",
                attributes: ["name"]
            },
            {
                model: HouseholdVisit,
                include: [
                    {
                        model: Family,
                        as: "Family",
                        attributes: ["id", "head_of_household_name", "house_number", "phone_number"]
                    }
                ]
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["referral_date", "DESC"]]
    });

    return {
        referrals: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
    };
};

/**
 * Get Referral stats for a specific facility
 * @param {string} facilityId - ID of the Health Center
 * @returns {Object} - Counts grouped by status
 */
const getReferralStatsService = async (facilityId) => {
    const stats = await Referral.count({
        where: { health_facility_id: facilityId },
        group: ["status"]
    });

    // Convert array of {status, count} to a cleaner object {PENDING: 5, ...}
    const formattedStats = {
        PENDING: 0,
        ACCEPTED: 0,
        COMPLETED: 0,
        REJECTED: 0
    };

    stats.forEach(stat => {
        formattedStats[stat.status] = parseInt(stat.count);
    });

    return formattedStats;
};

/**
 * Get Specific Referral details with associations
 * @param {string} id - Referral ID
 * @returns {Object} - Detailed referral record
 */
const getReferralDetailsService = async (id) => {
    const referral = await Referral.findByPk(id, {
        include: [
            {
                model: HouseholdVisit,
                include: [
                    {
                        model: Family,
                        as: "Family",
                        attributes: ["head_of_household_name", "house_number", "phone_number"]
                    }
                ]
            },
            {
                model: User,
                as: "PCWorker",
                attributes: ["first_name", "last_name", "phone_number"]
            },
            {
                model: AdministrativeUnit,
                as: "HealthFacility",
                attributes: ["name"]
            }
        ]
    });

    return referral;
};

module.exports = {
    getIncomingReferralsService,
    getSentReferralsService,
    updateReferralFeedbackService,
    getReferralStatsService,
    getReferralDetailsService
};
