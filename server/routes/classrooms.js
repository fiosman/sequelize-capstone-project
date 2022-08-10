// Instantiate router - DO NOT MODIFY
const express = require("express");
const router = express.Router();

// Import model(s)
const { Classroom, Supply, Student, StudentClassroom } = require("../models");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

// List of classrooms
router.get("/", async (req, res, next) => {
  let errorResult = { errors: [], count: 0, pageCount: 0 };

  // Phase 2B: Classroom Search Filters
  /*
        name filter:
            If the name query parameter exists, set the name query
                filter to find a similar match to the name query parameter.
            For example, if name query parameter is 'Ms.', then the
                query should match with classrooms whose name includes 'Ms.'

        studentLimit filter:
            If the studentLimit query parameter includes a comma
                And if the studentLimit query parameter is two numbers separated
                    by a comma, set the studentLimit query filter to be between
                    the first number (min) and the second number (max)
                But if the studentLimit query parameter is NOT two integers
                    separated by a comma, or if min is greater than max, add an
                    error message of 'Student Limit should be two integers:
                    min,max' to errorResult.errors
            If the studentLimit query parameter has no commas
                And if the studentLimit query parameter is a single integer, set
                    the studentLimit query parameter to equal the number
                But if the studentLimit query parameter is NOT an integer, add
                    an error message of 'Student Limit should be a integer' to
                    errorResult.errors 
    */
  const where = {};

  // Your code here

  if (req.query.name) {
    where.name = { [Op.iLike]: `%` + req.query.name + `%` };
  }

  if (req.query.studentLimit.includes(",")) {
    const minLimit = Number(req.query.studentLimit.slice(0, req.query.studentLimit.indexOf(",")));
    const maxLimit = Number(
      req.query.studentLimit.slice(
        req.query.studentLimit.indexOf(",") + 1,
        req.query.studentLimit.length
      )
    );

    if (minLimit > maxLimit || isNaN(minLimit) || isNaN(maxLimit)) {
      errorResult.errors.push("Student Limit should be two integers: min and max");
    }
    //TODO: Error handling
    if (!isNaN(minLimit) && !isNaN(maxLimit)) {
      where.studentLimit = { [Op.between]: [Number(minLimit), Number(maxLimit)] };
    }
  } else if (!req.query.studentLimit.includes(",")) {
    if (!isNaN(req.query.studentLimit)) {
      where.studentLimit = Number(req.query.studentLimit);
    } else {
      errorResult.errors.push("Student Limit should be a integer");
    }
  }

  const classrooms = await Classroom.findAll({
    attributes: ["id", "name", "studentLimit"],
    where,
    // Phase 1B: Order the Classroom search results
    order: [["name", "ASC"]],
  });

  res.json(classrooms);
});

// Single classroom
router.get("/:id", async (req, res, next) => {
  let classroom = {};

  const classroomDetails = await Classroom.findByPk(req.params.id, {
    attributes: ["id", "name", "studentLimit"],
    include: [
      {
        model: Supply,
        attributes: ["id", "name", "category", "handed"],
        separate: true,
        order: [
          ["category", "ASC"],
          ["name", "ASC"],
        ],
      },
      {
        model: Student,
        attributes: ["id", "firstName", "lastName", "leftHanded"],
        order: [
          [{ through: { model: StudentClassroom } }, "lastName", "ASC"],
          [{ through: { model: StudentClassroom } }, "firstName", "ASC"],
        ],
        through: { attributes: [] },
      },
    ],
  });

  if (!classroomDetails) {
    res.status(404);
    res.send({ message: "Classroom Not Found" });
  } else {
    classroom.classroomDetails = classroomDetails;
  }

  const classroomAverage = await StudentClassroom.findOne({
    where: { classroomId: req.params.id },
    attributes: [[Sequelize.fn("AVG", Sequelize.col("grade")), "avgGrade"]],
    raw: true, //to return only the datavalues
  });

  if (classroomAverage) {
    classroom.avgGrade = classroomAverage.avgGrade;
  }
  // Phase 5: Supply and Student counts, Overloaded classroom
  // Phase 5A: Find the number of supplies the classroom has and set it as
  // a property of supplyCount on the response
  // Phase 5B: Find the number of students in the classroom and set it as
  // a property of studentCount on the response
  // Phase 5C: Calculate if the classroom is overloaded by comparing the
  // studentLimit of the classroom to the number of students in the
  // classroom
  // Optional Phase 5D: Calculate the average grade of the classroom
  // Your code here

  res.json(classroom);
});

// Export class - DO NOT MODIFY
module.exports = router;
