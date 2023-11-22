const dotenv = require("dotenv");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const axios = require("axios");
const path = require('path');
const nodemailer = require("nodemailer");
const multer = require("multer");
const express = require("express");
const router = express.Router();

const mysql = require("../connection");
dotenv.config({ path: "./config.env" });
const getCurrentDate = require("./../Utils/dateUtils.js");
const { verifyToken, checkUserRole } = require('./../Middleware/verifyToken.js');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadDirectory = `${__dirname}/../uploads`;
const current_date = getCurrentDate();
//------------------------------------------------------hiring/post a job---------------------------------------------------------------------------

router.get("/getDepartment", (req, res) => {
  console.log("/getDepartment");
  mysql.query("select * from department", (error, result) => {
    if (error) {
      console.log(error);
      res.json({ message: 'an error occured while fetching Departmnts', success: false });
    } else {
      res.json(result);
    }
  });
});
router.get("/getDegrees", verifyToken, (req, res) => {
  console.log("/getDegrees");
  mysql.query("select * from degrees", (error, result) => {
    if (error) {
      console.log(error);
      res.json({ message: 'an error occured while fetching degrees', success: false });
    } else {
      res.json(result);
    }
  });
});
router.get("/getExperience", (req, res) => {
  console.log("/getExperience");
  mysql.query("select * from experience", (error, result) => {
    if (error) {
      res.json({ message: 'error occured while fetching Experience', success: false });
    } else {
      res.json(result);
    }
  });
});

router.get("/getRoles", (req, res) => {
  console.log("/getRoles");
  mysql.query("select * from roles", (error, result) => {
    if (error) {
      res.json({ message: error.sqlMessage });
    } else {
      res.json(result);
    }
  });
});
router.get("/getAttendence", (req, res) => {
  console.log("/getAttendence");
  mysql.query("select * from attendance", (error, result) => {
    if (error) {
      res.json({ message: error.sqlMessage });
    } else {
      res.json(result);
    }
  });
});

// get jobs by hr and employee
router.get("/getJobs", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getJobs");
  mysql.query(
    "select * from jobs j inner join department d on d.dep_id=j.dep_id",
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage });
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/getJobPositions", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getJobpositions");
  mysql.query(
    "select * from  jobpositions",
    (error, result) => {
      if (error) {
        res.json({ message: 'error' });
      } else {
        res.json(result);
      }
    }
  );
});
router.get("/getJobsforApply", (req, res) => {
  console.log("/getJobsforApply");
  mysql.query(
    "select * from jobs j inner join department d on d.dep_id=j.dep_id",
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage });
      } else {
        res.json(result);
      }
    }
  );
});
router.get("/getOneJob/:id", (req, res) => {
  console.log("/getOneJob");
  mysql.query(
    "select title from jobs where job_id=? limit 1;", [req.params.id],
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage });
      } else {
        res.json(result[0]);
      }
    }
  );
});

///////------------------------hr-----------------------------
router.get("/getDepInfo", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getDepInfo");
  mysql.query(`call GetDepartmentsWithTotalEmployees()`, (err, results) => {
    if (err) {
      console.error("Error fetching dep info for dep module:", err);
      res.json({ success: false, message: error.sqlMessage });
    } else {
      res.json(results);
    }
  });
});

router.get("/AttforPayRoll",  (req, res) => {
  console.log("/AttforPayRoll");
  mysql.query(`SELECT
  emp_id,
  COUNT(CASE WHEN status = 'Present' THEN 1 ELSE NULL END) AS present_days,
  COUNT(CASE WHEN status = 'Leave' THEN 1 ELSE NULL END) AS leave_days,
  COUNT(CASE WHEN status = 'Absent' THEN 1 ELSE NULL END) AS absent_days
FROM attendance
WHERE YEAR(attendance_date) = YEAR(CURRENT_DATE())
  AND MONTH(attendance_date) = MONTH(CURRENT_DATE())
GROUP BY emp_id;`, (err, results) => {
    if (err) {
      console.error("Error fetching Attendance for Payroll", err);
      res.json({ success: false, message: error.sqlMessage });
    } else {
      res.json(results);
    }
  });
});

///////------------------------hr-----------------------------

router.get("/getEmployees", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getEmployees");
  mysql.query(
    "SELECT ei.name,ei.emp_id,ei.email,ei.phone_number,ei.city,ei.address,ei.DOB,ei.cnic,ei.cgpa,ei.major,ei.degree,ei.github_profile_url,ei.linkedin_profile_url,ei.university,ei.qualification,j.job_id,ei.Tax,ei.Bonus,ei.performanceScore,ei.netSalary,d.dep_id,d.dep_name,j.job_name,s.salary_id,s.salary_amount,s.salary_status,s.salary_date,r.role_id,r.role_name,ei.gender,ei.hire_date,ei.salary FROM employee ei JOIN roles r ON ei.role_id = r.role_id JOIN department d ON ei.dep_id = d.dep_id JOIN jobpositions j ON ei.job_id = j.job_id LEFT JOIN salary s ON ei.emp_id = s.emp_id;",
    (err, results) => {
      if (err) {
        console.error("Error fetching job emp info:", err);
        res.json({ message: 'error' });
      } else {
        res.json(results);
      }
    }
  );
});

router.post("/updateDepartment", (req, res) => {
  const { depId, depName } = req.body;
  console.log("/updateDepartment");
  mysql.query(
    "UPDATE Department SET dep_name = ? WHERE dep_id = ?;", [depName, depId],
    (err, results) => {
      if (err) {
        console.error("Error Updating Department Name:", err);
        res.json({ message: error.sqlMessage });
      } else {
        res.json({ success: true, message: 'Department updated successfully' });
      }
    }
  );
});

