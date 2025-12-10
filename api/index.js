// Vercel serverless function entry point
const mainModule = require('../dist/main');

module.exports = async (req, res) => {
  // Export the default handler from compiled NestJS app
  return mainModule.default(req, res);
};
