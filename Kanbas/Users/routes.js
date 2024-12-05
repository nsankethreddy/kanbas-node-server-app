import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";


export default function UserRoutes(app) {
  let currentUserId = "";
 const enrollUserInCourse = async (req, res) => {
   let { uid, cid } = req.params;
   if (uid === "current") {
     const currentUser = req.session["currentUser"];
     uid = currentUser._id;
   }
   const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
   res.send(status);
 };
 const unenrollUserFromCourse = async (req, res) => {
   let { uid, cid } = req.params;
   if (uid === "current") {
     const currentUser = req.session["currentUser"];
     uid = currentUser._id;
   }
   const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
   res.send(status);
 };
 app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
 app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);

 const findCoursesForUser = async (req, res) => {
  // const currentUser = req.session["currentUser"];
  // if (!currentUser) {
  //   res.sendStatus(401);
  //   return;
  // }


  // if (currentUser.role === "ADMIN") {
  //   const courses = await courseDao.findAllCourses();
  //   res.json(courses);
  //   return;
  // }
  // let { uid } = req.params;
  // if (uid === "current") {
  //   uid = currentUser;
  // }
  const courses = await enrollmentsDao.findCoursesForUser(currentUserId);
  res.json(courses);
};
app.get("/api/users/:uid/courses", findCoursesForUser);


    const createCourse = (req, res) => {
        const currentUser = req.session["currentUser"];
        const newCourse = courseDao.createCourse(req.body);
        enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
        res.json(newCourse);
      };
      app.post("/api/users/current/courses", createCourse);

      const addEnrollments = (req, res) => {
        const currentUser = req.session["currentUser"];
        const newEnrollment = enrollmentsDao.addEnrollments(currentUser._id, newCourse._id);
        res.json(newEnrollment);
      };
      app.post("/api/users/current/enrolled", addEnrollments);

      const findAllUsers = async (req, res) => {
        const { role,name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }

        const users = await dao.findAllUsers();
        res.json(users);
      };



  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
};


  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
   if (currentUser && currentUser._id === userId) {
     req.session["currentUser"] = { ...currentUser, ...userUpdates };
   }
    res.json(currentUser);
  };




  const Signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };


const Signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      currentUserId = req.session["currentUser"]._id;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };


  const Profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };
  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
      console.log(userId)
    }
    const courses = courseDao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

  const getEnrolledCourses = (req, res) => {
    let { userId } = req.params;


    if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        userId = currentUser._id;
    }


    const enrolledCourses = enrollmentsDao.findEnrollmentsByUserId(userId);
    const courses = enrolledCourses.map((enrollment) => courseDao.findCoursesById(enrollment.course)).flat();

    res.json(courses);
};


app.get("/api/users/:userId/enrolled-courses", getEnrolledCourses);



  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  app.post("/api/users/Signup", Signup);
  app.post("/api/users/Signin", Signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/Profile", Profile);
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

}