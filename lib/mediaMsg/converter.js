import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { PassThrough } from 'stream';
import { downloadContentFromMessage } from '@seaavey/baileys';

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert a video buffer to an audio buffer.
 * 
 * @param {Buffer} inputBuffer - The buffer of the input video.
 * @param {string} outputFormat - The format of the output audio (e.g., 'mp3').
 * @returns {Promise<Buffer>}
 */

const convertVideoToAudioBuffer = (inputBuffer, outputFormat = 'mp3') => {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const outputStream = new PassThrough();
    const chunks = [];

    outputStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    outputStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    ffmpeg(inputStream)
      .outputFormat(outputFormat)
      .on('error', (err) => {
        reject(err);
      })
      .pipe(outputStream, { end: true });
  });
};
const getMedia = async (msg) => {
  try {
    const messageType = Object.keys(msg?.message)[0];
    const stream = await downloadContentFromMessage(msg.message[messageType], messageType.replace('Message', ''));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (error) {
    throw new Error('Failed to download media: ' + error.message);
  }
};
export async function tomp3(sock, m, chatUpdate) {
  try {
    const videoMessage = chatUpdate.messages[0].message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    if (videoMessage?.caption === 'tomp3') {
      const mediaData = await getMedia(m);
      if (!mediaData) {
        console.error('Media data not found');
        await sock.sendMessage(m.key.remoteJid, { text: 'Media data not found' });
        return;
      }

      try {

        let audio = await convertVideoToAudioBuffer(mediaData, 'mp3');
        await sock.sendMessage(m.key.remoteJid, { audio: audio });
      } catch (error) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Error converting to MP3: ' + error.message });
        console.error('Error converting to PDF:', error);
      }
    }
  } catch (error) {
    console.error('Error in convertBuffer function:', error);
    await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred: ' + error.message });
  }
}