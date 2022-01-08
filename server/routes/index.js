const userController = require("../controllers").users;
const { protect } = require("../middleware/authMiddleware.js");
const express = require("express");
const router = express.Router();

// app.post("/api/todos", todosController.create);
// app.get("/api/todos", todosController.list);
// app.post("/api/todos/:todoId/items", todoItemsController.create);
// app.get("/api/todos/:todoId", todosController.retrieve);
// app.put("/api/todos/:todoId", todosController.update);
// app.delete("/api/todos/:todoId", todosController.destroy);
//my routes
// app.post("/api/v1/users", userController.registerUser);
// app.get("/api/v1/users/:id", userController.getUserList);
// app.post("/api/v1/users/login", userController.loginUser);
// app.post("/api/v1/users/blacklist", userController.addUserToBlackList);

// user routes
router.route("/users").post(userController.registerUser);
router.route("/users/login").post(userController.loginUser);
router.route("/users/:id").get(protect, userController.getUserList);
router.route("/users/blacklist").post(userController.addUserToBlackList);
router.route("/users/token").post(userController.generateNewToken);
module.exports = router;
