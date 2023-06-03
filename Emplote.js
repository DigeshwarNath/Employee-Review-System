// IMPORT THE DATABASES'S COLLECTIONS
const User = require("../models/user");
const Review = require('../models/review');

// ASSIGN TASK PAGE SENDS WITH ALL EMPLOYEENAME
module.exports.assignTask = async function(req,resp){

    try
    {
        if(!req.isAuthenticated() || req.user.isAdmin == false) {
            return resp.redirect("/");
        }

        let users = await User.find({});
       
        return resp.render("assign_task", {users});
    }
    catch(error){

          console.log(`Error during assign task page :  ${error}`);
          resp.redirect("back");
    }
}

// ON SUBMIT THE ASSIGN TASK 
module.exports.taskassigned = async function(req,resp){

     try {

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }
       
       if(req.body.employee_name === req.body.reviewer_name)
       {
        
        req.flash("error", "TASK ASSIGN YOUSELF NOT ALLOWED");
        return resp.redirect("/admin/assigntask");
       }

       let to_employee = await User.findById(req.body.employee_name);
       let from_employee = await User.findById(req.body.reviewer_name);

       to_employee.evaluatefromother.push(from_employee);
       to_employee.save();

       from_employee.evaluatebyme.push(to_employee);
       from_employee.save();

      req.flash("success", "TASK ASSIGNED DONE...");
      console.log("Task assigned successfully");

      return resp.redirect('back');


     } catch (error) {

       console.log(`Error during assigned task :  ${error}`);
       resp.redirect("back");
     }

}

// SHOW ALL EMPLOYEES RECORDS AND SEND THE ALL EMPLOYEES
module.exports.EmployeeRecords = async function(req,resp){

    try{

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
       }

        let users = await User.find({});

        return resp.render("employee_records", {users});

    } catch (error) {

       console.log(`Error during showing on all employee records :  ${error}`);
       resp.redirect("back");
    }
}

// ADD THE EMPLOYEE FROM ADMIN FORM PAGE
module.exports.AddUser = async function(req,resp){

    try {

      if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
      }

      return resp.render("addUser");

    }catch (error) {

      console.log(`Error during addemployee page from admin :  ${error}`);
      resp.redirect("back");

    }
}

// ADD THE EMPLOYEE FROM ADMIN
module.exports.CreateUser = async function (req, resp) {
  try {

     if (!req.isAuthenticated() || req.user.isAdmin == false) {
       return resp.redirect("/");
     }

    if (req.body.password != req.body.confirmpassword) {

      req.flash("error", "PASSWORD DOESNOT MATCH");
      return resp.redirect("back");

    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const newuser = await User.create({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false,
      });

      await newuser.save();

      if (!newuser) {
        console.log("error in creating new employee");
        return resp.redirect("back");
      }
      
      req.flash("success", "EMPLOYEE ADDED DONE...");
      console.log("Employee added successfully from admin");

      return resp.redirect("/admin/employeerecords");

    } else {

      req.flash("error", "E-MAIL ALREADY ADDED");
      return resp.redirect("back");
    }
  } catch (error) {

    console.log(`Error during creating an employee from admin:  ${error}`);
    resp.redirect("back");
  }
};

// VIEW THE STUDENT FROM ADMIN
module.exports.ViewEmployee = async function(req,resp){

    
     try {
       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

       let user = await User.findById(req.params.id);

       return resp.render("viewEmployee", { user });

     } catch (error) {

       console.log(`Error during view an employee :  ${error}`);
       resp.redirect("back");
     }

}

// EDIT FORM ON EDIT WITH AUTOFILL DATA
module.exports.UpdateReqUser = async function(req,resp){

     try {

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

       let user = await User.findById(req.params.id);

       return resp.render("update_employee", { user });

     } catch (error) {

       console.log(`Error during update form from admin :  ${error}`);
       resp.redirect("back");

     }
}

