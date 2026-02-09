import { isValidUrl, safeOpenUrl } from '../security';

describe('security utilities', () => {
  describe('isValidUrl', () => {
    it('should accept valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should accept valid https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject javascript: protocol', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject data: protocol', () => {
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should reject file: protocol', () => {
      expect(isValidUrl('file:///etc/passwd')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidUrl(null as any)).toBe(false);
      expect(isValidUrl(undefined as any)).toBe(false);
      expect(isValidUrl(123 as any)).toBe(false);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
    });
  });

  describe('safeOpenUrl', () => {
    let windowOpenSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should open valid URLs', () => {
      const result = safeOpenUrl('https://example.com');
      expect(result).toBe(true);
      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com', '_self');
    });

    it('should use custom target when provided', () => {
      safeOpenUrl('https://example.com', '_blank');
      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('should block invalid URLs', () => {
      const result = safeOpenUrl('javascript:alert(1)');
      expect(result).toBe(false);
      expect(windowOpenSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Blocked attempt to open invalid URL:',
        'javascript:alert(1)'
      );
    });

    it('should block data URLs', () => {
      const result = safeOpenUrl('data:text/html,<script>alert(1)</script>');
      expect(result).toBe(false);
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });
});
