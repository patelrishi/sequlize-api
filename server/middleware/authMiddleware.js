const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  // console.log(req.headers);
  if (req.headers.authorization) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded, "decodedddd=------------>");
      // req.user = await User.findById(decoded.id).select("-password");
      // const user = await Users.findOne({ where: { id: decoded.id } });

      // if()
      next();
    } catch (error) {
      console.error(error);
      res.status(401).send({ error: "Invalid token" });
      // throw new Error("token expired");
    }
  }

  if (!token) {
    res.status(401).send({ error: "Not authorized, no token" });
    // throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
