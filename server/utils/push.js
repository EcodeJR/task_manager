const webpush = require('web-push');

// Generate your VAPID keys only once and store them securely!
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:admin@yourdomain.com',
  publicVapidKey,
  privateVapidKey
);

module.exports = webpush;
