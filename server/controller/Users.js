const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id_user", "name", "email", "createdAt", "updatedAt"],
    });
    res.status(200).json({
      message: "Get all user success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    console.log("Error di password");
    return res
      .status(400)
      .json({ message: "Password and confirm password is not match" });
  }
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await Users.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    res.json({
      message: "Register Success!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email,
      },
    });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }
    const id_user = user.id_user;
    const name = user.name;
    const email = user.email;

    const accessToken = jwt.sign(
      { id_user, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      { id_user, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id_user: id_user,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ accessToken: accessToken, message: "Login Success" });
  } catch (error) {
    res.status(404).json({ message: "User Doesn't Exist" });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  const user = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  // console.log(user[0].id_user, "ini id >>>>>>>>>>>>>>>");
  // kalau findall maka perlu user[0].id_user karena data dalamarray diangggap leboh dari satu, tapi jika findone maka cukup user.id_user
  if (!user) {
    return res.sendStatus(204);
  }
  const id_user = user.id_user;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id_user: id_user,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logout success" });
};

module.exports = {
  getUsers,
  register,
  login,
  logout,
};
