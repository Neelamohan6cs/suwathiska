const STORAGE_DRIVER = (process.env.STORAGE_DRIVER || "local").toLowerCase();
const CLOUD_PROVIDER = (process.env.CLOUD_PROVIDER || "cloudinary").toLowerCase();

const FOLDERS = {
  image: "products/images",
  video: "products/videos",
  profile: "profiles",
};

const CLOUD_PROVIDERS = {
  cloudinary: "./cloudinary.provider",
  s3: "./s3.provider",
};

let provider = null;

const getProvider = () => {
  if (provider) return provider;

  validateConfig();

  provider =
    STORAGE_DRIVER === "local"
      ? require("./local.provider")
      : require(CLOUD_PROVIDERS[CLOUD_PROVIDER]);

  return provider;
};

const validateConfig = () => {
  if (!["local", "cloud"].includes(STORAGE_DRIVER)) {
    throw new Error(`Invalid STORAGE_DRIVER "${STORAGE_DRIVER}". Use "local" or "cloud".`);
  }

  if (STORAGE_DRIVER === "cloud" && !CLOUD_PROVIDERS[CLOUD_PROVIDER]) {
    throw new Error(
      `Invalid CLOUD_PROVIDER "${CLOUD_PROVIDER}". Supported: ${Object.keys(CLOUD_PROVIDERS).join(", ")}.`
    );
  }

  const required = {
    cloudinary: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
    s3: ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"],
  };

  if (STORAGE_DRIVER === "cloud") {
    const missing = required[CLOUD_PROVIDER].filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(
        `CLOUD_PROVIDER="${CLOUD_PROVIDER}" needs these env variables: ${missing.join(", ")}`
      );
    }
  }

  return true;
};

const activeDriver = () => {
  validateConfig();
  return STORAGE_DRIVER === "cloud" ? `cloud:${CLOUD_PROVIDER}` : "local";
};

const uploadImage = async (file, folder = FOLDERS.image) => {
  const result = await getProvider().save(file, folder, "image");
  return { url: result.url, publicId: result.publicId };
};

const uploadVideo = async (file, folder = FOLDERS.video) => {
  const result = await getProvider().save(file, folder, "video");
  return {
    url: result.url,
    publicId: result.publicId,
    duration: result.duration || 0,
    thumbnail: result.thumbnail || "",
  };
};

const destroyMedia = async (publicId, resourceType = "image") => {
  if (!publicId) return null;
  return getProvider().remove(publicId, resourceType);
};

module.exports = {
  STORAGE_DRIVER,
  validateConfig,
  CLOUD_PROVIDER,
  FOLDERS,
  activeDriver,
  uploadImage,
  uploadVideo,
  destroyMedia,
};
