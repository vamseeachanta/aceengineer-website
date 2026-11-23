/**
 * dynacard-engine tests.
 *
 * The load-bearing contract is the round trip: a card generated for a mode must
 * screen back to that mode's own signature. That is a SELF-CONSISTENCY check on
 * synthetic exemplars — it says the geometry the generators draw is the geometry
 * the feature extractor reads. It is emphatically NOT a field-accuracy measure,
 * and no test here should ever be quoted as one.
 */

const dyn = require('../../assets/js/dynacard-engine');

// Holdout draws. Deliberately disjoint from the engine's REFERENCE_SEEDS block:
// screening the reference set against itself would prove nothing.
const SEEDS = [1, 7, 42, 101, 2026];

// Two modes whose signature the screen can genuinely lose, and why. Both are
// faults whose only mark on the card is small and local, sitting on an
// otherwise normal body:
//
//   PARAFFIN_RESTRICTION  shallow dents on a normal-looking card
//   DELAYED_TV_CLOSURE    a short delay window alters only the very bottom of
//                         the upstroke
//
// They are named here rather than tolerated silently, because they are the
// limit the published pages state.
const LOSSY_MODES = ['PARAFFIN_RESTRICTION', 'DELAYED_TV_CLOSURE'];
const ROBUST_MODES = () => require('../../assets/js/dynacard-engine')
  .MODES.filter(m => !LOSSY_MODES.includes(m));

describe('reference signatures', () => {
  test('there are 20 failure modes and a generator for each', () => {
    expect(dyn.MODES).toHaveLength(20);
    for (const mode of dyn.MODES) {
      const card = dyn.generateCard(mode, null);
      expect(card.position).toHaveLength(dyn.NUM_POINTS);
      expect(card.load).toHaveLength(dyn.NUM_POINTS);
      expect(card.mode).toBe(mode);
    }
  });

  test('the canonical card for a mode is deterministic', () => {
    const a = dyn.generateCard('FLUID_POUND', null);
    const b = dyn.generateCard('FLUID_POUND', null);
    expect(a.load).toEqual(b.load);
    expect(a.position).toEqual(b.position);
  });

  test('a seeded card is reproducible and differs from the canonical one', () => {
    const a = dyn.generateCard('GAS_INTERFERENCE', 7);
    const b = dyn.generateCard('GAS_INTERFERENCE', 7);
    const canonical = dyn.generateCard('GAS_INTERFERENCE', null);
    expect(a.load).toEqual(b.load);
    expect(a.load).not.toEqual(canonical.load);
  });

  test('retired mode names resolve to their replacements', () => {
    expect(dyn.resolveMode('PUMP_TAGGING')).toBe('PUMP_TAGGING_UP');
    expect(dyn.resolveMode('fluid_pound')).toBe('FLUID_POUND');
  });

  test('an unknown mode throws rather than returning an empty card', () => {
    expect(() => dyn.generateCard('NOT_A_MODE', null)).toThrow(/unknown dynacard failure mode/);
  });
});

describe('pump fillage', () => {
  // The correction that matters: fillage is net/gross PLUNGER travel. Feeding a
  // longer stroke (as a surface card would) must not silently produce the same
  // answer — the whole point is that the two strokes are different lengths.
  test('is computed from the plunger stroke and lands in 0..100', () => {
    for (const mode of dyn.MODES) {
      const card = dyn.generateCard(mode, null);
      const f = dyn.pumpFillage(card.position, card.load);
      expect(f.fillage).toBeGreaterThanOrEqual(0);
      expect(f.fillage).toBeLessThanOrEqual(100);
      expect(f.grossStroke).toBeCloseTo(
        Math.max(...card.position) - Math.min(...card.position), 6,
      );
      expect(f.netStroke).toBeLessThanOrEqual(f.grossStroke + 1e-9);
    }
  });

  test('a starved pump reads lower fillage than a full one', () => {
    const normal = dyn.generateCard('NORMAL', null);
    const pound = dyn.generateCard('FLUID_POUND', null);
    const normalFill = dyn.pumpFillage(normal.position, normal.load).fillage;
    const poundFill = dyn.pumpFillage(pound.position, pound.load).fillage;
    expect(poundFill).toBeLessThan(normalFill);
  });

  test('a degenerate (zero-stroke) card reports zero rather than dividing by zero', () => {
    const flat = { position: new Array(20).fill(5), load: new Array(20).fill(1000) };
    const f = dyn.pumpFillage(flat.position, flat.load);
    expect(f.fillage).toBe(0);
    expect(Number.isFinite(f.fillage)).toBe(true);
  });
});

