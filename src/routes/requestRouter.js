const express = require('express');
const mongoose = require('mongoose');
const { isLoggedIn } = require("../middlewares/auth");
const { User } = require("../models/usermodel");
const { ConnectionRequest } = require("../models/connectionRequest");

const requestRouter = express.Router();


// Send connection request

// ensure that 
// divy cannot send the request once again to gulshan
/// gulshan cannot send the request oagain to divy
requestRouter.post("/request/send/:status/:toUserID", isLoggedIn, async (req, res) => {
  try {
    const { status, toUserID } = req.params;
    const fromUserID = req.user.id;

    const AllowedFields = ["ignore", "interested"];
    if (!AllowedFields.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    if (fromUserID === toUserID) {
      return res.status(400).send("You cannot send request to yourself");
    }

    // Check if toUserID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(toUserID)) {
      return res.status(400).send("Invalid toUserID");
    }

    // Check user exists
    const userExists = await User.findById(toUserID);
    if (!userExists) {
      return res.status(400).send("User does not exist");
    }

    // Check existing connection request either way
    const relation = await ConnectionRequest.findOne({
      $or: [
        { fromUserID, toUserID },
        { fromUserID: toUserID, toUserID: fromUserID }
      ]
    });

    if (relation) {
      if (relation.status === status) {
        return res.send("Connection request already has this status");
      } else {
        relation.status = status;
        await relation.save();
        return res.send("Connection request status updated");
      }
    }

    // Create new connection request
    const newRequest = new ConnectionRequest({
      fromUserID,
      toUserID,
      status,
    });

    const savedRequest = await newRequest.save();
    return res.status(200).json(savedRequest);

  } catch (error) {
    return res.status(500).send("Cannot send the request: " + error.message);
  }
});


// Review connection request (accept/reject)
// akhsya => elon
// elon should be logged in touserid
// status should be interested
requestRouter.post("/request/review/:status/:requestId", isLoggedIn, async (req, res) => {
  try {
    const rawRequestId = req.params.requestId || "";
    const requestId = decodeURIComponent(rawRequestId).trim();
    const status = req.params.status?.trim();
    const userId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).send("Invalid request ID");
    }

    // Allowed statuses for review
    const AllowedStatus = ['accepted', 'rejected'];
    if (!AllowedStatus.includes(status)) {
      return res.status(400).send("Invalid review status");
    }

    // Find the pending request addressed to the logged-in user
    const request = await ConnectionRequest.findOne({
      _id: new mongoose.Types.ObjectId(requestId), // ✅ use _id instead of fromUserID
      toUserID: new mongoose.Types.ObjectId(userId),
      status: "interested"
    });

    if (!request) {
      return res.status(404).send("No matching pending request found or you are not authorized.");
    }

    // Update status
    request.status = status;
    await request.save();

    return res.status(200).json({
      message: `Request successfully marked as '${status}'`,
      request
    });

  } catch (error) {
    return res.status(500).send("Internal server error while reviewing request");
  }
});


module.exports = {
  requestRouter
};










//// authrouter contains login signup and logout 
/// profilerouter contains view edit and passowrd change
/// 