router.get('/addNewDegree/:newJob', verifyToken, (req, res) => {
  console.log('/addNewDegree');
  const name = req.params.newJob;
  mysql.query('insert into degrees (name) values (?);', [name],
    (err, results) => {
      if (err) {
        console.log(err);
        res.json({ message: "Error inserting New Degree", error: err, success: false });
      } else {
        res.json({ message: `${name} Degree added Successfully`, results, success: true });
      }
    }
  );
})
// router.post("/addJobPosition",verifyToken,checkUserRole(1),(req,res)=>{
//   console.log('/addJobPosition');
//   mysql.query('insert into jobpositions (job_name) values(?)',[req.body.newJob],
//     (err, results) => {
//       if (err) {
//         console.error("Error inserting job position", err);
//         res.json({ message: "Error inserting job position", success: false });
//       } else {
//         res.json({ message: `${req.body.newJob} Job added Successfully`, success: true });
//       }
//     }
//   );
// })

router.get("/attendanceRecord", verifyToken, checkUserRole(2), (req, res) => {
  const { emp_id } = req.user;
  console.log("/attendanceRecord");
  mysql.query(
    "SELECT * FROM attendance WHERE emp_id = ?  AND DATE_FORMAT(attendance_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m');", [emp_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching Your Attendance Record:", err);
        res.json({ message: "Error fetching Your Attendance Record", success: false });
      } else {
        res.json(results);
      }
    }
  );
});

// delete job by hr
router.post("/deleteJob", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/deleteJob");
  const { job_id } = req.body;
  mysql.query(
    "call deletejob",
    [job_id],
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage, error, success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});
router.post("/deleteDep", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/deleteDep");
  const { dep_id } = req.body;
  mysql.query(
    "DELETE FROM department WHERE dep_id = ?;",
    [dep_id],
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage, error, success: false });
      } else {
        res.json({ success: true, message: 'Deparment deleted Successfully' });
      }
    }
  );
});

// job post by hr
router.post("/jobPost", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/jobPost");

  const {
    title,
    experience,
    expiry_date,
    description,
    dep_id,
    salary,
    location,
    summary
  } = req.body;
  mysql.query(
    "CALL postjob(?, ?, ?, ?, ?, ?, ?,?);",
    [
      title,
      experience,
      expiry_date,
      description,
      dep_id,
      salary,
      location,
      summary
    ],
    (error, result) => {
      if (error) {
        console.log(error);
        res.json({ message: "error posting job", error, success: false });
      } else {
        res.json({ success: true, message: 'Jobs Posted Successfully' });
      }
    }
  );
});
//------------------------------------------job application submission api's-----------------------------------------


if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

router.post("/submitJobApplication", upload.single("cv_file"), (req, res) => {
  console.log("/submitJobApplication");
  const {
    applicant_name,
    email,
    city,
    cnic,
    phone_number,
    desired_salary,
    address,
    job_id,
    university,
    degree,
    gender,
    zipcode,
    experience,
    linkedin_profile_url,
    github_profile_url,
    dob,
    cgpa,
    qualification,
    dep_id
  } = req.body;
  const fileName = `${job_id}_${applicant_name}.pdf`; // Generate a unique file name
  const cv_file = req.file.buffer; // Use req.file.buffer to access the file data
  const dataArray = [
    applicant_name,
    email,
    cnic,
    city,
    phone_number,
    desired_salary,
    fileName,
    address,
    job_id,
    university,
    degree,
    gender,
    zipcode,
    experience,
    linkedin_profile_url,
    github_profile_url,
    dob,
    cgpa,
    qualification,
    dep_id];
  const filePath = `${uploadDirectory}/${fileName}`; // Full path to the file
  console.log(dataArray);

  fs.writeFile(filePath, cv_file, (err) => {
    if (err) {
      console.error("Error saving file to server:", err);
      res.json({
        message: "Error saving file to server",
        error: err,
        success: false,
      });
    } else {
      mysql.query(
        "INSERT INTO applications (applicant_name, email, cnic, city, phone_number, desired_salary, cv_pdf, address, job_id,university,degree,gender,zipcode,experience,linkedin_profile_url,github_profile_url,dob,cgpa,qualification,dep_id) VALUES  (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
        dataArray,
        (error, result) => {
          if (error) {
            res.json({ message: error.sqlMessage, error, success: false });
            console.log(error);
          } else {
            res.json({
              success: true,
              message: "Application submitted successfully.",
            });
          }
        }
      );
    }
  });
});

router.post("/getResume", (req, res) => {
  const { application_id,applicant_name,job_id } = req.body;
  console.log(application_id,applicant_name,job_id);
  
  const fileName = `${job_id}_${applicant_name}.pdf`;
  const filePath = `${uploadDirectory}/${fileName}`; // Full path to the file

  if (fs.existsSync(filePath)) {
    res.contentType("application/pdf");
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.status(404).send("File not found");
  }
});

