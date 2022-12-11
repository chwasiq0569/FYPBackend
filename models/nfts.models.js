const mongoose = require("mongoose");

const NFT = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        walletAddress: { type: String, required: true }
    }
);

const model = mongoose.model("NFTData", NFT);

module.exports = model;