// UPDATE SUBMIT SAVE THE UPDATED  EMPLOYEE DATA
module.exports.UpdatedUser = async function(req,resp){

    try {

         if (!req.isAuthenticated() || req.user.isAdmin == false) {
           return resp.redirect("/");
         }

        let user = await User.findById(req.params.id);
       
         user.name=req.body.name;
         user.password=req.body.password;
         user.isAdmin = req.body.admin;

         user.save();

         req.flash("success", "UPDATE DONE...");
        console.log("Employee's details are updated successfully...");

         return resp.redirect("/admin/employeerecords");
     
    }catch(error) {

      console.log(`Error during updating the employee records :  ${error}`);
      resp.redirect("back");

    }
}

// DELETE THE EMPLOYEE DATA FROM ADMIN
module.exports.deleteEmployee = async function(req,resp){

    try{

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

      let id = req.params.id;

      let allusers = await User.find({});

      for(let i=0;i<allusers.length;i++){

        let index = await allusers[i].evaluatebyme.indexOf(id);

        if(index!==-1){
            while(index!=-1){
                  await allusers[i].evaluatebyme.splice(index,1);
                  index = allusers[i].evaluatebyme.indexOf(id);
            }
            await allusers[i].save();
        }

        index = await allusers[i].evaluatefromother.indexOf(id);

        if (index !== -1) {
          while (index != -1) {
            await allusers[i].evaluatebyme.splice(index, 1);
            index = allusers[i].evaluatebyme.indexOf(id);
          }
          await allusers[i].save();
        }

      }

      let reviews = await Review.find({from:id});
      for (let i = 0; i < reviews.length; i++) {
        await Review.findByIdAndDelete(reviews[i].id);
      }

      reviews = await Review.find({ for: id });
      for (let i = 0; i < reviews.length; i++) {
        await Review.findByIdAndDelete(reviews[i].id);
      }

      await User.findByIdAndDelete(id);

      req.flash("error", "DELETE AN EMPLOYEE DONE...");
      console.log("Employee's are deleted successfully...");

      return resp.redirect("/admin/employeerecords");


    }catch(error){

       console.log(`Error during deleting an employee :  ${error}`);
       resp.redirect("back");

    }

}
// MAKE AN EMPLOYEE TO ADMIN
module.exports.makeadmin = async function(req,resp){

    try {

        if (!req.isAuthenticated() || req.user.isAdmin == false) {
            return resp.redirect("/");
        }

        let user = await User.findById(req.body.admin_employee_name);

        if (user.isAdmin == true) {

          req.flash("error", "ALREADY ADMIN POWER ...");
          return resp.redirect("back");
        } else {
          user.isAdmin = true;
          await user.save();
        }

        req.flash("success", "ADMIN POWER TRANSFER DONE...");
        console.log("employee make admin successfully...");
        
        return resp.redirect("back");

    } catch (error) {

      console.log(`Error during making an employee to admin :  ${error}`);
      resp.redirect("back");

    }

}
require("dotenv").config();

// MONGODB CONNECTION THROUGH MONGOOSE MODULE

const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Altas DataBase :: MongoDB");
  } catch (error) {
    console.log(`Error in connecting with Mongodb: ${error}`);
  }
};

module.exports = connectDB;
// IMPORT MODULES
const passport = require('passport');
const LocalStratgey = require('passport-local').Strategy;

// IMPORT THE DATABASES'S COLLECTIONS
const User = require('../models/user');

passport.use( new LocalStratgey(
    {
        usernameField:"email",
        passReqToCallback : true
    },
    function(req,email,password,done){
        
        //find a user and establish identity
        User.findOne({email:email},function(error,user){

            if(error){
                console.log('Error comes in finding user inside the passport');
                return done(error);
            }

            if(!user || user.password != password){

                req.flash("error","Invalid Username or Password")
                console.log('Invalid Username/password');
                return done(null,false);

            }

            return done(null,user);

        })
    }   
    
));

