// Test Google Cloud Vision API with a sample barcode image
const fs = require('fs');

// Create a simple test barcode image (Corona Extra barcode pattern)
const testBarcodeData = `
{
  "requests": [
    {
      "image": {
        "content": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      },
      "features": [
        {
          "type": "TEXT_DETECTION",
          "maxResults": 10
        }
      ]
    }
  ]
}`;

console.log('Testing Google Cloud Vision API...');
console.log('API Key available:', process.env.GOOGLE_CLOUD_API_KEY ? 'Yes' : 'No');