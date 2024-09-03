const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");

exports.subscribed = (Model) =>
  asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const documentId = req.params.id;
    try {
      const paidUsersDocument = await Model.findOne({ _id: documentId }).select(
        "paidUsers"
      );
      if (req.user.role !== "user") {
        return next();
      }
      if (
        paidUsersDocument &&
        paidUsersDocument.paidUsers &&
        paidUsersDocument.paidUsers
          .map((user) => user.toString())
          .includes(userId)
      ) {
        next();
      } else {
        return next(new ApiError(`This user is not subscribed `, 401));
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);

      return next(new ApiError(`Error checking subscription status.`, 500));
    }
  });
