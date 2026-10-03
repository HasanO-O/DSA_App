/**
 * DSA diagram templates (spec §10).
 *
 * Each template returns plain Excalidraw elements that the workspace splices into
 * the live scene. Templates are *starting points*: everything they produce is
 * freely editable, movable and deletable. Nothing here builds a custom drawing
 * engine — Excalidraw is the canvas.
 *
 * Element shapes are declared locally rather than imported from
 * `@excalidraw/excalidraw/types`, because that package publishes no stable
 * subpath export and its internal types move between releases. We build raw
 * elements and let `convertToExcalidrawElements` fill in the appState-derived
 * defaults before they reach the canvas.
 *
 * Deliberate constraints:
 *  - Element ids are deterministic and unique within a template.
 *  - Coordinates are relative to the origin; the caller centres them.
 *  - Fixed cell sizes so boxes align to a grid on a narrow phone screen.
 */

export type TemplateElementType = 'rectangle' | 'text' | 'arrow';

export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid';
  strokeWidth: number;
  strokeStyle: 'solid';
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId: null;
  index: null;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements: null;
  updated: number;
  link: null;
  locked: boolean;
  roundness: { type: number } | null;

  /** Text elements only. */
  text?: string;
  originalText?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  containerId?: null;

  /** Linear (arrow) elements only. */
  points?: readonly (readonly [number, number])[];
  lastCommittedPoint?: null;
  startBinding?: null;
  endBinding?: null;
  startArrowhead?: null | 'arrow';
  endArrowhead?: null | 'arrow';
  elbowed?: boolean;
}

export type TemplateId =
  | 'array'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'binary-tree'
  | 'graph'
  | 'hash-map'
  | 'pointer';

export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'array', label: 'Array' },
  { id: 'linked-list', label: 'Linked List' },
  { id: 'stack', label: 'Stack' },
  { id: 'queue', label: 'Queue' },
  { id: 'binary-tree', label: 'Tree' },
  { id: 'graph', label: 'Graph' },
  { id: 'hash-map', label: 'Hash Map' },
  { id: 'pointer', label: 'Pointer' },
];

const CELL_W = 88;
const CELL_H = 56;
const GAP = 16;
const FONT = 20;
const SMALL_FONT = 14;
const STROKE = '#1e1e1e';

const now = () => Date.now();

/** Shared element fields, so every shape satisfies the same contract. */
function base(id: string, type: TemplateElementType, x: number, y: number, w: number, h: number, seed: number): TemplateElement {
  return {
    id,
    type,
    x,
    y,
    width: w,
    height: h,
    angle: 0,
    strokeColor: STROKE,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: null,
    roundness: null,
    seed,
    version: 1,
    versionNonce: seed * 7 + 13,
    isDeleted: false,
    boundElements: null,
    updated: now(),
    link: null,
    locked: false,
  };
}

class Builder {
  private counter: number;
  readonly elements: TemplateElement[] = [];

  constructor() {
    // Time-based so two inserts in the same millisecond still differ, while
    // staying deterministic enough for snapshot-style assertions.
    this.counter = now() % 1_000_000;
  }

  private id(prefix: string): { id: string; seed: number } {
    const n = this.counter++;
    return { id: `tmpl-${prefix}-${n}`, seed: n * 1000 + 17 };
  }

  rect(x: number, y: number, w = CELL_W, h = CELL_H) {
    const { id, seed } = this.id('rect');
    this.elements.push(base(id, 'rectangle', x, y, w, h, seed));
  }

  text(value: string, x: number, y: number, fontSize = FONT, width = CELL_W) {
    const { id, seed } = this.id('text');
    this.elements.push({
      ...base(id, 'text', x, y, width, fontSize * 1.25, seed),
      text: value,
      originalText: value,
      fontSize,
      fontFamily: 2,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: null,
      strokeWidth: 1,
    });
  }

  arrow(x: number, y: number, w: number, h = 0, withHead = true) {
    const { id, seed } = this.id('arrow');
    this.elements.push({
      ...base(id, 'arrow', x, y, w, h, seed),
      roundness: { type: 2 },
      points: [
        [0, 0],
        [w, h],
      ],
      lastCommittedPoint: null,
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: withHead ? 'arrow' : null,
      elbowed: false,
    });
  }
}

function arrayElements(values: number[]): TemplateElement[] {
  const b = new Builder();
  const totalW = values.length * CELL_W + (values.length - 1) * GAP;
  let x = -totalW / 2;

  values.forEach((value, index) => {
    b.rect(x, 0);
    b.text(String(value), x, CELL_H / 2 - FONT * 0.62);
    b.text(String(index), x, CELL_H + 8, SMALL_FONT);
    if (index < values.length - 1) b.arrow(x + CELL_W, CELL_H / 2, GAP);
    x += CELL_W + GAP;
  });

  return b.elements;
}

function linkedListElements(values: number[]): TemplateElement[] {
  const b = new Builder();
  const nodeW = CELL_W - 20;
  const step = CELL_W + 24;
  let x = -(values.length * step) / 2;

  b.text('head', x - 52, -CELL_H / 2 - 6, SMALL_FONT, 48);
  b.arrow(x - 4, -8, 40, 8, false);

  values.forEach((value, index) => {
    b.rect(x, 0, nodeW, CELL_H - 8);
    b.text(String(value), x, (CELL_H - 8) / 2 - FONT * 0.62, FONT, nodeW);

    const isLast = index === values.length - 1;
    b.arrow(x + nodeW, CELL_H / 2 - 8, isLast ? 30 : 44, 0);
    if (isLast) b.text('null', x + nodeW + 22, -SMALL_FONT, SMALL_FONT, 48);

    x += step;
  });

  return b.elements;
}

