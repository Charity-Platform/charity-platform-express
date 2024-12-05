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

exports.saveSingleFile = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const fileName = `${Date.now()}-${slugify(req.file.originalname)}`;

    await uploadToS3(req.file.buffer, fileName, "pdfs", req.file.mimetype);

    // Create the full URL
    const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/files/${fileName}`;

    // Save the full path to req.body.file
    req.body.resume = fileUrl;
  }

  next();
});

async function uploadToS3(buffer, fileName, folder, contentType) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${folder}/${fileName}`,
    Body: buffer,
    ACL: "public-read",
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));
}
