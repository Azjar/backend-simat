const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./Routes/auth");
const protectedRoutes = require("./Routes/protected");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",  // alamat Vite (default)
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
    res.send("Backend berjalan!");
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));


app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);