function stackElements(values: number[]): TemplateElement[] {
  const b = new Builder();
  const h = 48;
  const x = -CELL_W / 2;

  values.forEach((value, index) => {
    const y = index * (h + 4);
    b.rect(x, y, CELL_W, h);
    b.text(String(value), x, y + h / 2 - FONT * 0.62);
    // Divider between stacked cells.
    if (index > 0) b.arrow(x, y - 4, CELL_W, 0, false);
  });

  const topY = -(h + 4);
  b.text('top', x + CELL_W + 12, topY + h / 2 - SMALL_FONT, SMALL_FONT, 48);
  b.arrow(x + CELL_W + 6, topY + h / 2, -30, 0);

  return b.elements;
}

function queueElements(values: number[]): TemplateElement[] {
  const b = new Builder();
  const nodeW = CELL_W - 20;
  const totalW = values.length * (nodeW + 4) - 4;
  let x = -totalW / 2;

  values.forEach((value) => {
    b.rect(x, 0, nodeW, CELL_H - 8);
    b.text(String(value), x, (CELL_H - 8) / 2 - FONT * 0.62, FONT, nodeW);
    x += nodeW + 24;
  });

  b.text('front', -totalW / 2 - 62, CELL_H / 2 - SMALL_FONT, SMALL_FONT, 52);
  b.text('rear', totalW / 2 + 12, CELL_H / 2 - SMALL_FONT, SMALL_FONT, 52);

  return b.elements;
}

function binaryTreeElements(): TemplateElement[] {
  const b = new Builder();
  const levelGapY = 84;
  const nodeW = 64;
  const nodeH = 48;
  const maxDepth = 3;

  // Breadth-first so nodes carry heap-style labels (1..15) in level order, and
  // recursion is bounded by depth rather than by value — a value cutoff would
  // silently drop nodes from later levels.
  const nodes: { label: number; x: number; y: number }[] = [];
  const positions = new Map<number, { x: number; y: number }>();
  const build = (label: number, x: number, depth: number): void => {
    positions.set(label, { x, y: depth * levelGapY });
    nodes.push({ label, x, y: depth * levelGapY });
    if (depth === maxDepth) return;
    const childGap = 120;
    build(label * 2, x - childGap, depth + 1);
    build(label * 2 + 1, x + childGap, depth + 1);
  };
  build(1, 0, 0);

  // Edges first, so boxes are painted over the line ends.
  for (const node of nodes) {
    if (node.label === 1) continue;
    const parent = positions.get(Math.floor(node.label / 2));
    if (!parent) continue;
    b.arrow(parent.x, parent.y + nodeH / 2, node.x - parent.x, node.y - parent.y, false);
  }

  for (const node of nodes) {
    b.rect(node.x - nodeW / 2, node.y, nodeW, nodeH);
    b.text(String(node.label), node.x - nodeW / 2, node.y + nodeH / 2 - FONT * 0.55, 18, nodeW);
  }

  return b.elements;
}

function graphElements(): TemplateElement[] {
  const b = new Builder();
  const radius = 130;
  const count = 6;
  const size = 52;

  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      label: String.fromCharCode(65 + index),
    };
  });

  for (let i = 0; i < count; i += 1) {
    const from = points[i]!;
    const to = points[(i + 1) % count]!;
    b.arrow(from.x, from.y, to.x - from.x, to.y - from.y);
  }

  for (const point of points) {
    b.rect(point.x - size / 2, point.y - size / 2, size, size);
    b.text(point.label, point.x - size / 2, point.y - FONT * 0.62, 20, size);
  }

  return b.elements;
}

function hashMapElements(entries: [string, string][]): TemplateElement[] {
  const b = new Builder();
  const w = 120;
  const h = 40;
  const x = -w / 2 - 20;
  let y = -(entries.length * (h + 10)) / 2;

  for (const [key, value] of entries) {
    b.rect(x, y, w, h);
    b.text(`${key} : ${value}`, x, y + h / 2 - FONT * 0.62, 16, w);
    y += h + 10;
  }

  return b.elements;
}

function pointerElements(): TemplateElement[] {
  const b = new Builder();
  const x = -CELL_W / 2;
  b.rect(x, 0);
  b.text('i = 0', x, CELL_H / 2 - FONT * 0.62, 16, CELL_W);
  b.text('↑', x, -CELL_H - 24, 28, CELL_W);
  b.text('ptr', x + 6, -CELL_H - 52, SMALL_FONT, 48);
  return b.elements;
}

/** Builds the elements for one template, centred on the origin. */
export function buildTemplate(id: TemplateId): TemplateElement[] {
  switch (id) {
    case 'array':
      return arrayElements([1, 2, 3, 4, 5]);
    case 'linked-list':
      return linkedListElements([10, 20, 30]);
    case 'stack':
      return stackElements([10, 20, 30]);
    case 'queue':
      return queueElements([10, 20, 30]);
    case 'binary-tree':
      return binaryTreeElements();
    case 'graph':
      return graphElements();
    case 'hash-map':
      return hashMapElements([
        ['3', '0'],
        ['2', '1'],
        ['11', '2'],
      ]);
    case 'pointer':
    default:
      return pointerElements();
  }
}