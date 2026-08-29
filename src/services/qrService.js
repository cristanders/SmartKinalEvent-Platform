/**
 * QR Code Service
 * Generates badge QR code data URLs and validates scanned verification codes.
 */

const QRCode = require('qrcode');

class QRService {
  /**
   * Generates a Data URL image representation of a QR code string.
   * @param {string} text - Payload to encode in QR
   * @returns {Promise<string>} Base64 Data URL
   */
  async generateQRCodeDataURL(text) {
    if (!text || typeof text !== 'string') {
      throw new Error("Invalid text payload for QR code generation");
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      return dataUrl;
    } catch (err) {
      throw new Error(`Failed to generate QR code: ${err.message}`);
    }
  }

  /**
   * Validates format of scanned QR code string.
   * @param {string} code 
   * @returns {boolean}
   */
  isValidFormat(code) {
    if (!code || typeof code !== 'string') return false;
    // Expected format: SKEP-<id>-<hash> or user ID
    return code.startsWith('SKEP-') || code.startsWith('usr-');
  }
}

module.exports = new QRService();
