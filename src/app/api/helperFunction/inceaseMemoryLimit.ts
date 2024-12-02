import fs from 'fs';
import http from 'http';
import { pipeline } from 'stream';

/**
 * Function to send data using streams and pipes
 * @param {string} filePath - Path to the file to be sent
 * @param {string} url - The URL to send data to
 * @param {Function} callback - Callback to handle success or errors
 */
export function sendData(
  filePath: string,
  url: string,
  callback: (err: Error | null) => void,
) {
  const fileStream = fs.createReadStream(filePath, {
    highWaterMark: 2 * 1024 * 1024,
  }); // 2MB chunk size
  const request = http.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
  });

  request.on('response', (response) => {
    console.log(`Server responded with status code: ${response.statusCode}`);
  });

  pipeline(fileStream, request, (err) => {
    if (err) {
      console.error('Error sending data:', err);
      callback(err);
    } else {
      console.log('Data sent successfully');
      callback(null);
    }
  });
}

/**
 * Function to receive data using streams and pipes
 * @param {string} url - The URL to fetch data from
 * @param {string} outputFilePath - Path to save the received file
 * @param {(err: Error | null) => void} callback - Callback to handle success or errors
 */
export function receiveData(
  url: string,
  outputFilePath: string,
  callback: (err: Error | null) => void,
) {
  const fileStream = fs.createWriteStream(outputFilePath, { flags: 'w' });

  const request = http.get(url, (response) => {
    if (response.statusCode !== 200) {
      const err = new Error(
        `Failed to fetch data. Status code: ${response.statusCode}`,
      );
      console.error(err.message);
      callback(err);
      return;
    }
    console.log('Receiving data...');
    pipeline(response, fileStream, (err) => {
      if (err) {
        console.error('Error receiving data:', err);
        callback(err);
      } else {
        console.log('Data received successfully');
        callback(null);
      }
    });
  });

  request.on('error', (err) => {
    console.error('HTTP request error:', err);
    callback(err);
  });
}

// // Example usage
// const filePathToSend = 'path/to/your/input-file.txt';
// const sendUrl = 'http://example.com/upload'; // Replace with your server URL