//serializing the user to decide the which key is kept in the cookies
passport.serializeUser(function(user,done){
    done(null,user.id);
})

//deserializing the user from the key in cookies
passport.deserializeUser(function(id,done){

     User.findById(id, function (err, user) {
       if (err) {
         console.log("Error in finding user--> Passport");
         return done(err);
       }

       return done(null, user);
     });
})

//check if the user is authenicated
passport.checkAuthentication = function(req,resp,next){

    //if the user is signed in then pass to request's next function(controller's action)
    if (req.isAuthenticated()) {
      return next();
    }

    return resp.redirect('/users/login');

}

//set the authenicated user for views
passport.setAuthenticatedUser = function (req, resp, next) {
  if (req.isAuthenticated()) {
    resp.locals.user = req.user;
  }
  next();
};





module.exports = passport;
// IMPORT THE DATABASES'S COLLECTIONS
const User = require("../models/user");
const Review = require('../models/review');

// ASSIGN TASK PAGE SENDS WITH ALL EMPLOYEENAME
module.exports.assignTask = async function(req,resp){

    try
    {
        if(!req.isAuthenticated() || req.user.isAdmin == false) {
            return resp.redirect("/");
        }

        let users = await User.find({});
       
        return resp.render("assign_task", {users});
    }
    catch(error){

          console.log(`Error during assign task page :  ${error}`);
          resp.redirect("back");
    }
}

// ON SUBMIT THE ASSIGN TASK 
module.exports.taskassigned = async function(req,resp){

     try {

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }
       
       if(req.body.employee_name === req.body.reviewer_name)
       {
        
        req.flash("error", "TASK ASSIGN YOUSELF NOT ALLOWED");
        return resp.redirect("/admin/assigntask");
       }

       let to_employee = await User.findById(req.body.employee_name);
       let from_employee = await User.findById(req.body.reviewer_name);

       to_employee.evaluatefromother.push(from_employee);
       to_employee.save();

       from_employee.evaluatebyme.push(to_employee);
       from_employee.save();

      req.flash("success", "TASK ASSIGNED DONE...");
      console.log("Task assigned successfully");

      return resp.redirect('back');


     } catch (error) {

       console.log(`Error during assigned task :  ${error}`);
       resp.redirect("back");
     }

}

// SHOW ALL EMPLOYEES RECORDS AND SEND THE ALL EMPLOYEES
module.exports.EmployeeRecords = async function(req,resp){

    try{

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
       }

        let users = await User.find({});

        return resp.render("employee_records", {users});

    } catch (error) {

       console.log(`Error during showing on all employee records :  ${error}`);
       resp.redirect("back");
    }
}

// ADD THE EMPLOYEE FROM ADMIN FORM PAGE
module.exports.AddUser = async function(req,resp){

    try {

      if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
      }

      return resp.render("addUser");

    }catch (error) {

      console.log(`Error during addemployee page from admin :  ${error}`);
      resp.redirect("back");

    }
}

// ADD THE EMPLOYEE FROM ADMIN
module.exports.CreateUser = async function (req, resp) {
  try {

     if (!req.isAuthenticated() || req.user.isAdmin == false) {
       return resp.redirect("/");
     }

    if (req.body.password != req.body.confirmpassword) {

      req.flash("error", "PASSWORD DOESNOT MATCH");
      return resp.redirect("back");

    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const newuser = await User.create({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false,
      });

      await newuser.save();

      if (!newuser) {
        console.log("error in creating new employee");
        return resp.redirect("back");
      }
      
      req.flash("success", "EMPLOYEE ADDED DONE...");
      console.log("Employee added successfully from admin");

      return resp.redirect("/admin/employeerecords");

    } else {

      req.flash("error", "E-MAIL ALREADY ADDED");
      return resp.redirect("back");
    }
  } catch (error) {

    console.log(`Error during creating an employee from admin:  ${error}`);
    resp.redirect("back");
  }
};

