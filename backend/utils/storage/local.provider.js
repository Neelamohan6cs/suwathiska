const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const buildFileName = (file) => {
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  return unique + path.extname(file.originalname || "");
};

const save = async (file, folder) => {
  const baseUrl = (
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`
  ).replace(/\/$/, "");

  const absoluteDir = path.join(process.cwd(), "uploads", folder);
  await fs.promises.mkdir(absoluteDir, { recursive: true });

  const fileName = buildFileName(file);
  await fs.promises.writeFile(path.join(absoluteDir, fileName), file.buffer);

  const publicPath = `uploads/${folder}/${fileName}`;

  return {
    url: `${baseUrl}/${publicPath}`,
    publicId: publicPath,
    duration: 0,
    thumbnail: "",
  };
};

const remove = async (publicId) => {
  try {
    await fs.promises.unlink(path.join(process.cwd(), publicId));
    return { result: "ok" };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Local file delete failed:", error.message);
    }
    return null;
  }
};

module.exports = { name: "local", save, remove };
