const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(logger("dev"));

const indexRoutes = require("./server/routes/index");
//connecting DB
// connectDB();

app.get("/", (req, res) => {
  res.send("API is running....");
});
// Require our routes into the application.
// require("./server/routes")(app);
app.use("/api/v1", indexRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running  on port ${PORT}`));
// module.exports = app;
