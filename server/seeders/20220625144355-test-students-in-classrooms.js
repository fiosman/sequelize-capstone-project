"use strict";

const { Student, Classroom, StudentClassroom } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    const classrooms = await Classroom.findAll();
    const students = await Student.findAll();

    for (let i = 0; i < classrooms.length; i++) {
      for (let j = 0; j < classrooms[i].studentLimit; j++) {
        await StudentClassroom.create({
          studentId: students[j].id,
          classroomId: classrooms[i].id,
          grade: Math.floor(Math.random() * 100) + 1,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // Will be cleaned up with DELETE_CASCADE
  },
};
