const PregnantAssessment = require("../models/pregnantAssessment");
const PostnatalAssessment = require("../models/postnatalAssessment");
const ChildAssessment = require("../models/childAssessment");
const HouseholdVisit = require("../models/householdVisit");
const Child = require("../models/childModel");
const Referral = require("../models/referral");
const sequelize = require("../config/database");
const { findHealthCenterId } = require("../utils/unitResolver");
const { getIO } = require("../utils/socket");
const Family = require("../models/familyModel");

/**
 * Create a new pregnant assessment
 * @param {Object} assessmentData - Data for the assessment
 * @returns {Object} - Created assessment record
 */
const createPregnantAssessmentService = async (assessmentData) => {
    const { visit_id, mother_id } = assessmentData;

    return await sequelize.transaction(async (t) => {
        // 1. Verify visit exists
        const visit = await HouseholdVisit.findByPk(visit_id, { transaction: t });
        if (!visit) {
            throw new Error("visit_not_found");
        }

        // 2. Verify mother exists
        const PregnantMother = require("../models/pregnantMotherModel");
        const mother = await PregnantMother.findByPk(mother_id, { transaction: t });
        if (!mother) {
            throw new Error("pregnant_mother_not_found");
        }

        // 3. Create assessment
        const assessment = await PregnantAssessment.create(assessmentData, { transaction: t });

        // 4. Auto-create Referral if needed
        if (assessment.referred_to_facility) {
            // Resolve Health Center ID
            const family = await Family.findByPk(visit.family_id, { transaction: t });
            const healthFacilityId = await findHealthCenterId(family.block_id);

            const referral = await Referral.create({
                visit_id: assessment.visit_id,
                beneficiary_id: assessment.mother_id,
                beneficiary_type: "PREGNANT_MOTHER",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                health_facility_id: healthFacilityId,
                reason: assessment.referral_reason || "Referred from pregnant assessment",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });

            // 5. Emit Real-time Notification
            if (healthFacilityId) {
                try {
                    const io = getIO();
                    io.to(`referrals_hc_${healthFacilityId}`).emit("new_referral", {
                        id: referral.id,
                        beneficiary_type: "PREGNANT_MOTHER",
                        reason: referral.reason,
                        visit_id: referral.visit_id
                    });
                } catch (err) {
                    console.error("Socket emit failed:", err.message);
                }
            }
        }

        return assessment;
    });
};

/**
 * Update a pregnant assessment
 * @param {string} id - Assessment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated assessment record
 */
const updatePregnantAssessmentService = async (id, updateData) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find assessment
        const assessment = await PregnantAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("pregnant_assessment_not_found");
        }

        const oldReferred = assessment.referred_to_facility;
        const newReferred = updateData.referred_to_facility !== undefined ? updateData.referred_to_facility : oldReferred;

        // 2. Handle Referral Synchronization
        const existingReferral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        // Case A: Toggle ON (False -> True)
        if (!oldReferred && newReferred) {
            const visit = await HouseholdVisit.findByPk(assessment.visit_id, { transaction: t });
            await Referral.create({
                visit_id: assessment.visit_id,
                beneficiary_id: assessment.mother_id,
                beneficiary_type: "PREGNANT_MOTHER",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                reason: updateData.referral_reason || assessment.referral_reason || "Referred from assessment update",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });
        }
        // Case B: Toggle OFF (True -> False)
        else if (oldReferred && !newReferred) {
            if (existingReferral) {
                if (existingReferral.status !== "PENDING") {
                    throw new Error("referral_already_processed");
                }
                await existingReferral.destroy({ transaction: t });
            }
        }
        // Case C: Stay ON, update reason
        else if (newReferred && existingReferral && updateData.referral_reason) {
            await existingReferral.update({
                reason: updateData.referral_reason
            }, { transaction: t });
        }

        // 3. Update Assessment
        await assessment.update(updateData, { transaction: t });

        return assessment;
    });
};

/**
 * Get a pregnant assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Object} - Assessment record
 */
const getPregnantAssessmentByIdService = async (id) => {
    const assessment = await PregnantAssessment.findByPk(id);
    if (!assessment) {
        throw new Error("pregnant_assessment_not_found");
    }
    return assessment;
};

/**
 * Create a new postnatal assessment
 * @param {Object} assessmentData - Data for the assessment
 * @returns {Object} - Created assessment record
 */
