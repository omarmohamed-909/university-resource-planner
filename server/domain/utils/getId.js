function getId(value, _depth = 0) {
  if (!value || _depth > 3) return null;
  if (typeof value === 'string') return value;
  
  // ObjectId رسمي (mongoose/bson)
  if (typeof value.toHexString === 'function') return value.toHexString();
  
  // Mongoose Document أو plain object
  if (typeof value._id !== 'undefined') return getId(value._id, _depth + 1);
  
  // آخر حل: toString() — يشتغل مع ObjectId كـ fallback
  const str = value.toString();
  // تحقق إنها مش "[object Object]"
  return (str && str !== '[object Object]') ? str : null;
}


module.exports = getId;
