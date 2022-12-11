const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.models");
const NFT = require("./models/nfts.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require('stripe')(process.env.SECRET_KEY);
const bodyParser = require('body-parser')

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

const PORT = process.env.PORT || 1337;

mongoose
  .connect(
    `mongodb+srv://chwasiq0569:chwasiq0569@cluster0.mcgaosa.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to Database!");

    // app.listen(PORT, () => {
    //   console.log("SERVER STARTED");
    // });
  })
  .catch((err) => console.log("ERR", err));

app.get("/hello", (req, res) => {
  res.send("check");
});

app.post("/api/register", async (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then(async (user) => {
      if (user) {
        res.status(400).json({
          status: "0",
          message: "User Already Exists",
        });
      } else {
        try {
          const encryptedPassword = await bcrypt.hash(req.body.password, 10);
          console.log("ENCRYPTED_PASSWORD: ", encryptedPassword);
          const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: encryptedPassword,
          });
          console.log("user", user);
          res.status(201).json({
            status: "1",
            user: { name: user?.name, email: user?.email },
          });
        } catch (err) {
          res.json({ status: "0", err: err.message });
        }
      }
    })
    .catch((err) => {
      return res.status(400).json({
        status: "0",
        message: "Something went wrong!!",
      });
    });
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  console.log("USER", user)

  if (user !== null) {
    const isCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log("isCorrectPassword: ", isCorrectPassword);

    if (user && isCorrectPassword) {
      const token = jwt.sign(
        {
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY
      );

      return res.status(200).json({
        status: "1",
        token: token,
      });
    } else {
      return res.status(400).json({
        status: "0",
        message: "Invalid Email or password!",
      });
    }
  } else {
    return res.status(400).json({
      status: "0",
      message: "Invalid Email or password!",
    });
  }
});

app.post("/api/savenft", async (req, res) => {
  console.log(req.body)
  try {
    const nft = await NFT.create({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      walletAddress: req.body.walletAddress
    });
    console.log("nft", nft);
    if (nft) {
      res.status(201).json({
        status: "1",
        nft: { name: nft?.name, description: nft?.description, image: nft?.image, walletAddress: nft?.walletAddress },
      });
    } else {
      res.json({ status: "0", message: "Something went wrong!" });
    }
  } catch (err) {
    res.json({ status: "0", err: err.message });
  }
});


app.get("/api/getmynfts", async (req, res) => {

  console.log('eq.query.walletAddress', req.query.walletAddress)

  try {
    const nfts = await NFT.find({
      walletAddress: req.query.walletAddress,
    });
    if (nfts) {
      return res.status(200).json({
        status: "1",
        nfts: nfts
      });
    } else {
      return res.json({ status: "0", message: "No NFT Found!" });
    }
  } catch (err) {
    res.json({ status: "0", err: err.message });
  }
});

app.post('/payment', async (req, res) => {
  let status, error;
  const { token, amount } = req.body;
  try {
    await Stripe.charges.create({
      source: token.id,
      amount,
      currency: 'usd',
    });
    status = 'success';
  } catch (error) {
    console.log("ERR", error);
    status = 'Failure';
  }
  res.json({ error, status });
});


app.listen(PORT, () => {
  console.log("SERVER STARTED");
});