// VIEW THE STUDENT FROM ADMIN
module.exports.ViewEmployee = async function(req,resp){

    
     try {
       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

       let user = await User.findById(req.params.id);

       return resp.render("viewEmployee", { user });

     } catch (error) {

       console.log(`Error during view an employee :  ${error}`);
       resp.redirect("back");
     }

}

// EDIT FORM ON EDIT WITH AUTOFILL DATA
module.exports.UpdateReqUser = async function(req,resp){

     try {

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

       let user = await User.findById(req.params.id);

       return resp.render("update_employee", { user });

     } catch (error) {

       console.log(`Error during update form from admin :  ${error}`);
       resp.redirect("back");

     }
}

// UPDATE SUBMIT SAVE THE UPDATED  EMPLOYEE DATA
module.exports.UpdatedUser = async function(req,resp){

    try {

         if (!req.isAuthenticated() || req.user.isAdmin == false) {
           return resp.redirect("/");
         }

        let user = await User.findById(req.params.id);
       
         user.name=req.body.name;
         user.password=req.body.password;
         user.isAdmin = req.body.admin;

         user.save();

         req.flash("success", "UPDATE DONE...");
        console.log("Employee's details are updated successfully...");

         return resp.redirect("/admin/employeerecords");
     
    }catch(error) {

      console.log(`Error during updating the employee records :  ${error}`);
      resp.redirect("back");

    }
}

// DELETE THE EMPLOYEE DATA FROM ADMIN
module.exports.deleteEmployee = async function(req,resp){

    try{

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

      let id = req.params.id;

      let allusers = await User.find({});

      for(let i=0;i<allusers.length;i++){

        let index = await allusers[i].evaluatebyme.indexOf(id);

        if(index!==-1){
            while(index!=-1){
                  await allusers[i].evaluatebyme.splice(index,1);
                  index = allusers[i].evaluatebyme.indexOf(id);
            }
            await allusers[i].save();
        }

        index = await allusers[i].evaluatefromother.indexOf(id);

        if (index !== -1) {
          while (index != -1) {
            await allusers[i].evaluatebyme.splice(index, 1);
            index = allusers[i].evaluatebyme.indexOf(id);
          }
          await allusers[i].save();
        }

      }

      let reviews = await Review.find({from:id});
      for (let i = 0; i < reviews.length; i++) {
        await Review.findByIdAndDelete(reviews[i].id);
      }

      reviews = await Review.find({ for: id });
      for (let i = 0; i < reviews.length; i++) {
        await Review.findByIdAndDelete(reviews[i].id);
      }

      await User.findByIdAndDelete(id);

      req.flash("error", "DELETE AN EMPLOYEE DONE...");
      console.log("Employee's are deleted successfully...");

      return resp.redirect("/admin/employeerecords");


    }catch(error){

       console.log(`Error during deleting an employee :  ${error}`);
       resp.redirect("back");

    }

}
// MAKE AN EMPLOYEE TO ADMIN
module.exports.makeadmin = async function(req,resp){

    try {

        if (!req.isAuthenticated() || req.user.isAdmin == false) {
            return resp.redirect("/");
        }

        let user = await User.findById(req.body.admin_employee_name);

        if (user.isAdmin == true) {

          req.flash("error", "ALREADY ADMIN POWER ...");
          return resp.redirect("back");
        } else {
          user.isAdmin = true;
          await user.save();
        }

        req.flash("success", "ADMIN POWER TRANSFER DONE...");
        console.log("employee make admin successfully...");
        
        return resp.redirect("back");

    } catch (error) {

      console.log(`Error during making an employee to admin :  ${error}`);
      resp.redirect("back");

    }

}
// IMPORT THE DATABSE'S COLLECTIONS
const User = require('../models/user');
const Review = require('../models/review');