//---------------------------------------------hiring/view job applications------------------------------------------------------------------------
router.get("/getJobApplications", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getJobApplications");
  mysql.query(
    "select application_id,a.gender,a.qualification,d.dep_name,a.zipcode,a.university,a.degree,a.experience,desired_salary,a.linkedin_profile_url,a.github_profile_url,a.cgpa,a.dob, a.applicant_name, a.email,a.phone_number, a.status,j.job_id,title from applications a inner join jobs j on a.job_id=j.job_id inner join department d on a.dep_id=d.dep_id;",
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage, error, success: false });
      } else {
        res.json(result);
      }
    }
  );
});
router.post("/rejectApplication", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/rejectApplication");
  const { rejectedApplicationId, email, applicantName, applicantJobName, appTitle, st } = req.body;
  console.log(st);
  mysql.query(
    "delete from applications where application_id =?",
    [rejectedApplicationId],
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage, error, success: false });
      } else {
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: ` Update on Your ${st == 'Pending' ? 'Application' : st == 'Interview' ? "Interview" : ''}`,
          text: `${st == 'pending' ? `Dear ${applicantName},  

          I hope this message finds you well. We appreciate your interest in the ${appTitle} position at HRConnect and the time you invested in your application. After careful consideration and a thorough review of all applicants, we regret to inform you that we have chosen to move forward with another candidate for this role. We understand that this may be disappointing news, and we want to assure you that our decision was not made lightly.
          
          We received a large number of applications from highly qualified individuals, which made the selection process quite competitive. While your qualifications and experience are impressive, we ultimately found another candidate whose skills and background more closely align with the specific needs of the role and our organization at this time. Please understand that this decision does not diminish the value of your skills and experience. We encourage you to continue exploring opportunities that match your career goals and expertise. We will keep your application on file for future openings, and we welcome you to apply for any positions that align with your qualifications in the future.
         
          Thank you once again for your interest in HRConnect, and we wish you every success in your job search. We appreciate your understanding and hope you find the perfect opportunity that matches your career aspirations.
Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com          
` : st == 'Interview' ?
            `Dear ${applicantName},

          I hope this email finds you well. We sincerely appreciate your interest in the${appTitle} position at HRConnect and your participation in the interview process. After careful consideration, we regret to inform you that we have chosen to move forward with another candidate for this role.
          
          Please understand that this decision was not made lightly, and it in no way diminishes the effort and dedication you demonstrated throughout the interview process. We were genuinely impressed with your skills, experience, and enthusiasm, and your performance during the interview was commendable.
          
          We received a significant number of applications from highly qualified individuals, which made the selection process highly competitive. Ultimately, we decided to move forward with a candidate whose qualifications and experience more closely aligned with the specific needs of the role and our organization at this time.
          
          We understand that this news may be disappointing, but we want to emphasize that your candidacy was taken very seriously, and we appreciate the time and effort you invested in the application and interview process. We encourage you to continue your job search and explore opportunities that match your qualifications and career aspirations.
          
          If you would like feedback on your interview performance or have any questions about our decision, please do not hesitate to reach out us details mentioned below. We are more than willing to provide you with constructive feedback to help you in your future job pursuits.
          
          Once again, thank you for considering a career with HRConnect. We genuinely appreciate your interest and the opportunity to get to know you better. We wish you all the best in your professional endeavors and hope you find the perfect opportunity that aligns with your career goals.


Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com
          `: ''}`,
        };
        transporter.sendMail(mailOptions, (emailError, info) => {
          if (emailError) {
            console.error("Error sending email:", emailError);
            res
              .status(500)
              .json({
                success: false,
                message: "Failed to send reject application letter",
              });
          } else {
            console.log("Email sent:", info.response);
            res
              .status(200)
              .json({
                success: true,
                message: "application rejected successfully",
              });
          }
        });
      }
    }
  );
});

router.post("/callForInterview", (req, res) => {
  console.log("callForInterview");
  const { callForInterviewId, interviewDate, interviewTime, email, applicantName, applicantJobName } = req.body;

  console.log(callForInterviewId);
  mysql.query(
    'update applications set status="interview" where application_id=?;',
    [callForInterviewId],
    (error, result) => {
      if (error) {
        res.json({ message: error.sqlMessage, error, success: false });
      } else {
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: "Invitation for Interview",
          text: `Dear ${applicantName},
          I hope this message finds you well. We appreciate your interest in the ${applicantJobName} position at HRConnect and your recent application. After a thorough review of all applicants, we are pleased to inform you that you have been selected for an interview.
          We would like to invite you to interview for the  ${applicantJobName} position on:
          Date:  ${interviewDate} 
          Time:  ${interviewTime} 
          Location: HRConnect, Lahore, Pakistan

          During the interview, you will have the opportunity to discuss your qualifications, learn more about our company, and meet with members of our team. Please be prepared to talk about your relevant experience and how it aligns with the requirements of the position.
          Prior to the interview, we kindly ask that you review our website and research our company to familiarize yourself with our values, mission, and goals. This will help facilitate a productive discussion during the interview.
          We look forward to meeting you in person and learning more about your qualifications and how you could contribute to [Company Name]. If you have any questions or need any further information, please don't hesitate to reach out.
          Thank you for considering a career with us, and congratulations once again on being selected for an interview. We wish you the best of luck and look forward to the opportunity to get to know you better.
          
Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com

          `,
        };

        transporter.sendMail(mailOptions, (emailError, info) => {
          if (emailError) {
            console.error("Error sending email:", emailError);
            res.status(500).json({ success: false, message: "Failed to send  Inteview call letter via email", });
          } else {
            console.log("Email sent:", info.response);
            res.status(200).json({ success: true, message: "Interview Call Letter sended successfully", });
          }
        });
      }
    }
  );
});

router.post('/callSelectedApplicantForInterview', (req, res) => {
  console.log("/callSelectedApplicantForInterview");
  const { data, interviewDate, interviewTime } = req.body;
  console.log(data, interviewDate, interviewTime);
  data.forEach((employee) => {
    const { application_id, email, applicant_name: applicantName, job_id: applicantJobName } = employee;
    mysql.query(
      'update applications set status="interview" where application_id=?;',
      [application_id],
      (error, result) => {
        if (error) {
          res.json({ message: error.sqlMessage, error, success: false });
        } else {
          const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            // to: 'muhammadihtisham60@gmail.com',
            // to: email,
            to: "zeeshanalico24@gmail.com",
            subject: ": Invitation for Interview ",
            text: `Dear ${applicantName},
I hope this message finds you well. We appreciate your interest in the ${applicantJobName} position at HRConnect and your recent application. After a thorough review of all applicants, we are pleased to inform you that you have been selected for an interview.
We would like to invite you to interview for the  ${applicantJobName} position on:
Date:  ${interviewDate} Time:  ${interviewTime} Location: HRConnect, Lahore, Pakistan
During the interview, you will have the opportunity to discuss your qualifications, learn more about our company, and meet with members of our team. Please be prepared to talk about your relevant experience and how it aligns with the requirements of the position.
Prior to the interview, we kindly ask that you review our website and research our company to familiarize yourself with our values, mission, and goals. This will help facilitate a productive discussion during the interview.
We look forward to meeting you in person and learning more about your qualifications and how you could contribute to HR Connect. If you have any questions or need any further information, please don't hesitate to reach out.
Thank you for considering a career with us, and congratulations once again on being selected for an interview. We wish you the best of luck and look forward to the opportunity to get to know you better.
            
Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com`,
          };

          transporter.sendMail(mailOptions, (emailError, info) => {
            if (emailError) {
              console.error("Error sending email:", emailError);
              res.status(500).json({ success: false, message: "Failed to send Inteview call letters", });
            } else {
              console.log("Email sent:", info.response);
              res.status(200).json({ success: true, message: "Selected applicants called for Interview", });
            }
          });
        }
      }
    );
  })
})

