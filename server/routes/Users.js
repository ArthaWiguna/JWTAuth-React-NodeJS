const express = require("express");
const userController = require("../controller/Users");
const refreshTokenController = require("../controller/RefreshToken");
const verifyToken = require("../middleware/VerifyToken");

const router = express.Router();

router.get("/users", verifyToken, userController.getUsers);
router.post("/users", userController.register);
router.post("/login", userController.login);
router.get("/token", refreshTokenController);
router.delete("/logout", userController.logout);

module.exports = router;