// SUBMI THE REVIEW FROM ALL USER(EMPLOYEE / ADMIN )
module.exports.createReview = async function(req,resp){
  
    try {

        if (!req.isAuthenticated()) {
            return resp.redirect("/");
        }

        let to_user = await User.findById(req.params.id);
        let from_user = req.user;
        let feedback = req.body.new_review;

        await Review.create({
          review:feedback,
          from: from_user,
          for: to_user,
        });

        const index = req.user.evaluatebyme.indexOf(req.params.id);
        req.user.evaluatebyme.splice(index, 1);
        req.user.save();

        req.flash("success", "Review Submit");

        return resp.redirect("back");

    }catch (error) {

       console.log(`Error during creating a review  :  ${error}`);
        resp.redirect("back");

    }

}

// REVIEW DASHBAORD REVIEW'S DATA
module.exports.reviewdata = async function(req,resp){

  try {

    if (!req.isAuthenticated() || req.user.isAdmin == false) {
      return resp.redirect("/");
    }

    let allreview = await Review.find({});

    allreviewdata = [];

    for (let r of allreview) {
      let fromuser = await User.findById(r.from._id);
      let foruser = await User.findById(r.for._id);
      let review = r.review;

      let data = {
        fromemailid: fromuser.email,
        foremailid: foruser.email,
        feedback: review,
        id: r._id,
      };

      allreviewdata.push(data);
    }
  
    return resp.render("review_records", { allreviewdata });

  } catch (error) {
    
    console.log(`Error during fetching all review from review dashbaord :  ${error}`);
    resp.redirect("back");

  }
}

// VIEW THE REVIEW WITH AUTOFILL
module.exports.viewdata = async function(req,resp){

    try {

      if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
      }

      let reviewdata = await Review.findById(req.params.id);
      let fromuser = await User.findById(reviewdata.from._id);
      let foruser = await User.findById(reviewdata.for._id);
      let review = reviewdata.review;

      let data = {
        fromemail: fromuser.email,
        foremail: foruser.email,
        feedback: review,
      };

      return resp.render("review_view", { data });

    } catch (error) {
      
      console.log(`Error during view a review from review dashbaord :  ${error}`);
      resp.redirect("back");
    }
     
}

// EDIT THE REVIEW WITH AUTOFILL
module.exports.editReview = async function(req,resp){

    try {

      if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
      }

      let reviewdata = await Review.findById(req.params.id);
      let fromuser = await User.findById(reviewdata.from._id);
      let foruser = await User.findById(reviewdata.for._id);
      let review = reviewdata.review;
      let rid = req.params.id;

      let data = {
        fromemail: fromuser.email,
        foremail: foruser.email,
        feedback: review,
      };

      
      return resp.render("updatereview", { data,rid});

    } catch (error) {

      console.log(`Error during update a review page from review dashbaord :  ${error}`);
      resp.redirect("back");

    }
}

// UPDATE THE EDITED REVIEW 
module.exports.updateReview = async function(req,resp){

    try{

        if (!req.isAuthenticated() || req.user.isAdmin == false) {
          return resp.redirect("/");
        }

        let updatedreviewdata = await Review.findById(req.params.id);

        updatedreviewdata.review = req.body.feedback;
        updatedreviewdata.save();

        req.flash("success", "UPDATE REVIEW DONE...");
        return resp.redirect('/review/reviewdata')


    }catch(error){

        console.log(`Error during updating a review from review dashbaord :  ${error}`);
        resp.redirect("back");

    }

}

// ADD REVIEW FROM REVIEW DASHBAORD (ONLY FOR ADMIN)
module.exports.addReview = async function(req,resp){

     try {

       if (!req.isAuthenticated() || req.user.isAdmin == false) {
         return resp.redirect("/");
       }

        let users = await User.find({});
        let loggeduser=req.user.email;

       return resp.render('addreview',{loggeduser,users})
       
     } catch (error) {

      console.log(`Error during adding a review form page from review dashbaord :  ${error}`);
       resp.redirect("back");

     }
}

