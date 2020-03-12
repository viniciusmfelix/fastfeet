import 'dotenv/config';

export default {
  secret: process.env.AT_SECRET,
  expiresIn: '7d',
};
