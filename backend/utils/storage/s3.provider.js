const path = require("path");
const crypto = require("crypto");

const { s3Client, PutObjectCommand, DeleteObjectCommand } = require("../../config/s3");

const buildKey = (file, folder) => {
  const prefix = (process.env.S3_FOLDER || "dairyfeed").replace(/^\/|\/$/g, "");
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  return `${prefix}/${folder}/${unique}${path.extname(file.originalname || "")}`;
};

const buildUrl = (key) => {
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
};

const save = async (file, folder, resourceType) => {
  const key = buildKey(file, folder);

  await s3Client().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    url: buildUrl(key),
    publicId: key,
    duration: 0,
    thumbnail: "",
  };
};

const remove = async (publicId) => {
  try {
    await s3Client().send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: publicId,
      })
    );
    return { result: "ok" };
  } catch (error) {
    console.error("S3 delete failed:", error.message);
    return null;
  }
};

module.exports = { name: "s3", save, remove };
