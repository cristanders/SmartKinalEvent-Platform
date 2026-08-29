const qrService = require('../../src/services/qrService');

describe('QR Service Unit Tests', () => {

  test('should generate a valid Base64 Data URL for a valid text payload', async () => {
    const text = 'SKEP-usr-101-TEST';
    const dataUrl = await qrService.generateQRCodeDataURL(text);

    expect(dataUrl).toBeDefined();
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test('should throw error when invalid text payload is provided', async () => {
    await expect(qrService.generateQRCodeDataURL(null)).rejects.toThrow();
  });

  test('should validate expected QR code prefix string formats', () => {
    expect(qrService.isValidFormat('SKEP-usr-101-8A7F')).toBe(true);
    expect(qrService.isValidFormat('usr-101')).toBe(true);
    expect(qrService.isValidFormat('INVALID_PREFIX')).toBe(false);
  });
});
