import { describe, expect, it } from 'vitest';
import { viewerKeyAction } from './viewer-accessibility';

describe('panoramic keyboard controls', () => {
  it('rotates with each arrow key', () => {
    expect(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].map(viewerKeyAction)).toEqual(['left', 'right', 'up', 'down']);
  });
  it('zooms with plus and minus', () => {
    expect(viewerKeyAction('+')).toBe('zoom-in');
    expect(viewerKeyAction('=')).toBe('zoom-in');
    expect(viewerKeyAction('-')).toBe('zoom-out');
  });
  it('resets with Home or R and toggles rotation with Space', () => {
    expect(viewerKeyAction('Home')).toBe('reset');
    expect(viewerKeyAction('r')).toBe('reset');
    expect(viewerKeyAction(' ')).toBe('toggle');
  });
  it('does not intercept dialog closing or tab navigation', () => {
    expect(viewerKeyAction('Escape')).toBeNull();
    expect(viewerKeyAction('Tab')).toBeNull();
  });
});