router.post('/pdf', (req, res) => {
  console.log('/pdf');
  console.log(req.body);
  const job_id = req.body.job_id;
  const applicant_name = req.body.applicant_name;
  console.log(job_id, applicant_name);
  const fileName = `${job_id}_${applicant_name}.pdf`;
  const filePath = path.join(__dirname, '../uploads', fileName);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.status(500).json({ error: `Error reading PDF file at ${filePath}` });
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.contentType('application/pdf');
        res.send(data);
      }
    });
  } else {
    res.status(404).json({ error: `PDF file not found at ${filePath}` });
  }
});
// -------------------------------------------------------------------------
const storageImage = multer.diskStorage({
  destination: 'ImgUploads/',
  filename: function (req, file, callback) {
    const { emp_id } = req.user
    const fileExtension = path.extname(file.originalname);
    callback(null, emp_id + String(fileExtension));
  },
});

const uploadImage = multer({ storage: storageImage });

router.post('/upload', verifyToken, uploadImage.single('image'), (req, res) => {
  // const {emp_id}=user
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const { filename } = req.file;
  mysql.query('INSERT INTO images (image_file_name) VALUES (?)', [filename], (err) => {
    if (err) { console.log(err); }
    res.status(200).json({ message: 'File uploaded successfully' });
  });
});

router.get('/images', verifyToken, (req, res) => {
  const { emp_id } = req.user;
  const imagePath = path.join(__dirname, '..', 'ImgUploads', `${emp_id}.png`);
  if (!imagePath || !fs.existsSync(imagePath)) {
    return res.status(404).json({ success: false, message: 'Image not found' });
  }
  res.setHeader('Content-Type', 'image/png')
  res.sendFile(imagePath);
});

// router.get('/images/:format', verifyToken, (req, res) => {
//   const { emp_id } = req.user;
//   const { format } = req.params;
//   if (!['jpg', 'jpeg', 'png'].includes(format.toLowerCase())) {
//     return res.status(400).json({ success: false, message: 'Unsupported image format' });
//   }
//   const imagePath = path.join(__dirname, '..', 'ImgUploads', `${emp_id}.${format}`);
//   if (!imagePath || !fs.existsSync(imagePath)) {
//     return res.status(404).json({ success: false, message: 'Image not found' });
//   }
//   let contentType = 'image/png'; // Default to PNG
//   if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
//     contentType = 'image/jpeg';
//   }
//   res.setHeader('Content-Type', contentType);
//   res.sendFile(imagePath);
// });

// ------------------------------------------------------------Departments--------------------------------------------------------------------------------------------
// router.post("/addDepartment", (req, res) => {
//   console.log("/addDepartment");
//   const { newDepartmentName } = req.body;
//   const query = "INSERT INTO Department (dep_name) VALUES (?)";
//   mysql.query(query, [newDepartmentName], (error, results) => {
//     if (error) {
//       console.error("Error adding department:", error);
//       return res.json({ success: false, message: "Error adding department." });
//     }
//     res.json({ success: true, message: "Department added successfully." });
//   });
// });

// router.post("/addDepartment", (req, res) => {
//   const { newDepartmentName, newDegrees } = req.body;
//   const insertDepartmentQuery = "INSERT INTO Department (dep_name) VALUES (?)";
//   mysql.query(insertDepartmentQuery, [newDepartmentName], (error, departmentResult) => {
//     if (error) {
//       console.error("Error adding department:", error);
//       return res.json({ success: false, message: "Error adding department." });
//     }
//     const depId = departmentResult.insertId;
//     const insertDegreeQuery = "INSERT INTO department_degree (dep_id, deg_id) VALUES ?";
//     const degreeValues = newDegrees.map((degree) => [depId, degree]);

//     mysql.query(insertDegreeQuery, [degreeValues], (degreeError, degreeResult) => {
//       if (degreeError) {
//         console.error("Error adding degrees:", degreeError);
//         return res.json({ success: false, message: "Error adding degrees." });
//       }
//       res.json({ success: true, message: "Department and degrees added successfully." });
//     });
//   });
// });

router.post("/addDepartment", (req, res) => {
  const { newDepartmentName, newDegrees } = req.body;
  const insertDepartmentQuery = "INSERT INTO Department (dep_name) VALUES (?)";
  mysql.query(insertDepartmentQuery, [newDepartmentName], (error, departmentResult) => {
    if (error) {
      console.error("Error adding department:", error);
      return res.json({ success: false, message: "Error adding department." });
    }
    const depId = departmentResult.insertId;
    const uniqueDegrees = new Set(newDegrees);
    const uniqueDegreeArray = Array.from(uniqueDegrees);

    const insertDegreeQuery = "INSERT INTO department_degree (dep_id, deg_id) VALUES ?";
    const degreeValues = uniqueDegreeArray.map((degree) => [depId, degree]);

    mysql.query(insertDegreeQuery, [degreeValues], (degreeError, degreeResult) => {
      if (degreeError) {
        console.error("Error adding degrees:", degreeError);
        return res.json({ success: false, message: "Error adding degrees." });
      }
      res.json({ success: true, message: "Department and degrees added successfully." });
    });
  });
});

