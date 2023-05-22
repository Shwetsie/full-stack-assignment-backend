const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3001;

const secretKey = "23490-wijew-343newr";

const USERS = [
  {
    email: "admin@gmail.com",
    password: "123",
    role: "admin",
  },
];

const QUESTIONS = [
  {
    problemID: 1,
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [
      {
        input: "[1,2,3,4,5]",
        output: "5",
      },
    ],
  },
];

const SUBMISSION = [];

app.use(express.json());

const authenticateToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization;

  console.log("\n\nTOKEN: " + token);

  if (token) {
    // Verify and decode the token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.log("\n\nERROR: " + err);
        // Return an error response if the token is invalid
        return res.status(401).json({ error: "Invalid token" });
      }

      // Token is valid, make the user information available in the request object
      req.user = decoded;
      console.log("\n\nDecoded: " + JSON.stringify(decoded));
      next();
    });
  } else {
    // Return an error response if the token is not provided
    res.status(401).json({ error: "Token not provided" });
  }
};

app.get("/", function (req, res) {
  res.send("Hello!");
});

app.post("/signup", function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const body = req.body;
  const email = body.email;
  const password = body.password;
  //Store email and password (as is for now) in the USERS array above (only if the user with the given email doesnt exist)
  if (!USERS.filter((user) => user.email === email).length > 0) {
    USERS.push({ email: email, password: password, role: "user" });
  }

  // return back 200 status code to the client
  res.status(200);
  res.send(USERS);
});

app.post("/login", function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const body = req.body;
  const email = body.email;
  const password = body.password;

  // Check if the user with the given email exists in the USERS array
  // Also ensure that the password is the same

  const user = USERS.filter(
    (user) => user.email === email && user.password === password
  );

  // If the password is the same, return back 200 status code to the client
  // Also send back a token (any random string will do for now)
  // If the password is not the same, return back 401 status code to the client
  if (user.length === 1) {
    // Generate a token with a one-hour expiration time
    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

    res.status(200);

    // Return the token as a response
    res.json({ token });
  } else {
    res.status(401);
    res.send("Unauthorized");
  }
});

app.get("/questions", authenticateToken, function (req, res) {
  //return the user all the questions in the QUESTIONS array
  res.send(QUESTIONS);
});

app.get("/submissions", authenticateToken, function (req, res) {
  // return the users submissions for this problem
  res.send(SUBMISSION);
});

app.post("/submissions", authenticateToken, function (req, res) {
  // let the user submit a problem, randomly accept or reject the solution
  // Store the submission in the SUBMISSION array above
  const body = req.body;
  SUBMISSION.push(body);

  const result = Math.random() < 50 ? "pass" : "fail";

  res.status(200);
  res.json({
    result: result,
  });
});

// leaving as hard todos
// Create a route that lets an admin add a new problem
// ensure that only admins can do that.
app.post("/problems", authenticateToken, function (req, res) {
  const { email } = req.user;
  const role = USERS.find((user) => user.email === email).role;
  console.log("\n\nEmail: " + email + " Role: " + role);

  if (role === "admin") {
    const problem = req.body;
    QUESTIONS.push({ ...problem, problemID: Math.random() });
    res.status(200).send("Added problem");
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
