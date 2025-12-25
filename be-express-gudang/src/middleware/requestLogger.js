export const requestLogger = (req, res, next) => {
  console.log('\n=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('Cookies:', req.cookies);
  console.log('========================\n');
  
  next();
};

export const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log('\n=== RESPONSE DEBUG ===');
    console.log('Status:', res.statusCode);
    console.log('Data:', data);
    console.log('=========================\n');
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log('\n=== RESPONSE DEBUG ===');
    console.log('Status:', res.statusCode);
    console.log('JSON Data:', JSON.stringify(data, null, 2));
    console.log('=========================\n');
    return originalJson.call(this, data);
  };
  
  next();
};