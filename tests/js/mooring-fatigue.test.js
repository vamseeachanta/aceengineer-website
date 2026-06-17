/**
 * TDD tests for Mooring Line Fatigue Calculator engine.
 *
 * Verifies the DNV-OS-E301 T-N curve screen:
 *   - Nominal chain area (two bars)
 *   - Nominal stress range (kN, mm -> MPa)
 *   - Cycles to failure N = a_D * S^(-m)
 *   - Annual damage, fatigue life, pass/fail
 *   - Studless vs studlink curve parameters
 *   - Edge cases: zero tension range, safety factor effect
 *
 * @jest-environment node
 */

const {
  CHAIN_PROPS,
  nominalArea,
  nominalStressRange,
  cyclesToFailure,
  mooringFatigue,
} = require('../../assets/js/mooring-fatigue-engine');

// -------------------------------------------------------------------
// nominalArea  — A = 2 * (pi/4 * d^2)
// -------------------------------------------------------------------
describe('nominalArea', () => {
  test('d=100mm -> 2 * pi/4 * 100^2 = 15707.96 mm^2', () => {
    // 2 * (pi/4) * 10000 = pi/2 * 10000 = 15707.963
    expect(nominalArea(100)).toBeCloseTo(15707.963, 2);
  });

  test('area scales with d^2', () => {
    expect(nominalArea(200) / nominalArea(100)).toBeCloseTo(4, 6);
  });
});

// -------------------------------------------------------------------
// nominalStressRange  — S = (deltaT[kN]*1000) / area[mm^2]
// -------------------------------------------------------------------
describe('nominalStressRange', () => {
  test('deltaT=1000 kN, d=100 mm -> 63.662 MPa', () => {
    // S = 1,000,000 N / 15707.963 mm^2 = 63.6620 MPa
    expect(nominalStressRange(1000, 100)).toBeCloseTo(63.662, 2);
  });

  test('stress range is linear in tension range', () => {
    expect(nominalStressRange(2000, 100)).toBeCloseTo(2 * nominalStressRange(1000, 100), 6);
  });
});

// -------------------------------------------------------------------
// cyclesToFailure  — N = a_D * S^(-m)
// -------------------------------------------------------------------
describe('cyclesToFailure', () => {
  test('studless: N = 6.0e10 * S^-3 at S=100 MPa = 6.0e4', () => {
    // 6.0e10 * 100^-3 = 6.0e10 / 1e6 = 6.0e4
    expect(cyclesToFailure(100, 'studless')).toBeCloseTo(6.0e4, 1);
  });

  test('studlink has double the studless life (a_D 1.2e11 vs 6.0e10)', () => {
    expect(cyclesToFailure(100, 'studlink')).toBeCloseTo(2 * cyclesToFailure(100, 'studless'), 1);
  });

  test('zero stress range returns Infinity', () => {
    expect(cyclesToFailure(0, 'studless')).toBe(Infinity);
  });

  test('curve parameters match DNV-OS-E301', () => {
    expect(CHAIN_PROPS.studless).toMatchObject({ m: 3.0, a_D: 6.0e10 });
    expect(CHAIN_PROPS.studlink).toMatchObject({ m: 3.0, a_D: 1.2e11 });
  });
});

// -------------------------------------------------------------------
// mooringFatigue  — full screen (hand-checkable)
// -------------------------------------------------------------------
describe('mooringFatigue', () => {
  // Hand-check, studless d=100mm, deltaT=1000kN:
  //   area = 15707.963 mm^2
  //   S    = 1e6 / 15707.963 = 63.6620 MPa
  //   N    = 6.0e10 * 63.6620^-3 = 6.0e10 / 257971.6 = 232,584 cycles
  //   With 50,000 cycles/yr: annualDamage = 50000/232584 = 0.214978
  //   fatigueLife = 1/0.214978 = 4.6516 yr
  const base = {
    chainType: 'studless',
    d_mm: 100,
    tensionRange_kN: 1000,
    cyclesPerYear: 50000,
    designLife_yr: 20,
    safetyFactor: 1.0,
  };

  test('stress range and area match hand calc', () => {
    const r = mooringFatigue(base);
    expect(r.area_mm2).toBeCloseTo(15707.963, 2);
    expect(r.stressRange_MPa).toBeCloseTo(63.662, 2);
  });

  test('cycles to failure matches a_D * S^-m', () => {
    const r = mooringFatigue(base);
    const expectedN = 6.0e10 * Math.pow(63.6620, -3);
    expect(r.N).toBeCloseTo(expectedN, -1); // ~232,584 cycles
  });

  test('annual damage = cyclesPerYear / N and life = 1/damage', () => {
    const r = mooringFatigue(base);
    expect(r.annualDamage).toBeCloseTo(base.cyclesPerYear / r.N, 8);
    expect(r.fatigueLife_yr).toBeCloseTo(1 / r.annualDamage, 4);
    // ~4.65 yr -> fails a 20 yr design life
    expect(r.fatigueLife_yr).toBeCloseTo(4.6516, 2);
    expect(r.is_passing).toBe(false);
  });

  test('low tension range gives long life and passes', () => {
    // deltaT=200kN -> S=12.732 MPa -> N=6e10/2063.6=2.908e7 cycles
    // 50000/yr -> life ~ 581 yr -> passes 20 yr
    const r = mooringFatigue({ ...base, tensionRange_kN: 200 });
    expect(r.is_passing).toBe(true);
    expect(r.fatigueLife_yr).toBeGreaterThan(100);
  });

  test('safety factor on damage shortens reported life proportionally', () => {
    const r1 = mooringFatigue({ ...base, safetyFactor: 1.0 });
    const r3 = mooringFatigue({ ...base, safetyFactor: 3.0 });
    expect(r3.fatigueLife_yr).toBeCloseTo(r1.fatigueLife_yr / 3, 4);
  });

  test('studlink doubles fatigue life vs studless for same loading', () => {
    const sl = mooringFatigue({ ...base, chainType: 'studless' });
    const lk = mooringFatigue({ ...base, chainType: 'studlink' });
    expect(lk.fatigueLife_yr).toBeCloseTo(2 * sl.fatigueLife_yr, 4);
  });

  test('zero tension range yields infinite life and passes', () => {
    const r = mooringFatigue({ ...base, tensionRange_kN: 0 });
    expect(r.N).toBe(Infinity);
    expect(r.annualDamage).toBe(0);
    expect(r.fatigueLife_yr).toBe(Infinity);
    expect(r.is_passing).toBe(true);
  });
});
