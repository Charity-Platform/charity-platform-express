const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_KEY,
  },
  region: process.env.AWS_REGION,
});

exports.saveSingleImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imageName = `${Date.now()}-${slugify(req.file.originalname)}`;

    await uploadToS3(req.file.buffer, imageName, "images");

    req.body.image = imageName;
  }

  next();
});

async function uploadToS3(buffer, fileName, folder) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${folder}/${fileName}`,
    Body: buffer,
    ACL: "public-read",
    ContentType: "image/jpeg",
  };

  await s3Client.send(new PutObjectCommand(params));
}