router.post('/registerEmployee', verifyToken, checkUserRole(1), async (req, res) => {
  try {

    const {
      address,
      applicant_name,
      cgpa,
      city,
      cnic,
      degree,
      dep_id,
      dob,
      email,
      emp_id,
      gender,
      github_profile_url,
      hire_date,
      job_id,
      linkedin_profile_url,
      phone_number,
      role_id,
      salary,
      university,
      zipcode,
      qualification,

      JobName
    } = req.body;
    console.log(JobName);
    // const requiredFields = [address,
    //   applicant_name,
    //   cgpa,
    //   city,
    //   cnic,
    //   degree,
    //   dep_id,
    //   dob,
    //   email,
    //   emp_id,
    //   gender,
    //   github_profile_url,
    //   hire_date,
    //   job_id,
    //   linkedin_profile_url,
    //   qualification,

    //   phone_number,
    //   role_id,
    //   salary,
    //   university,
    //   zipcode]
    // for (const field of requiredFields) {
    //   if (req.body[field] === undefined || req.body[field].trim() === '') {
    //     return res.status(400).json({ success: false, message: `Field '${field}' is required.` });
    //   }
    // }
    const DOB = dob?.toString()?.slice(0, 10)
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(cnic?.toString(), salt);

    mysql.query('CALL registerEmployee(?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        address,
        applicant_name,
        cgpa,
        city,
        cnic,
        degree,
        dep_id,
        DOB,
        email,
        hashed_password,
        emp_id,
        gender,
        github_profile_url,
        hire_date,
        job_id,
        linkedin_profile_url,
        qualification,
        phone_number,
        role_id,
        salary,
        university,
        zipcode], (error, result) => {
          if (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Failed to Register employee" });
          } else {
            const mailOptions = {
              from: process.env.EMAIL_USERNAME,
              to: email,
              subject: "Welcome to HRConnect - Your Employee Dashboard Access",
              text: `Dear ${applicant_name},
I hope this email finds you well. We are thrilled to officially welcome you to the HRConnect team as our newest ${JobName}. Your acceptance of our offer is a significant milestone, and we are excited to have you on board.
As part of our onboarding process, we are delighted to provide you with access to our Employee Dashboard, a centralized platform where you can manage your employment-related information and access various resources.
Employee Dashboard Access Details:

Dashboard URL: http://localhost:3001/Login
Email:${email}
Temporary Password: ${cnic}

Note: For security reasons, please reset your password immediately after your first login. We have set your initial password as your CNIC number.

Steps to Access Your Employee Dashboard:
1.Visit the provided Dashboard URL.
2.Enter your email and the temporary password ${cnic}.

Should you encounter any difficulties while logging in or if you have any questions about the Employee Dashboard, please do not hesitate to reach out to our HR department at below mention details. We are here to assist you and ensure a smooth transition into our organization.
Please remember that your initial password is your CNIC number, but we strongly recommend rest it to a more secure password as soon as possible after your first login.
Once again, welcome to the HRConnect family! We believe that your skills and expertise will make a positive impact, and we are looking forward to your contributions.

Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com `,

            };

            transporter.sendMail(mailOptions, (emailError, info) => {
              if (emailError) {
                console.error("Error sending email:", emailError);
                return res.status(500).json({ success: false, message: "Failed to send the Hiring Offer letter via email", });
              } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ success: true, message: "Employee Data inserted successfully & Offer Letter sent", });
              }
            })
          }
        })
  } catch (error) {
    console.log(error);
    res.json({ message: 'catch error', error, success: false })
  }
});

router.post('/sendOfferLetter', (req, res) => {
  const { application_id, offerLetter } = req.body;

  // Query the database for the applicant's email
  mysql.query('SELECT email FROM applications WHERE application_id = ?', [application_id], (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ success: false, message: 'Error querying the database' });
    } else {
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      const recipientEmail = result[0].email;
      console.log(recipientEmail);
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipientEmail,
        subject: "Offer of Employment",
        text: offerLetter,
      };

      transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          console.error("Error sending email:", emailError);
          return res.status(500).json({ success: false, message: "Failed to send the Offer letter via email" });
        } else {
          console.log("Email sent:", info.response);
          return res.status(200).json({ success: true, message: "Offer Letter sent" });
        }
      });
    }
  });
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

router.post("/removeEmployee", verifyToken, checkUserRole(1), async (req, res) => {
  console.log("/removeEmployee");
  try {
    const { emp_id } = req.body;

    const response = await axios.post(
      "http://localhost:3002/getOneEmp",
      { emp_id }
    );
    const employee = response.data;

    mysql.query(
      "call deleteEmp(?);",
      [emp_id],
      (error, result) => {
        if (error) {
          console.error("Error removing employee:", error);
          res.status(500).json({ success: false, message: "Failed to remove employee" });
        } else {
          const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: employee.email,
            subject: "Termination Letter",
            text: `
          ${current_date}
          
          Dear ${employee.name},          
          Position:${employee.job_name}
          Start Date: ${employee.hire_date}
         
I am writing to inform you that your employment with HrConnect is terminated, effective ${current_date}. This decision has been made after a careful review of your performance and other relevant factors.

Effective immediately, your access to company premises and systems will be revoked.
You are expected to maintain confidentiality regarding any company information, clients, and colleagues, even after your employment ends.

Questions & clarification:
If you have any question regarding the termination, please do not hesitate to ask.
We understand that this may be a challenging time, and we wish you the best in the future endeavour.

Regards,
Muhammad Ihtisham
Senior HR
HRConnect, Lahore, Pakistan
+92 316 418 1458
muhammadihtisham269@gmail.com`,
          };
          transporter.sendMail(mailOptions, (emailError, info) => {
            if (emailError) {
              console.error("Error sending email:", emailError);
              res.status(500).json({ success: false, message: "Failed to send termination letter via email", });
            } else {
              console.log("Email sent:", info.response);
              res.status(200).json({ success: true, message: "Employee removed and Experience sent successfully", });
            }
          });
        }
      }
    );
  } catch (e) {
    res.json({ success: false, message: e });
  }
});

// --------------------------------------------------------------------------emp/attendence---------------------------------------------------------------------------------
router.post("/getAttendencebyEmp", verifyToken, checkUserRole(2), (req, res) => {
  console.log("getAttendencebyEmp");
  const { todayDate } = req.body;
  const { emp_id } = req.user;
  mysql.query(
    "select status from attendance where emp_id=? and attendance_date=?;",
    [emp_id, todayDate],
    (err, result) => {
      if (err) {
        res.json({
          success: false,
          message: "error in fetching attendace status",
        });
      }
      else {
        res.json(result);
      }
    }
  );
});

