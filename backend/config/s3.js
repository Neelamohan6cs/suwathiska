let cachedClient = null;
let cachedSdk = null;

const loadSdk = () => {
  if (cachedSdk) return cachedSdk;

  try {
    cachedSdk = require("@aws-sdk/client-s3");
  } catch {
    throw new Error(
      "S3 storage selected but @aws-sdk/client-s3 is not installed. Run: npm install @aws-sdk/client-s3"
    );
  }

  return cachedSdk;
};

const s3Client = () => {
  if (cachedClient) return cachedClient;

  const { S3Client } = loadSdk();

  cachedClient = new S3Client({
    region: process.env.S3_REGION,
    ...(process.env.S3_ENDPOINT && {
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    }),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  return cachedClient;
};

module.exports = {
  s3Client,
  get PutObjectCommand() {
    return loadSdk().PutObjectCommand;
  },
  get DeleteObjectCommand() {
    return loadSdk().DeleteObjectCommand;
  },
};
