'use strict';

// Career page: OPEN ROLES
module.exports = (sequelize, DataTypes) => {
  const JobOpening = sequelize.define(
    'JobOpening',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(150), allowNull: false }, // Senior Jewelry Designer
      department: {
        type: DataTypes.ENUM('DESIGN', 'MARKETING', 'RETAIL', 'OPERATIONS', 'TECHNOLOGY', 'OTHER'),
        allowNull: false,
      },
      location: { type: DataTypes.STRING(100), allowNull: true },
      employment_type: {
        type: DataTypes.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'),
        allowNull: false,
        defaultValue: 'FULL_TIME',
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_open: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      posted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'job_openings',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_jobs_open', fields: ['is_open', 'department'] }],
    }
  );

  JobOpening.associate = (models) => {
    JobOpening.hasMany(models.JobApplication, { as: 'applications', foreignKey: 'job_opening_id', onDelete: 'SET NULL' });
  };

  return JobOpening;
};
