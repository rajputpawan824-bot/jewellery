'use strict';

// "Apply Now": full name, position, place, resume
module.exports = (sequelize, DataTypes) => {
  const JobApplication = sequelize.define(
    'JobApplication',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      job_opening_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      position_text: { type: DataTypes.STRING(150), allowNull: false },
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: true, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      preferred_place: { type: DataTypes.STRING(100), allowNull: true },
      resume_url: { type: DataTypes.STRING(500), allowNull: false },
      status: {
        type: DataTypes.ENUM('NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'NEW',
      },
    },
    {
      tableName: 'job_applications',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_ja_job', fields: ['job_opening_id', 'status'] },
        { name: 'ix_ja_status', fields: ['status', 'created_at'] },
      ],
    }
  );

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.JobOpening, { as: 'jobOpening', foreignKey: 'job_opening_id', onDelete: 'SET NULL' });
  };

  return JobApplication;
};
