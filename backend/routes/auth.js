const router =
  require("express").Router();

const User =
  require("../models/User");

const bcrypt =
  require("bcrypt");

const jwt =
  require("jsonwebtoken");


// signup

router.post(
  "/signup",
  async (req, res) => {

    const { email, password } =
      req.body;

    const hash =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({

        email,

        password: hash,

      });

    res.json(user);

  }
);


// login

router.post(
  "/login",
  async (req, res) => {

    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user)
      return res.json({
        error: "no user",
      });

    const ok =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!ok)
      return res.json({
        error: "wrong",
      });

    const token =
      jwt.sign(
        { id: user._id },
        "secret"
      );

    res.json({
      token,
      userId: user._id,
    });

  }
);

module.exports = router;