router.put("/updateAttendance", verifyToken, checkUserRole(2), async (req, res) => {
  console.log("/updateAttendance");
  const { att_status } = req.body;
  const { emp_id } = req.user;
  mysql.query(
    "INSERT INTO attendance (emp_id, status, attendance_date) VALUES (?, ?, ?)",
    [emp_id, att_status, current_date],
    (error, result) => {
      if (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred" });
      } else {
        res.json({ success: true, message: "Attendance marked" });
      }
    }
  );
});

router.put("/leaverequest", verifyToken, checkUserRole(2), async (req, res) => {
  console.log("/leaverequest");
  const { reason, leave_date, toDate } = req.body;
  const { emp_id } = req.user;
  console.log("/leaverequest");
  console.table({ emp_id, reason, leave_date, toDate });
  mysql.query(
    "INSERT INTO leaverequest (emp_id, reason, leave_date, applying_date,toDate ) VALUES (  ?, ?, ?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE reason = VALUES(reason), leave_date = VALUES(leave_date), applying_date = VALUES(applying_date)",
    [emp_id, reason, leave_date, current_date, toDate],
    (error, result) => {
      if (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred" });
      } else {
        res.json({ success: true, message: "Leave request has been sented." });
      }
    }
  );
});
router.put("/oneDayLeaveRequest", verifyToken, checkUserRole(2), async (req, res) => {
  console.log("/oneDayLeaveRequest");
  const { reason, leave_date } = req.body;
  const { emp_id } = req.user;
  console.table({ emp_id, reason, leave_date });
  mysql.query(
    "INSERT INTO leaverequest (emp_id, reason, leave_date, applying_date) VALUES ( ?, ?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE reason = VALUES(reason), leave_date = VALUES(leave_date), applying_date = VALUES(applying_date)",
    [emp_id, reason, leave_date, current_date],
    (error, result) => {
      if (error) {
        console.error(error);
        res.json({ error, success: false, message: "An error occurred" });
      } else {
        res.json({ success: true, message: "Leave request has been sented." });
      }
    }
  );
});

router.post('/markAbsent', (req, res) => {
  console.log('mark attendance');
  const query = `CALL markAbsentIntoAttendance()`

  mysql.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      console.log(result);
      res.json(result);
    }
  })
})

// --------------------------------------------------------------------------emp/myprofile---------------------------------------------------------------------------------
router.post("/getEmpInfobyEmpId", verifyToken, checkUserRole(2), (req, res) => {
  console.log("/getEmpInfobyEmpId");
  const { emp_id } = req.user;
  console.log("getEmpInfobyEmpId emp Id", emp_id);
  mysql.query(
    `
    SELECT
    ei.zipcode,ei.name, ei.emp_id, ei.email, ei.phone_number, ei.city, ei.address, ei.DOB,
        ei.cnic, ei.cgpa, ei.major, ei.degree, ei.github_profile_url, ei.linkedin_profile_url,
        ei.university, ei.qualification, j.job_id, ei.Tax, ei.Bonus, ei.performanceScore,
        ei.netSalary, d.dep_id, d.dep_name, j.job_name, s.salary_id, s.salary_amount,
        s.salary_status, s.salary_date, r.role_id, r.role_name, ei.gender,
        ei.hire_date, ei.salary
    FROM
        employee ei
    JOIN
        roles r ON ei.role_id = r.role_id
    JOIN
        department d ON ei.dep_id = d.dep_id
    JOIN
        jobpositions j ON ei.job_id = j.job_id
    LEFT JOIN
        salary s ON ei.emp_id = s.emp_id
    WHERE
        ei.emp_id = ?;
    `,
    [emp_id],
    (err, result) => {
      if (err) {
        res.json({
          success: false,
          message: "error in fetching attendace status",
          err,
        });
      } else {
        res.json(result[0]);
      }
    }
  );
});
router.post("/getempdashStats", verifyToken, checkUserRole(2), (req, res) => {
  console.log("/getempdashStats");
  const { emp_id } = req.user;
  mysql.query(
    "SELECT emp_id, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count, SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) AS leave_count FROM attendance WHERE emp_id = ? AND MONTH(attendance_date) = MONTH(CURDATE()) AND YEAR(attendance_date) = YEAR(CURDATE()) GROUP BY emp_id;", [emp_id], (err, result) => {
      if (err) {
        res.json({ success: false, message: "error in fetching attendace status", err, });
      } else {
        res.json(result[0]);
      }
    }
  );
});
router.post("/getOneEmp", (req, res) => {
  console.log("/getOneEmp");
  const { emp_id } = req.body;
  mysql.query(
    "select * from employee ei join roles r on ei.role_id=r.role_id join department d on ei.dep_id=d.dep_id join jobpositions jp on ei.job_id=jp.job_id where emp_id=? ;",
    [emp_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.json({ success: false, message: "error in fetching Employee", err, });
      } else {
        res.json(result[0]);
      }
    }
  );
});
router.post("/getOneApplicant", (req, res) => {
  console.log("/  ");
  const { application_id } = req.body;
  mysql.query(
    "select * from applications where application_id = ?;",
    [application_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.json({ success: false, message: "error in fetching Applicant", err });
      } else {
        res.json(result[0]);
      }
    }
  );
});

