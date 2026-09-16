const User = require("./user.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { FOLDERS, uploadImage, destroyMedia } = require("../../utils/storage");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return response.success(res, "Profile fetched successfully", { user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return response.error(res, "User not found", 404);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = { ...user.address, ...address };

  await user.save();

  return response.success(res, "Profile updated successfully", { user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return response.error(res, "Current and new password are required", 400);
  }

  if (newPassword.length < 6) {
    return response.error(res, "New password must be at least 6 characters", 400);
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return response.error(res, "Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  return response.success(res, "Password changed successfully");
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return response.error(res, "No image file uploaded", 400);
  }

  const user = await User.findById(req.user._id).select("+profileImagePublicId");

  const previousPublicId = user.profileImagePublicId;

  const uploaded = await uploadImage(req.file, FOLDERS.profile);

  user.profileImage = uploaded.url;
  user.profileImagePublicId = uploaded.publicId;
  await user.save();

  if (previousPublicId) {
    await destroyMedia(previousPublicId, "image");
  }

  return response.success(res, "Profile image uploaded successfully", {
    profileImage: user.profileImage,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
};
