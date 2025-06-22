// 這行不需要，因為我們會用 -r dotenv/config 來載入
// require('dotenv').config(); 

console.log('Attempting to read GOOGLE_CLIENT_ID...');
console.log('GOOGLE_CLIENT_ID from process.env:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET from process.env:', process.env.GOOGLE_CLIENT_SECRET);

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('GOOGLE_CLIENT_ID was loaded successfully!');
} else {
  console.log('ERROR: GOOGLE_CLIENT_ID was NOT loaded.');
}
