console.log("SERVER FILE LOADED!");

require("dotenv").config()
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./Routes/auth");
const protectedRoutes = require("./Routes/protected");

const app = express();

app.listen(3000, () => console.log("SERVER LISTENING!!"));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
    res.send("Backend berjalan!");
});

// REGISTER ROUTES 
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);


// LISTEN
app.listen(3000, () =>
    console.log("Server berjalan di http://localhost:3000")
);