router.put("/updateEmployeeInfo", verifyToken, checkUserRole(2), async (req, res) => {
  console.log("/updateEmployeeInfo");
  try {
    const { emp_id } = req.user;
    const { email, phone_number, city, address, zipcode } = req.body;
    // if (!phone_number || !city || !address || !zipcode || phone_number=='' || city==="" || address==="" || zipcode=="") {
    //   return res.status(400).json({ success:false,message: 'All fields are required' });""
    // }
    // const phoneRegex = /^\d{11}$/;
    // if (!phoneRegex.test(phone_number)) {
    //   return res.status(400).json({ success:false, message: 'Phone Number must be 11 digits' });
    // }
    // const zipCode = /^\d{5}$/;
    // if (!zipCode.test(zipcode)) {
    //   return res.status(400).json({ success:false, message: 'Zip-Code must 5 digits' });
    // }

    const updateQuery = `UPDATE employee SET email = ?, phone_number = ?, city = ?, address = ?, zipcode = ? WHERE emp_id = ?; `;

    mysql.query(
      updateQuery,
      [email, phone_number, city, address, zipcode, emp_id],
      (error, results) => {
        if (error) {
          console.error("Error updating employee information:", error);
          res.json({ success: false, message: "Internal server error." });
        } else {
          res.json({
            success: true,
            message: "Employee information updated successfully.",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error updating employee information:", error);
    res.json({ success: false, message: "Internal server error." });
  }
});

router.get("/empLeaveHistory", verifyToken, checkUserRole(2), (req, res) => {
  console.log("/employeeLeaveHistory");
  const { emp_id } = req.user;
  console.log("Employee ID: " + emp_id);

  mysql.query(`CALL employeeLeaveHistory(${emp_id})`, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      res.json(result[0]);
    }
  });
});

router.get("/getSalaryDetailforEmp", verifyToken, checkUserRole(2), (req, res) => {
  console.log("/getSalaryDetailforEmp");
  const { emp_id } = req.user;

  mysql.query(`SELECT
  CASE
      WHEN EXISTS (
          SELECT 1
          FROM salary
          WHERE emp_id = ?
            AND YEAR(salary_date) = YEAR(CURRENT_DATE())
            AND MONTH(salary_date) = MONTH(CURRENT_DATE())
            AND salary_status = 'Paid'
      ) THEN 'Paid'
      WHEN EXISTS (
          SELECT 1
          FROM salary
          WHERE emp_id = ?
            AND YEAR(salary_date) = YEAR(CURRENT_DATE())
            AND MONTH(salary_date) = MONTH(CURRENT_DATE())
            AND salary_status = 'Not Paid'
      ) THEN 'Not Paid'
      ELSE 'Not Paid'
  END AS salary_status,
  (SELECT salary_amount FROM salary WHERE emp_id = ? AND YEAR(salary_date) = YEAR(CURRENT_DATE()) AND MONTH(salary_date) = MONTH(CURRENT_DATE())) AS salary_amount,
  (SELECT MAX(salary_date) FROM salary WHERE emp_id = ?) AS salary_date;
`,[emp_id,emp_id,emp_id,emp_id], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      res.json(result);
    }
  });
});

router.get("/getAttendance/:id", (req, res) => {
  console.log("/getAttendance");
  const { id } = req.params;

  console.log("Employee ID: " + id);

  mysql.query(`CALL getAttendance(${id})`, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      console.log(result[0]);
      res.json(result[0]);
    }
  });
});

router.get("/getDegreesById/:id", (req, res) => {
  console.log("/getDegreesById");
  const { id } = req.params;
  mysql.query(`select dd.deg_id,d.name as degree from department_degree dd inner join degrees d on d.deg_id=dd.deg_id where dd.dep_id=?;`, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      res.json(result);
    }
  });
});

router.get("/getApplicant/:id", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getApplicant");
  const { id } = req.params;

  mysql.query(
    `SELECT * FROM applications WHERE application_id = ${id}; `,
    (err, result) => {
      if (err) {
        console.error("Internal server erro:", err);
        res.json({ success: false, message: "Internal server error." });
      } else {
        res.json(result);
      }
    }
  );
});

// --------------------------------------------------------------------------hr/leaveapplication---------------------------------------------------------------------------------

router.get("/getApplications", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getApplications");
  mysql.query("call getLeaveApplication();", (err, results) => {
    if (err) {
      console.error("Error fetching job leave Applications:", err);
      res.json({ message: err.sqlMessage });
    } else {
      res.json(results);
    }
  });
});

router.get("/getTodayAttendance", verifyToken, checkUserRole(1), (req, res) => {
  mysql.query(
    "SELECT * FROM attendance WHERE attendance_date = DATE(NOW());",
    (err, result) => {
      if (err) {
        console.error(err);
        res.json({ success: false, message: "An error occurred" });
      } else {
        console.log(result);
        res.json(result);
      }
    }
  );
});

router.put("/leaveApproved", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/leaveApproved");

  const { emp_id, attendance_date, toDate } = req.body;
  console.log(emp_id, attendance_date, toDate);
  if (toDate == null || toDate === 'NaN-NaN-NaN' || toDate === "" ||toDate==undefined) {
    console.log("--singleAttendanceapproval---",emp_id, attendance_date,toDate);
    const status = "Leave";
    mysql.query(
      `call attendanceApproval(${emp_id}, '${status}', '${attendance_date}')`,
      (error, result) => {
        if (error) {
          console.error(error);
          res.json({ success: false, message: "An error occurred" });
        } else {
          res.json({ success: true, message: "Single Attendence Approved" });
        }
      }
    );
  } else {
    console.log("--multipleAttendanceapproval---",emp_id, attendance_date,toDate);
    const status = "Leave";
    mysql.query(
      `call multipleAttendanceApproval(${emp_id}, '${status}', '${attendance_date}','${toDate}')`,
      (error, result) => {
        if (error) {
          console.error(error);
          res.json({ success: false, message: "An error occurred" });
        } else {
          res.json({ success: true, message: "Multiple Attendence Approved" });
        }
      }
    );
  }
});


router.put("/leaveRejected", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/leaveRejected");
  const { req_id } = req.body;
  console.log(req_id);
  mysql.query(`call attendanceRejected(${req_id})`, (error, result) => {
    if (error) {
      console.error(error);
      res.json({ success: false, message: "An error occurred" });
    } else {
      res.json({ success: true, message: "Leave Rejected" });
    }
  });
});

router.get("/empLeaveHistory/:id", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/employeeLeaveHistory");
  // const { id } = req.params;

  console.log("Employee ID: " + id);

  mysql.query(`CALL employeeLeaveHistory(${id})`, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      res.json(result[0]);
    }
  });
});


