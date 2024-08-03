export const config = {
  port: process.env.PORT || 8000,

  // bcrypt
  saltRounds: process.env.SALT_ROUNDS,

  // jwt
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,

  // cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
