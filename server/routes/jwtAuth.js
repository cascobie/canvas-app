const router = require("express").Router();
const pool = require("../db/db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorize = require("../middleware/authorize")

// Registration

router.post("/register", validInfo, async (req, res) => {
  try {

    // 1. Destructure the req.body (first name, last name, email, password)

    const { first_name, last_name, email, password } = req.body;


    // 2. Check if the user exists (if the user exists, then throw an error)

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (user.rows.length !== 0) {
      return res.status(401).json("user already exists!")
    }

    // 3. Bcrypt the user password

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcrypPassword = await bcrypt.hash(password, salt)


    // 4. Enter the new user inside our database

    const newUser = await pool.query("INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", 
      [first_name, last_name, email, bcrypPassword]
    );

    
    // 5. Generate our jwt token
    
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);
    const loggedInId = newUser.rows[0].user_id
    console.log("register", loggedInId)

    return res.json({ jwtToken, loggedInId });


  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error")
  }
})



// Login

router.post("/login", validInfo, async (req, res) => {
  try {

    // 1. Destructure the req.body

    const { email, password } = req.body;


    // 2. Check if the user doesn't exist. If doesn't exist, then throw error.

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Email or Password is incorrect")
    }


    // 3. Check if incoming password is the same as the database password

    const validPassword = await bcrypt.compare(password, user.rows[0].password)

    const loggedInId = user.rows[0].user_id

    if (!validPassword) {
      return res.status(401).json("Email or Password is incorrect")
    }
  

    // 4. Give them the jwt token

    const jwtToken = jwtGenerator(user.rows[0].user_id);
    
    

    return res.json({ jwtToken, loggedInId });


    
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error")
  }
})


// VERIFICATION

router.get("/verify", authorize, async (req, res) => {
  try {

    res.json(true)

    
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error")
  }
});



module.exports = router;