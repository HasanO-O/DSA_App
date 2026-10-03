import { describe, expect, it } from 'vitest';
import { buildTemplate, TEMPLATES, type TemplateId } from './templates';

describe('buildTemplate', () => {
  it('produces elements for every declared template', () => {
    for (const template of TEMPLATES) {
      const elements = buildTemplate(template.id);
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  it('produces unique element ids within a template', () => {
    for (const template of TEMPLATES) {
      const ids = buildTemplate(template.id).map((element) => element.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('array template draws one rectangle per element plus arrows and index labels', () => {
    const elements = buildTemplate('array');
    const rectangles = elements.filter((e) => e.type === 'rectangle');
    const arrows = elements.filter((e) => e.type === 'arrow');
    // 5 values -> 5 boxes, 4 connecting arrows, 5 value labels, 5 index labels.
    expect(rectangles).toHaveLength(5);
    expect(arrows).toHaveLength(4);
    expect(elements.filter((e) => e.type === 'text')).toHaveLength(10);
  });

  it('linked-list template ends with a null terminator', () => {
    const texts = buildTemplate('linked-list')
      .filter((e) => e.type === 'text')
      .map((e) => (e as unknown as { text: string }).text);
    expect(texts).toContain('head');
    expect(texts).toContain('null');
  });

  it('stack template labels the top', () => {
    const texts = buildTemplate('stack')
      .filter((e) => e.type === 'text')
      .map((e) => (e as unknown as { text: string }).text);
    expect(texts).toContain('top');
  });

  it('binary tree template renders 15 nodes for depth 3', () => {
    const rectangles = buildTemplate('binary-tree').filter((e) => e.type === 'rectangle');
    expect(rectangles).toHaveLength(15);
  });

  it('graph template renders 6 nodes and 6 edges', () => {
    const elements = buildTemplate('graph');
    expect(elements.filter((e) => e.type === 'rectangle')).toHaveLength(6);
    expect(elements.filter((e) => e.type === 'arrow')).toHaveLength(6);
  });

  it('every element is a valid non-deleted shape', () => {
    for (const template of TEMPLATES) {
      for (const element of buildTemplate(template.id as TemplateId)) {
        expect(element.isDeleted).toBe(false);
        expect(typeof element.type).toBe('string');
        expect(Number.isFinite(element.x)).toBe(true);
        expect(Number.isFinite(element.y)).toBe(true);
      }
    }
  });
});