const createPostnatalAssessmentService = async (assessmentData) => {
    const { visit_id, mother_id } = assessmentData;

    return await sequelize.transaction(async (t) => {
        // 1. Verify visit exists
        const visit = await HouseholdVisit.findByPk(visit_id, { transaction: t });
        if (!visit) {
            throw new Error("visit_not_found");
        }

        // 2. Verify mother exists (Lactating Mother)
        const LactatingMother = require("../models/lactatingMotherModel");
        const mother = await LactatingMother.findByPk(mother_id, { transaction: t });
        if (!mother) {
            throw new Error("lactating_mother_not_found");
        }

        // 3. Create assessment
        const assessment = await PostnatalAssessment.create(assessmentData, { transaction: t });

        // 4. Auto-create Referral if needed
        if (assessment.referred_to_facility) {
            // Resolve Health Center ID
            const family = await Family.findByPk(visit.family_id, { transaction: t });
            const healthFacilityId = await findHealthCenterId(family.block_id);

            const referral = await Referral.create({
                visit_id: assessment.visit_id,
                beneficiary_id: assessment.mother_id,
                beneficiary_type: "LACTATING_MOTHER",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                health_facility_id: healthFacilityId,
                reason: assessment.referral_reason || "Referred from postnatal assessment",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });

            // 5. Emit Real-time Notification
            if (healthFacilityId) {
                try {
                    const io = getIO();
                    io.to(`referrals_hc_${healthFacilityId}`).emit("new_referral", {
                        id: referral.id,
                        beneficiary_type: "LACTATING_MOTHER",
                        reason: referral.reason,
                        visit_id: referral.visit_id
                    });
                } catch (err) {
                    console.error("Socket emit failed:", err.message);
                }
            }
        }

        return assessment;
    });
};

/**
 * Update a postnatal assessment
 * @param {string} id - Assessment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated assessment record
 */
const updatePostnatalAssessmentService = async (id, updateData) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find assessment
        const assessment = await PostnatalAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("postnatal_assessment_not_found");
        }

        const oldReferred = assessment.referred_to_facility;
        const newReferred = updateData.referred_to_facility !== undefined ? updateData.referred_to_facility : oldReferred;

        // 2. Handle Referral Synchronization
        const existingReferral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        // Case A: Toggle ON (False -> True)
        if (!oldReferred && newReferred) {
            const visit = await HouseholdVisit.findByPk(assessment.visit_id, { transaction: t });
            await Referral.create({
                visit_id: assessment.visit_id,
                beneficiary_id: assessment.mother_id,
                beneficiary_type: "LACTATING_MOTHER",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                reason: updateData.referral_reason || assessment.referral_reason || "Referred from postnatal assessment update",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });
        }
        // Case B: Toggle OFF (True -> False)
        else if (oldReferred && !newReferred) {
            if (existingReferral) {
                if (existingReferral.status !== "PENDING") {
                    throw new Error("referral_already_processed");
                }
                await existingReferral.destroy({ transaction: t });
            }
        }
        // Case C: Stay ON, update reason
        else if (newReferred && existingReferral && updateData.referral_reason) {
            await existingReferral.update({
                reason: updateData.referral_reason
            }, { transaction: t });
        }

        // 3. Update Assessment
        await assessment.update(updateData, { transaction: t });

        return assessment;
    });
};

/**
 * Get a postnatal assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Object} - Assessment record
 */
const getPostnatalAssessmentByIdService = async (id) => {
    const assessment = await PostnatalAssessment.findByPk(id);
    if (!assessment) {
        throw new Error("postnatal_assessment_not_found");
    }
    return assessment;
};

/**
 * Delete a pregnant assessment
 * @param {string} id - Assessment ID
 * @returns {boolean} - Returns true if deleted
 */
const deletePregnantAssessmentService = async (id) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find assessment
        const assessment = await PregnantAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("pregnant_assessment_not_found");
        }

        // 2. Check for associated Referral
        const referral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        if (referral) {
            // 3. Block if referral is already processed
            if (referral.status !== "PENDING") {
                throw new Error("referral_already_processed");
            }
            // 4. Soft-delete the pending referral
            await referral.destroy({ transaction: t });
        }

        // 5. Soft-delete the assessment
        await assessment.destroy({ transaction: t });

        return true;
    });
};

/**
 * Delete a postnatal assessment
 * @param {string} id - Assessment ID
 * @returns {boolean} - Returns true if deleted
 */
const deletePostnatalAssessmentService = async (id) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find assessment
        const assessment = await PostnatalAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("postnatal_assessment_not_found");
        }

        // 2. Check for associated Referral
        const referral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        if (referral) {
            // 3. Block if referral is already processed
            if (referral.status !== "PENDING") {
                throw new Error("referral_already_processed");
            }
            // 4. Soft-delete the pending referral
            await referral.destroy({ transaction: t });
        }

        // 5. Soft-delete the assessment
        await assessment.destroy({ transaction: t });

        return true;
    });
};



/**
 * Create a child assessment
 * @param {Object} assessmentData - Data for the child assessment
 * @returns {Object} - Created assessment record
 */