// -------------------------------- Dashboard/hr -----------------------------
router.get("/getDashboardData", verifyToken, checkUserRole(1), (req, res) => {
  const { emp_id, role_id } = req.user;
  console.log("/getDashboardData", emp_id, role_id);
  mysql.query(`CALL getDashboardTotals(); `, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, message: "An error occurred" });
    } else {
      console.log(result[0][0]);
      res.json(result[0][0]);
    }
  });
});
// ---------------------------------------------get today attendce/hr---------------------------------------
router.get("/getTodayAllAttendance", verifyToken, checkUserRole(1), (req, res) => {
  const query = `CALL getTodayAttendance()`;

  mysql.query(query, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err, message: err.message });
      return;
    }
    res.json(results[0]);
  });
});

router.get("/getattendancehistory", verifyToken, checkUserRole(1), (req, res) => {
  const query = `CALL getattendancehistory()`;

  mysql.query(query, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err, message: err.message });
      return;
    }
    res.json(results[0]);
  });
});

// ----------------------------------------------------authentication----------------------------------------------------------------------


router.get("/logout", (req, res) => {
  console.log("/logout");
  return res.clearCookie("token").json({
    success: true,
    message: "Ready to move on",
  });
});

async function getUserByEmail(email) {

  const user = await mysql.query('SELECT * FROM users WHERE user_email = ?', [email]);
  return user[0];
}

async function updateUserPassword(userId, newPassword) {
  await db.query('', [newPassword, userId]);
}

router.post('/resetPassword', verifyToken, checkUserRole(2), async (req, res) => {
  const { email, currentPassword, password } = req.body;
  const { user_id } = req.user;
  console.log(user_id);
  try {
    mysql.query('select * from users where user_id=?;', [user_id], async (err, result) => {
      if (err) {
        res.json({ success: false, err, message: 'Their is an issue' });
        console.log(err);
      } else {
        user = result[0];
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.user_password);
        if (!passwordMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(password, salt);
        mysql.query('UPDATE users SET user_password = ? WHERE user_id = ?', [hashedNewPassword, user_id], (error, result) => {
          if (error) {
            res.json({ success: false, error, message: 'Their is an issue' });
            console.log(error);
          } else {
            res.status(200).json({ success: true, message: 'Password reset successfully' });
          }
        })

      }
    })
  }
  catch (error) {
    console.log(error);
    res.json({ success: false, error, message: 'Catch Issue' });
  }
})

router.put("/resetPassword", verifyToken, checkUserRole(2), (req, res) => {
  console.log("/reset password");
  const { user_id } = req.user;
  const q = `update users set user_password = ? where user_id = ? `;

  console.log("ID: " + req.id)
  console.log("Password : " + req.hashed_password)

  mysql.query(q, [req.hashed_password, req.id], (err, result) => {
    if (err) {
      console.log("last step failed");
      console.log(err);
      return res.json({
        success: false,
        message: "Last step failed",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Password Reset Successfully"
      })
    }
  });
});

// -----------------------------------


router.post('/login', async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    mysql.query(
      'SELECT * FROM users WHERE user_email = ?',
      [user_email],
      async (error, results) => {
        if (error) {
          console.error('Login error:', error);
          res.status(500).json({ success: false, message: 'Login failed' });
        } else if (results.length === 0) {
          res.status(401).json({ success: false, message: 'User not found' });
        } else {
          const user = results[0];
          const passwordMatch = await bcrypt.compare(user_password, user.user_password);
          if (passwordMatch) {
            const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id, emp_id: user.emp_id }, process.env.SECRET_KEY, {
              expiresIn: '3h',
            });
            res.cookie('jwtToken', token);
            res.status(200).json({ success: true, message: 'Login successful', token, role_id: user.role_id });
          } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
          }
        }
      }
    );
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});


router.get('/decodeToken', verifyToken, (req, res) => {
  const { user_id, role_id, emp_id } = req.user;
  res.json({ success: true, user_id, role_id, emp_id });
});
// ------------Payroll---------------------------------------------


router.get("/getEmployeesforPayRoll", verifyToken, checkUserRole(1), (req, res) => {
  console.log("/getEmployeesforPayRoll");
  mysql.query('call getPayroll();', (err, results) => {
    if (err) {
      console.error("Error fetching Payroll EmpInfo:", err);
      res.json({ message: 'error' });
    } else {
      res.json(results[0]);
    }
  }
  );
});


router.post('/approveSalary', (req, res) => {
  const { empId, empSal } = req.body;
  console.log(empId, empSal);
  console.log("/approveSalary");
  mysql.query("insert into salary(emp_id,salary_amount,salary_status,salary_date) values(?,?,'Paid',Now())", [empId, empSal], (error, result) => {
    if (error) {
      console.log(error);
      res.json({ message: 'an error occured while approving salaries', success: false });
    } else {
      res.json({ message: 'Salary Approved!', success: true });
    }
  })
})

router.post('/ApproveAllSalaries', (req, res) => {
  console.log("/ApproveAllSalaries");
  const { unPaidEmployees } = req.body;
  console.log(unPaidEmployees);
  const insertValues = unPaidEmployees.map(employee => [
    employee.emp_id,
    employee.netSalary,
    'Paid',
    current_date,

  ]);
  console.log(insertValues);
  mysql.query(
    "INSERT INTO salary (emp_id, salary_amount, salary_status, salary_date) VALUES ? ;",
    [insertValues],
    (error, result) => {
      if (error) {
        console.log(error);
        res.json({ message: 'An error occurred while approving salaries', success: false });
      } else {
        res.json({ message: 'Salaries Approved!', success: true });
      }
    }
  );
});

router.post('/updateSalary', (req, res) => {
  console.log("/updateSalary");
  const { updatedSalary, empId } = req.body;
  console.log(empId, updatedSalary);
  mysql.query("update employee set salary = ? where emp_id= ?", [updatedSalary, empId], (error, result) => {
    if (error) {
      console.log(error);
      res.json({ message: 'an error occured while updating salaries', success: false });
    } else {
      res.json({ message: 'Salary Updated Successfully!', success: true });
    }
  })
})

module.exports = router;
