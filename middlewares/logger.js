const fs = require('fs');
const path = require('path');

exports.logger = (req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs/access.log'), log);
  next();
};
