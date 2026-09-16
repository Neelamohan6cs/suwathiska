const User = require("../user/user.schema");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { notifyAdmins } = require("../../utils/notify");

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, address } = req.body;

  if (!name || !email || !phone || !password) {
    return response.error(res, "Name, email, phone and password are required", 400);
  }

  if (password.length < 6) {
    return response.error(res, "Password must be at least 6 characters", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return response.error(res, "Email is already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    address,
    role: "customer",
    status: "approved",
  });

  await notifyAdmins(
    "New customer registration",
    `${user.name} has registered as a new customer`,
    "account"
  );

  const token = generateToken(user._id, user.role);

  return response.success(
    res,
    "Registration successful",
    { token, user: user.toSafeObject() },
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return response.error(res, "Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return response.error(res, "Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return response.error(res, "Invalid email or password", 401);
  }

  if (user.status === "pending") {
    return response.error(res, "Your account is awaiting admin approval", 403);
  }

  if (user.status === "blocked" || user.status === "rejected") {
    return response.error(res, `Your account has been ${user.status}`, 403);
  }

  const token = generateToken(user._id, user.role);

  return response.success(res, "Login successful", {
    token,
    user: user.toSafeObject(),
  });
});

module.exports = { register, login };