const createChildAssessmentService = async (assessmentData) => {
    return await sequelize.transaction(async (t) => {
        // 1. Verify Visit
        const visit = await HouseholdVisit.findByPk(assessmentData.visit_id, { transaction: t });
        if (!visit) {
            throw new Error("visit_not_found");
        }

        // 2. Verify Child
        const child = await Child.findByPk(assessmentData.child_id, { transaction: t });
        if (!child) {
            throw new Error("child_not_found");
        }

        // 3. Create Child Assessment
        const assessment = await ChildAssessment.create(assessmentData, { transaction: t });

        // 4. Handle Automatic Referral
        if (assessmentData.referred_to_facility === true) {
            // Resolve Health Center ID
            const family = await Family.findByPk(visit.family_id, { transaction: t });
            const healthFacilityId = await findHealthCenterId(family.block_id);

            const referral = await Referral.create({
                visit_id: assessmentData.visit_id,
                beneficiary_id: assessmentData.child_id,
                beneficiary_type: "CHILD",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                health_facility_id: healthFacilityId,
                reason: assessmentData.referral_reason || "Referred from child assessment",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });

            // 5. Emit Real-time Notification
            if (healthFacilityId) {
                try {
                    const io = getIO();
                    io.to(`referrals_hc_${healthFacilityId}`).emit("new_referral", {
                        id: referral.id,
                        beneficiary_type: "CHILD",
                        reason: referral.reason,
                        visit_id: referral.visit_id
                    });
                } catch (err) {
                    console.error("Socket emit failed:", err.message);
                }
            }
        }

        return assessment;
    });
};

/**
 * Update a child assessment
 * @param {string} id - Assessment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated assessment record
 */
const updateChildAssessmentService = async (id, updateData) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find the assessment
        const assessment = await ChildAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("child_assessment_not_found");
        }

        // 2. Check for associated Referral
        const referral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        // 3. Prevent modification of referral results if already processed
        if (referral && referral.status !== "PENDING") {
            if (
                updateData.referred_to_facility !== undefined ||
                updateData.referral_reason !== undefined
            ) {
                throw new Error("referral_already_processed");
            }
        }

        // 4. Update the assessment
        await assessment.update(updateData, { transaction: t });

        // 5. Sync Referral
        if (referral) {
            if (updateData.referred_to_facility === false) {
                // If changed to false, delete the pending referral
                await referral.destroy({ transaction: t });
            } else if (updateData.referral_reason) {
                // Update reason if provided
                await referral.update({ reason: updateData.referral_reason }, { transaction: t });
            }
        } else if (updateData.referred_to_facility === true) {
            // If referral didn't exist but now it should
            const visit = await HouseholdVisit.findByPk(assessment.visit_id, { transaction: t });
            await Referral.create({
                visit_id: assessment.visit_id,
                beneficiary_id: assessment.child_id,
                beneficiary_type: "CHILD",
                assessment_id: assessment.id,
                pc_worker_id: visit.visitor_id,
                reason: updateData.referral_reason || assessment.referral_reason || "Referred from child assessment update",
                referral_date: new Date(),
                status: "PENDING"
            }, { transaction: t });
        }

        return assessment;
    });
};

/**
 * Get child assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Object} - Assessment record
 */
const getChildAssessmentByIdService = async (id) => {
    const assessment = await ChildAssessment.findByPk(id, {
        include: [
            { model: Child, as: "child" },
            { model: HouseholdVisit, as: "visit" }
        ]
    });

    if (!assessment) {
        throw new Error("child_assessment_not_found");
    }

    return assessment;
};

/**
 * Delete a child assessment
 * @param {string} id - Assessment ID
 */
const deleteChildAssessmentService = async (id) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find the assessment
        const assessment = await ChildAssessment.findByPk(id, { transaction: t });
        if (!assessment) {
            throw new Error("child_assessment_not_found");
        }

        // 2. Check for associated Referral
        const referral = await Referral.findOne({
            where: { assessment_id: id },
            transaction: t
        });

        // 3. Prevent deletion if referral is already processed
        if (referral && referral.status !== "PENDING") {
            throw new Error("referral_already_processed");
        }

        // 4. Delete the assessment
        await assessment.destroy({ transaction: t });

        // 5. Delete the pending referral if it exists
        if (referral) {
            await referral.destroy({ transaction: t });
        }
    });
};

module.exports = {
    createPregnantAssessmentService,
    updatePregnantAssessmentService,
    getPregnantAssessmentByIdService,
    deletePregnantAssessmentService,
    createPostnatalAssessmentService,
    updatePostnatalAssessmentService,
    getPostnatalAssessmentByIdService,
    deletePostnatalAssessmentService,
    deletePregnantAssessmentService,
    createChildAssessmentService,
    updateChildAssessmentService,
    getChildAssessmentByIdService,
    deleteChildAssessmentService,
};
