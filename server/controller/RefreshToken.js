const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not available" });
    }
    const user = await Users.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user) {
      return res.status(403).json({ message: "Token is not valid" });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Token is not valid" });
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
        res.json({ accessToken: accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

module.exports = refreshToken;