describe('feature extraction', () => {
  test('every feature is finite for every reference signature', () => {
    for (const mode of dyn.MODES) {
      const card = dyn.generateCard(mode, null);
      const f = dyn.extractFeatures(card.position, card.load);
      for (const [key, value] of Object.entries(f)) {
        expect(`${mode}.${key} finite`).toBe(
          Number.isFinite(value) ? `${mode}.${key} finite` : `${mode}.${key} = ${value}`,
        );
      }
    }
  });

  test('gas interference sheds load over a wider window than fluid pound', () => {
    // The code's own discriminator: fluid pound collapses in under a fifth of
    // the stroke, gas interference takes better than 0.4 of it.
    const gi = dyn.generateCard('GAS_INTERFERENCE', null);
    const fp = dyn.generateCard('FLUID_POUND', null);
    const giWidth = dyn.extractFeatures(gi.position, gi.load).transferWidth;
    const fpWidth = dyn.extractFeatures(fp.position, fp.load).transferWidth;
    expect(giWidth).toBeGreaterThan(fpWidth);
  });

  test('a parted rod string collapses load range against mean load', () => {
    const parted = dyn.generateCard('ROD_PARTING', null);
    const normal = dyn.generateCard('NORMAL', null);
    const partedRatio = dyn.extractFeatures(parted.position, parted.load).loadRangeRatio;
    const normalRatio = dyn.extractFeatures(normal.position, normal.load).loadRangeRatio;
    expect(partedRatio).toBeLessThan(0.5);
    expect(normalRatio).toBeGreaterThan(1.0);
    // ...yet it is still a proper card loop, not a collapsed line.
    expect(dyn.extractFeatures(parted.position, parted.load).fillRatio)
      .toBeGreaterThan(0.4);
  });

  test('tagging up peaks at the top of the stroke, tagging down bottoms at the bottom', () => {
    const up = dyn.generateCard('PUMP_TAGGING_UP', null);
    const down = dyn.generateCard('PUMP_TAGGING_DOWN', null);
    expect(dyn.extractFeatures(up.position, up.load).posAtMaxLoad).toBeGreaterThan(0.8);
    expect(dyn.extractFeatures(down.position, down.load).posAtMinLoad).toBeLessThan(0.2);
  });

  test('vibration is periodic where sand abrasion is not', () => {
    const vib = dyn.generateCard('EXCESSIVE_VIBRATION', null);
    const sand = dyn.generateCard('SAND_ABRASION', null);
    const vibP = dyn.extractFeatures(vib.position, vib.load).periodicity;
    const sandP = dyn.extractFeatures(sand.position, sand.load).periodicity;
    expect(vibP).toBeGreaterThan(sandP);
  });

  test('the three stroke-length modes are separated only by absolute stroke', () => {
    // Normalised shape features cannot tell these apart — under projections
    // alone they are the same vector. The screen therefore needs the card in
    // real units, which is a limit worth publishing rather than hiding.
    const undertravel = dyn.generateCard('PLUNGER_UNDERTRAVEL', null);
    const under = dyn.extractFeatures(undertravel.position, undertravel.load);
    const normal = dyn.generateCard('NORMAL', null);
    const tubing = dyn.generateCard('TUBING_MOVEMENT', null);
    const normalF = dyn.extractFeatures(normal.position, normal.load);
    const tubingF = dyn.extractFeatures(tubing.position, tubing.load);
    expect(under.strokeLength).toBeLessThan(normalF.strokeLength);
    expect(tubingF.strokeLength).toBeGreaterThan(normalF.strokeLength);
  });
});

describe('nearest-signature screen', () => {
  test('a reference card ranks its own signature first', () => {
    const misses = [];
    for (const mode of dyn.MODES) {
      const card = dyn.generateCard(mode, null);
      const top = dyn.shortlist(card.position, card.load, 1)[0];
      if (top.mode !== mode) misses.push([mode, top.mode]);
    }
    expect(misses).toEqual([]);
  });

  test('a perturbed card keeps its own signature on the shortlist', () => {
    const misses = [];
    for (const mode of ROBUST_MODES()) {
      for (const seed of SEEDS) {
        const card = dyn.generateCard(mode, seed);
        const top3 = dyn.shortlist(card.position, card.load, 3).map(r => r.mode);
        if (!top3.includes(mode)) misses.push([mode, seed, top3]);
      }
    }
    expect(misses).toEqual([]);
  });

  test('the modes the screen can lose are exactly the two documented ones', () => {
    // A characterisation test, not a tolerance. If a third mode starts falling
    // off the shortlist, that is a regression the published limits no longer
    // describe, and this fails until one or the other is fixed.
    const lossy = new Set();
    for (const mode of dyn.MODES) {
      for (let seed = 1; seed <= 60; seed += 1) {
        const card = dyn.generateCard(mode, seed);
        const top3 = dyn.shortlist(card.position, card.load, 3).map(r => r.mode);
        if (!top3.includes(mode)) lossy.add(mode);
      }
    }
    expect([...lossy].sort()).toEqual([...LOSSY_MODES].sort());
  });

  test('the ranking covers every mode, sorted by distance, best first', () => {
    const card = dyn.generateCard('NORMAL', null);
    const { ranking } = dyn.screenCard(card.position, card.load);
    expect(ranking).toHaveLength(dyn.MODES.length);
    expect(new Set(ranking.map(r => r.mode)).size).toBe(dyn.MODES.length);
    for (let i = 1; i < ranking.length; i += 1) {
      expect(ranking[i].distance).toBeGreaterThanOrEqual(ranking[i - 1].distance);
    }
  });

  test('every ranked signature names the features that agree and disagree', () => {
    const card = dyn.generateCard('WORN_BARREL', null);
    const { ranking, features } = dyn.screenCard(card.position, card.load);
    expect(Number.isFinite(features.fillage)).toBe(true);
    for (const row of ranking) {
      expect(row.agrees).toHaveLength(3);
      expect(row.disagrees).toHaveLength(3);
      for (const d of [...row.agrees, ...row.disagrees]) {
        expect(typeof d.label).toBe('string');
        expect(Number.isFinite(d.contribution)).toBe(true);
      }
      // The nearest feature must not be further than the furthest one.
      expect(row.agrees[0].contribution).toBeLessThanOrEqual(row.disagrees[0].contribution);
    }
  });

  test('scoring is deterministic across calls', () => {
    const card = dyn.generateCard('SAND_ABRASION', 3);
    const a = dyn.screenCard(card.position, card.load).ranking.map(r => r.mode);
    const b = dyn.screenCard(card.position, card.load).ranking.map(r => r.mode);
    expect(a).toEqual(b);
  });
});
