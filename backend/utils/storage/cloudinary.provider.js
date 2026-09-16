const cloudinary = require("../../config/cloudinary");

const save = (file, folder, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${process.env.CLOUDINARY_FOLDER || "dairyfeed"}/${folder}`,
        resource_type: resourceType,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: Math.round(result.duration || 0),
          thumbnail:
            resourceType === "video"
              ? result.secure_url.replace(/\.[^/.]+$/, ".jpg")
              : "",
        });
      }
    );

    stream.end(file.buffer);
  });

const remove = async (publicId, resourceType) => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    return null;
  }
};

module.exports = { name: "cloudinary", save, remove };