// ADDED REVIEW FROM REVIEW DASHBAORD (ONLY FOR ADMIN)
module.exports.addReviewfromadmin = async function(req,resp){

    try {
      if (!req.isAuthenticated() || req.user.isAdmin == false) {
        return resp.redirect("/");
      }

      let reviewdetails = await User.findById(req.body.reviewer_name);

      if(req.body.from_email === reviewdetails.email){
          return resp.redirect("/");
      }else{
           let newreview = await Review.create({
             review: req.body.new_added_feedback,
             from: req.user,
             for: reviewdetails,
           });

           reviewdetails.evaluatefromother.push(newreview._id);

           reviewdetails.save();
           newreview.save();
           
          req.flash("success", "ADMIN CREATE REVIEW FOR USER...");
      }
      return resp.redirect("/review/reviewdata");

    } catch (error) {

      console.log(`Error during adding a review from review dashbaord :  ${error}`);
      resp.redirect("back");
    }
}
// IMPORT THE DATABASE'S COLLECTIONS
const User = require('../models/user');
const Review = require('../models/review');

// HOMEPAGE AFTER LOGIN
module.exports.home = async function(req,resp){

    
    if (!req.isAuthenticated()) {
        return resp.redirect("/users/login");
    }

    let user = await User.findById(req.user._id);
    let to_review=[];

     for (let i = 0; i < user.evaluatebyme.length; i++) {
       let data = await User.findById(user.evaluatebyme[i]);
       to_review.push(data);
     }
    

     let all_review = await Review.find({
       for:req.user._id,
      });
     let my_review=[];


     for (let i = 0; i < all_review.length; i++) {
       let reviewername = await User.findById(all_review[i].from);
       let data = {
         reviewer_name: reviewername.name,
         review: all_review[i].review,
         lastupdate:all_review[i].updatedAt,
       };

       my_review.push(data);
     }

    return resp.render("home",{to_review,my_review});
}

// SIGIN PAGE
module.exports.login = function(req,resp){

    if (!req.isAuthenticated()) {
        return resp.render("sigin");
    }

    return resp.redirect('/');
}

// SIGIN UP
module.exports.signup = function(req,resp){

    if (!req.isAuthenticated()) {
        return resp.render("signup");
    }

     return resp.redirect("/");
}

// CREATE USER FROM SIGNUP PAGE
module.exports.CreateUser = async function(req,resp){

    try{

        if(req.body.password != req.body.confirmpassword){
            req.flash("error", "Password doesn't match..Renter..");
            return resp.redirect('back');
        }

        const user = await User.findOne({email:req.body.email});

        if (!user) {
          const newuser = await User.create({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            isAdmin: false,
          });
          await newuser.save();

          if (!newuser) {
            console.log("error in creating new user");
            return resp.redirect("back");
          }
          return resp.redirect("/users/login");
        }
        else{
          req.flash("error", "E-Mail ID Already present");
          return resp.redirect("back");
        }
    }catch(error){
         console.log(`Error during submit the sigup form:  ${error}`);
        resp.redirect('back');
    }
    
}

// SESSION IS CREATE AFTER SUCCESSFULLY LOGIN
module.exports.CreateSession = function(req,resp)
{ 
    req.flash("success", "Yayy !!! Logged In Successfully");
    return resp.redirect("/");
}

// SIGNOUT
module.exports.signout = function (req, res) {

  req.flash("success", "Ooops !!! Logged Out Successfully");
  req.logout();
  return res.redirect("/");

};
// REVIEW DATABASE WITH REVIEW , FROM , FOR FIELDS OR STORING ALL THE REVIEWS
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review',ReviewSchema);
module.exports =Review;
// EMPLOYEES DATABSE (ADMIN + EMPLOYEES) WITH NAME,EMAIL,PASSWORD,ADMIN OR NOT FIELDS

const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  evaluatebyme: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    }],
  evaluatefromother: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
},
{
    timestamps:true
});

const Employee = mongoose.model('Employee',EmployeeSchema);
module.exports = Employee;

