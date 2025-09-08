const validator = require("validator");

function validateUserProfile(req, res, next) {
  const { firstName, lastName, email, password, age, photoUrl, gender, skills, about } = req.body;


  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || firstName.trim().length < 2 || firstName.trim().length > 20) {
      return res.status(400).send("First name must be a string between 2 and 20 characters.");
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== 'string' || lastName.trim().length < 2 || lastName.trim().length > 20) {
      return res.status(400).send("Last name must be a string between 2 and 20 characters.");
    }
  }

  if (email !== undefined) {
    if (!validator.isEmail(email)) {
      return res.status(400).send("Invalid email.");
    }
  }

 if (req.body.newPassword !== undefined) {
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passRegex.test(req.body.newPassword)) {
    return res.status(400).send("Password must include uppercase, lowercase, number, and special character, minimum 6 characters.");
  }
}

if (photoUrl !== undefined) {
  if (
    typeof photoUrl !== "string" ||
    !validator.isURL(photoUrl, { require_protocol: true })
  ) {
    return res.status(400).send("Photo URL must be a valid URL with http/https.");
  }
}




  if (age !== undefined) {
    if (typeof age !== 'number' || age < 10) {
      return res.status(400).send("Age must be a number and at least 10.");
    }
  }


  if (gender !== undefined) {
    const allowedGenders = ["male", "female", "other", "Male", "Female", "Other", "MALE", "FEMALE", "OTHER"];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).send("Invalid gender value.");
    }
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every(s => typeof s === "string")) {
      return res.status(400).send("Skills must be an array of strings.");
    }
  }

  if (about !== undefined) {
    if (typeof about !== 'string' || about.trim().length < 9 || about.trim().length > 500) {
      return res.status(400).send("About must be between 9 and 500 characters.");
    }
  }

  // Sab kuch thik ho toh next middleware pe ja
  next();
}

module.exports = validateUserProfile;
