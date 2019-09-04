export default {
  secret: process.env.APP_SECRET,
  config: {
    expiresIn: process.env.EXPIRES_IN,
  },
};