// IMPORT THE MODULES
const express = require("express");
const passport = require("passport");
const router = express.Router();

// IMPORT THE ADMIN CONTROLLER
const AdminController = require('../controllers/AdminController');

// ROUTES for /admin/assigntask
router.get("/assigntask", passport.checkAuthentication,AdminController.assignTask);

// ROUTES for /admin/taskassigned
router.post("/taskassigned",passport.checkAuthentication,AdminController.taskassigned);

// ROUTES for /admin/employeerecords
router.get("/employeerecords",passport.checkAuthentication,AdminController.EmployeeRecords);

// ROUTES for /admin/adduser
router.get("/adduser",passport.checkAuthentication,AdminController.AddUser);

// ROUTES for /adminupdate/<id>
router.get("/update/:id", passport.checkAuthentication, AdminController.UpdateReqUser);

// ROUTES for /admin/UpdatedUser/<id>
router.post("/UpdatedUser/:id",passport.checkAuthentication, AdminController.UpdatedUser);

// ROUTES for /admin/create_user
router.post("/create_user",passport.checkAuthentication, AdminController.CreateUser);

// ROUTES for /admin/view/<id>
router.get("/view/:id",passport.checkAuthentication, AdminController.ViewEmployee);

// ROUTES for /admin/delete/<id>
router.get("/delete/:id", passport.checkAuthentication, AdminController.deleteEmployee);

// ROUTES for /admin/makeadmin
router.post("/makeadmin",passport.checkAuthentication, AdminController.makeadmin);

module.exports = router;

// IMPORT THE MODULES
const express = require('express');
const router = express.Router();

console.log("Router files is loading..........")

// IMPORT THE USER CONTROLLERS
const UserController = require('../controllers/UserController');

// ROUTES FOR HOMEPAGE
router.get('/',UserController.home);

// ROUTES FOR /users
router.use("/users", require("./user"));

// ROUTES for /admin
router.use("/admin",require('./admin'));

// ROUTES FOR /review
router.use("/review",require('./review'));

module.exports = router;

// IMPORT THE MODULES
const express = require("express");
const passport = require("passport");
const router = express.Router();


// IMPORT THE REVIEW CONTROLLERS
const ReviewController = require('../controllers/ReviewController');

// ROUTES FOR /review/create_review/<id>
router.post("/create_review/:id", passport.checkAuthentication,ReviewController.createReview);

// ROUTES FOR /review/reviewdata
router.get("/reviewdata",passport.checkAuthentication,ReviewController.reviewdata);

// ROUTES FOR /review/edit/<id>
router.get("/edit/:id",passport.checkAuthentication, ReviewController.editReview);

// ROUTES FOR /review/view/<id>
router.get("/view/:id",passport.checkAuthentication, ReviewController.viewdata);

// ROUTES FOR /review/updatedreview/<id>
router.post('/updatedreview/:id',passport.checkAuthentication, ReviewController.updateReview)

// ROUTES FOR /review/addreview
router.get('/addreview',passport.checkAuthentication, ReviewController.addReview);

// ROUTES FOR /review/addReviewfromadmin
router.post("/addReviewfromadmin",passport.checkAuthentication,ReviewController.addReviewfromadmin);



module.exports = router;

// IMPORT THE MODULES
const express = require("express");
const passport = require("passport");
const router = express.Router();

// IMPORT THE USER CONTROLLERS
const UserController = require("../controllers/UserController");

// ROUTES FOR /users/login
router.get("/login", UserController.login);

// ROUTES FOR /users/SignUp
router.get("/SignUp", UserController.signup);

// ROUTES FOR /users/SignOut
router.get("/SignOut", passport.checkAuthentication, UserController.signout);

// ROUTES FOR /users/create
router.post("/create", UserController.CreateUser);

//use passport as a middleware for authenication
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/users/login" }),
  UserController.CreateSession
);

module.exports = router;

