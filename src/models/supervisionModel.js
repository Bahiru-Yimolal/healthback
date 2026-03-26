const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupervisionRecord = sequelize.define("SupervisionRecord", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // --- GEOGRAPHICAL & CONTEXTUAL LINK ---
  unit_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "AdministrativeUnits", // Links to City, Subcity, or HC level
      key: "id",
    },
    comment: "The physical place where this audit happened",
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  // --- FREQUENCY TRACKING (AUTOMATIC COUNTER) ---
  mentoring_visit: {
    type: DataTypes.INTEGER, // Frequency count: 1, 2, 3, ... (unlimited)
    allowNull: false,
    defaultValue: 1,
    comment: "Automatically calculated session frequency for the evaluatee",
  },

  // --- USER IDENTITIES ---
  evaluator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: "The supervisor conducting the session",
  },
  evaluatee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: "The health worker or unit admin being supervised",
  },

  // --- QUANTITATIVE DATA (CHART READY) ---
  scores: {
    type: DataTypes.JSONB, // Maps Question IDs to scores (0, 0.5, 1, or NA)
    allowNull: false,
  },
  total_possible_score: {
    type: DataTypes.FLOAT, // Total items minus N/A counts
    allowNull: false,
  },
  total_achieved_score: {
    type: DataTypes.FLOAT, // Sum of all 0, 0.5, 1
    allowNull: false,
  },
  percentage_achieved: {
    type: DataTypes.FLOAT, // (Achieved / Possible) * 100
    allowNull: false,
  },

  // --- QUALITATIVE CONTENT (DYNAMIC ARRAYS & PER-ITEM NOTES) ---
  na_explanations: {
    type: DataTypes.JSONB, // { "QI_1": "Reason for NA", "QI_5": "Reason..." }
    allowNull: true,
    comment: "Reasons why specific items were marked N/A",
  },
  strong_points: {
    type: DataTypes.JSONB, // Dynamic array of observed strong points
    defaultValue: [],
  },
  recommendations: {
    type: DataTypes.JSONB, // Dynamic array of required improvements
    defaultValue: [],
  },

  // --- REPORT MANAGEMENT ---
  level: {
    type: DataTypes.ENUM("CITY", "SUBCITY", "HEALTH_CENTER"),
    allowNull: false,
  },
  supervisor_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mentor_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  next_appointment_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "Future follow-up date for this supervision",
  },
  status: {
    type: DataTypes.ENUM("DRAFT", "COMPLETED"),
    defaultValue: "COMPLETED",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
  paranoid: true,
  tableName: "supervision_records",
});

module.exports = SupervisionRecord;
