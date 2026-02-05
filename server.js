console.log("SERVER FILE LOADED!");

require("dotenv").config()
const express = require("express");
const cors = require("cors");
const path = require("path");   
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/Routes/auth");
const protectedRoutes = require("./src/Routes/protected");
const allureRoutes = require("./src/Routes/allureRoutes");
const jenkinsRoutes = require("./src/Routes/jenkinsRoutes");
const groupTestcaseRoutes = require("./src/Routes/groupCaseRoutes");
const defectRoutes = require("./src/Routes/defectRoutes");
const taskManagementRoutes = require("./src/Routes/taskManagementRoutes");
const actionRoutes = require("./src/Routes/actionRoutes");

const app = express();

app.set("trust proxy", 1);


const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-simat.vercel.app",
  "https://frontend-simat-15mrj9khb-iamdeepshys-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.options("/*", cors());


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// test route
app.get("/", (req, res) => {
    res.send("Backend berjalan!");
});

// REGISTER ROUTES 
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api", allureRoutes);
app.use("/api", jenkinsRoutes);
app.use("/api", groupTestcaseRoutes);
app.use("/api", defectRoutes);
app.use("/api", taskManagementRoutes);
app.use("/screenshots", express.static(path.join(__dirname, "screenshots")));
app.use("/api", actionRoutes);

// LISTEN
app.listen(3000, () =>
    console.log("Server berjalan di http://localhost:3000")
);
