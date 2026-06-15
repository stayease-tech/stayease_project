/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { sanitizeNameValue, validateNameValue } from './formValidation';

describe('formValidation', () => {
  it('removes digits and special characters from name input', () => {
    expect(sanitizeNameValue('John2! Doe')).toBe('John Doe');
  });

  it('rejects names that contain unsupported characters', () => {
    expect(validateNameValue('John2')).toBe('Names may only contain letters, spaces, apostrophes, periods, or hyphens.');
  });
});
