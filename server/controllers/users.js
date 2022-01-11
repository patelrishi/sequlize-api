const Users = require("../models").Users;
const RefreshToken = require("../models").refreshToken;
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { generateToken, generateRefreshToken } = require("../utils/JWT");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

module.exports = {
  // Register user
  // access Public
  // route POST /users
  registerUser: asyncHandler(async (req, res) => {
    const { name, email, password, contact } = req.body;

    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await Users.findOne({ where: { email } });
    if (user) {
      res.status(400).send("email address is already taken");
    } else {
      const newUser = await Users.create({
        name: name,
        email: email,
        password: passwordHash,
        contact: contact,
        blackList: "",
      });
      delete newUser.dataValues.password;

      //  attributes: ["id", "name", "email", "contact", "blackList"],
      if (newUser) {
        const accessToken = generateToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);
        res
          .status(201)
          .send({ user: newUser, accessToken, refreshToken, success: true });
      } else {
        res.status(400).send({ message: "something went wrong" });
      }
    }
  }),

  // Register user
  // access Public
  // route POST users/login
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await Users.findOne(
      {
        where: { email },
      },
      { attributes: { exclude: ["password"] } }
    );

    if (user) {
      const ismatch = await bcrypt.compare(password, user.password);
      if (ismatch) {
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        const newRefreshToken = await RefreshToken.create({
          token: refreshToken,
        });

        let obj = {
          user,
          accessToken,
          refreshToken,
          success: true,
        };
        res.status(200).send(obj);
      } else {
        res.status(400).send({ message: "invalid password" });
      }
    } else {
      res.status(400).send({ message: "user not found" });
    }
  }),

  // getUserList
  // access private
  // route Get /users
  getUserList: asyncHandler(async (req, res) => {
    // const userId = req.params.id;
    const { id, startDate, endDate, searchQuery, page } = req.body;

    const startedDate = new Date(startDate);
    const endedDate = new Date(endDate);

    const user = await Users.findOne({ where: { id: id } });
    const DEFAULT_PAGE_SIZE = 5;
    // QUERY

    let whereQuery = {
      id: {
        [Op.notIn]: [...user.blackList.split(","), id],
      },
    };

    if (startDate && endDate) {
      whereQuery["createdAt"] = { [Op.between]: [startedDate, endedDate] };
    }
    if (searchQuery) {
      whereQuery["name"] = {
        [Op.like]: "%" + searchQuery + "%",
      };
    }
    // QUERY

    if (user) {
      userList = await Users.findAndCountAll({
        where: whereQuery,

        offset: DEFAULT_PAGE_SIZE * (parseInt(page ? page : 1) - 1),
        limit: DEFAULT_PAGE_SIZE,
        // order: [["createdAt", "ASC"]],
      });

      if (userList) {
        res.status(200).send({
          users: userList.rows,
          total: userList.count,
          pages: Math.ceil(userList.count / DEFAULT_PAGE_SIZE),
          currentPage: parseInt(page ? page : 1),
          offset: DEFAULT_PAGE_SIZE * (parseInt(page ? page : 1) - 1),
        });
      } else {
        res.status(400).send("something went wrong");
      }
    } else {
      res.status(400).send("user not found");
    }
  }),

  // add useToBlackList
  // access private
  // route POST /users/blacklist
  addUserToBlackList: asyncHandler(async (req, res) => {
    const { id, targetUserId } = req.body;

    const user = await Users.findOne({ where: { id } });
    if (user && targetUserId) {
      let blackList = user.blackList.split(",").map(function (x) {
        return parseInt(x, 10);
      });
      if (blackList.includes(targetUserId)) {
        res.status(400).send("user Already in blacklist");
      } else {
        blackList.push(targetUserId);
      }

      const updatedUser = await user.update({
        blackList: blackList.toString() || user.blackList,
      });
      res.status(200).send({
        message: "user deleted Successfully..!",
        success: true,
      });
    } else {
      res.status(400).send("user not found");
    }
  }),

  generateNewToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const checkToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (checkToken) {
      const decoded = jwt.verify(checkToken.token, process.env.JWT_SECRET);

      if (decoded.id) {
        const token = generateToken(decoded.id);
        res.status(201).send({ accessToken });
      } else {
        res.status(400).send("token expired");
      }
    } else {
      res.status(400).send("no token found");
    }
  }),
};
