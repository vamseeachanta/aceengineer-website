/**
 * Dynamometer-card (sucker-rod pump) signature engine.
 *
 * Pure, DOM-free functions shared by:
 *   content/calculators/dynacard-diagnostics.html  (signature screen)
 *   content/demos/dynacard.html                    (worked signature examples)
 *
 * SCOPE AND HONESTY NOTES — read before changing anything here.
 *
 * 1. Every card this module draws or reads is a DOWNHOLE (pump) card. The
 *    failure-mode names describe conditions AT THE PUMP and the shapes are the
 *    shapes those conditions make at the pump. Handing one of these to a
 *    surface-to-downhole solver is a category error: the rod string has already
 *    been taken out of it.
 *
 * 2. Pump fillage is computed as net plunger travel / gross plunger travel on
 *    the PLUNGER stroke. It is never computed on the surface (polished-rod)
 *    stroke — rod stretch and overtravel make the surface stroke a different
 *    length from the plunger stroke, so a surface-stroke fillage is wrong by
 *    the rod-string deflection.
 *
 * 3. `screenCard` is a TRANSPARENT NEAREST-SIGNATURE SCREEN over a published
 *    geometric feature vector. It is NOT a trained classifier, and this module
 *    deliberately reports no accuracy figure of any kind. Ranking a card
 *    against reference signatures says which signature it most resembles; it
 *    does not say the pump has that fault.
 *
 * Geometry, thresholds and the reference-signature parameters are ported from
 * the dynacard module of the digitalmodel package (card_generators,
 * calculations, corners, feature_extraction).
 */

/* eslint-disable no-bitwise */

var NUM_POINTS = 100;

// Half-width, in crank radians, of the window over which fluid load transfers
// between the standing and travelling valves. Transfer is not instantaneous and
// it straddles the stroke turnaround — rod stretch has to be taken up while the
// polished rod is still decelerating — which is why a reference card's corners
// are visibly cut away rather than square.
var TRANSITION_PHASE = 0.85;

// ---------------------------------------------------------------------------
// Deterministic pseudo-random source
// ---------------------------------------------------------------------------

// mulberry32 — small, fast, seedable. Used so every card on the site is
// byte-reproducible from its mode name and seed.
function makeRng(seed) {
  var s = (seed >>> 0) || 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Parameter source for a generator.
 *
 * `deterministic` mode puts every SHAPE parameter at the centre of its range,
 * so the reference signatures are one canonical card per mode rather than one
 * random draw. Texture terms (measurement noise, sand jaggedness) still come
 * from a fixed seed: zeroing them would delete the defining feature of the
 * modes whose signature IS a texture.
 */
function makeParams(seed, choiceIndex) {
  var deterministic = (seed === null || seed === undefined);
  var rand = makeRng(deterministic ? 0 : seed);
  var pick = choiceIndex || 0;
  return {
    deterministic: deterministic,
    // Scalar shape parameter.
    uniform: function (lo, hi) {
      return deterministic ? (lo + hi) / 2 : lo + (hi - lo) * rand();
    },
    integers: function (lo, hi) {
      return deterministic
        ? Math.floor((lo + hi) / 2)
        : lo + Math.floor((hi - lo) * rand());
    },
    // Scalar sign choice. Deterministic draws pick `choiceIndex`, which is how
    // the reference set carries both mirror forms of a fault whose signature
    // can fall either way round (a bent barrel binds at one end of the stroke
    // or the other, and which end depends on the bend).
    choice: function (options) {
      return deterministic
        ? options[pick % options.length]
        : options[Math.floor(rand() * options.length)];
    },
    // Texture: always drawn, deterministic or not.
    normalArray: function (n, sigma) {
      var out = new Array(n);
      for (var i = 0; i < n; i += 1) {
        // Box-Muller.
        var u = Math.max(rand(), 1e-12);
        var v = rand();
        out[i] = sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      }
      return out;
    },
    uniformArray: function (n, lo, hi) {
      var out = new Array(n);
      for (var i = 0; i < n; i += 1) out[i] = lo + (hi - lo) * rand();
      return out;
    },
  };
}

// ---------------------------------------------------------------------------
// Card geometry primitives
// ---------------------------------------------------------------------------

function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

// Hermite 0->1 ramp with zero slope at both ends, clamped outside [0, 1].
function smoothstep(u) {
  var c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Crank angle for one stroke: 0 -> pi is the upstroke, pi -> 2pi the
 * downstroke. The first half of the array is the upstroke and the second half
 * the downstroke — the indexing contract every generator relies on.
 */
function crankPhase(n) {
  var count = n || NUM_POINTS;
  var half = Math.floor(count / 2);
  var theta = [];
  var i;
  for (i = 0; i < half; i += 1) theta.push((Math.PI * i) / (half - 1));
  for (i = 0; i < half; i += 1) theta.push(Math.PI + (Math.PI * i) / (half - 1));
  return theta;
}

// Plunger position as a 0-1 fraction of stroke (simple harmonic motion).
function positionFraction(theta) { return (1 - Math.cos(theta)) / 2; }

function at(x, i) { return Array.isArray(x) ? x[i] : x; }

/**
 * Blend an upstroke and a downstroke load profile across the turnarounds.
 *
 * The blend weight is a smoothstep centred ON each turnaround rather than
 * starting at it, so the load is already part-way transferred when the plunger
 * reverses. That is what rounds a real card's corners.
 */
function blendBranches(theta, upFraction, downFraction, width) {
  var w = width === undefined ? TRANSITION_PHASE : width;
  var out = [];
  for (var i = 0; i < theta.length; i += 1) {
    var wrapped = ((theta[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    var toBottom = wrapped > Math.PI ? wrapped - 2 * Math.PI : wrapped;
    var toTop = wrapped - Math.PI;
    var rising = smoothstep((toBottom + w) / (2 * w));
    var falling = smoothstep((toTop + w) / (2 * w));
    var weightUp = Math.abs(toBottom) <= Math.abs(toTop) ? rising : 1 - falling;
    out.push(weightUp * at(upFraction, i) + (1 - weightUp) * at(downFraction, i));
  }
  return out;
}

/**
 * Base pump card with rounded corners and load noise.
 * Returns { position (inches), load (pounds) }.
 */
function baseCard(p, opts) {
  var o = opts || {};
  var stroke = o.stroke === undefined ? 100 : o.stroke;
  var high = o.high === undefined ? 15000 : o.high;
  var low = o.low === undefined ? 5000 : o.low;
  var noisePct = o.noisePct === undefined ? 0.02 : o.noisePct;
  var up = o.up === undefined ? 1 : o.up;
  var down = o.down === undefined ? 0 : o.down;

  var theta = o.theta || crankPhase(NUM_POINTS);
  var range = high - low;
  var fraction = blendBranches(theta, up, down, o.transition);
  var noise = p.normalArray(theta.length, noisePct * range);

  var position = [];
  var load = [];
  for (var i = 0; i < theta.length; i += 1) {
    position.push((stroke / 2) * (1 - Math.cos(theta[i])));
    load.push(low + range * fraction[i] + noise[i]);
  }
  return { position: position, load: load };
}

/**
 * Downstroke load fraction for a pump that sheds fluid load late.
 *
 * Both gas interference and fluid pound leave the travelling valve shut for
 * part of the downstroke, so the rods keep carrying fluid load well past the
 * top of the stroke and only shed it lower down. That gouges the card's
 * lower-right corner — the single feature that separates either of them from a
 * normal card.
 */
function lateTransferDownstroke(theta, shelf, holdTo, releaseAt) {
  var out = [];
  for (var i = 0; i < theta.length; i += 1) {
    var frac = positionFraction(theta[i]);
    out.push(shelf * smoothstep((frac - releaseAt) / (holdTo - releaseAt)));
  }
  return out;
}

// Unit-height impact spike at one end of the stroke.
function taggingSpike(theta, atTop, widthPhase) {
  var centre = atTop ? Math.PI : 0;
  var out = [];
  for (var i = 0; i < theta.length; i += 1) {
    var d = Math.abs((((theta[i] - centre + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
    var v = clamp(1 - d / widthPhase, 0, 1);
    out.push(v * v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Reference-signature generators — one per failure mode
// ---------------------------------------------------------------------------

var GENERATORS = {
  // Normal operation: clean card, all four corners tight, flat branches.
  NORMAL: function (p) {
    return baseCard(p, {
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.03,
    });
  },

  // Free gas in the barrel has to be compressed back up to discharge pressure
  // before the travelling valve can open, and compression is gradual, so the
  // load bleeds off over a long slanted branch instead of dropping at the top
  // of the stroke. The lower-right corner is rounded away and the lower branch
  // slopes upward with position.
  GAS_INTERFERENCE: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var severity = 0.5;
    var shelf = (0.52 + 0.28 * severity) * p.uniform(0.94, 1.06);
    var holdTo = p.uniform(0.64, 0.76);
    var releaseAt = (0.34 - 0.12 * severity) * p.uniform(0.88, 1.12);
    return baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: p.uniform(10000, 16000),
      low: p.uniform(500, 2500),
      noisePct: 0.015,
      down: lateTransferDownstroke(theta, shelf, holdTo, releaseAt),
    });
  },

  // With the barrel only part filled, the plunger falls through empty space
  // carrying the full fluid load until it slaps the fluid surface; the load
  // then collapses almost vertically. Same gutted lower-right corner as gas
  // interference, but the collapse is abrupt rather than gradual — that width
  // is the whole difference between the two classes.
  FLUID_POUND: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var dropPosition = 0.35;
    var shelf = p.uniform(0.74, 0.82);
    var width = p.uniform(0.15, 0.21);
    var holdTo = dropPosition + width / 2;
    var releaseAt = dropPosition - width / 2;
    // A starved barrel lets fluid slip past the plunger for the whole
    // upstroke, so the top of the card droops slightly as the stroke proceeds.
    var droop = p.uniform(0.10, 0.18);
    var up = theta.map(function (t) {
      return 1 - droop * smoothstep((positionFraction(t) - 0.15) / 0.6);
    });
    return baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.015,
      up: up,
      down: lateTransferDownstroke(theta, shelf, holdTo, releaseAt),
    });
  },

  // The plunger strikes the top of the barrel or the pull tube, so the load
  // spikes at maximum position. While it is jammed there the fluid load has
  // nowhere to go and does not transfer at the turnaround at all; it comes off
  // as the plunger backs away, over the top quarter of the stroke.
  PUMP_TAGGING_UP: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var high = p.uniform(14000, 19000);
    var low = p.uniform(4000, 7000);
    var card = baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: high,
      low: low,
      noisePct: 0.015,
      down: lateTransferDownstroke(theta, p.uniform(0.94, 1.00), 1.0, p.uniform(0.70, 0.78)),
    });
    var spike = p.uniform(0.16, 0.24) * (high - low);
    var shape = taggingSpike(theta, true, 0.30);
    card.load = card.load.map(function (l, i) { return l + spike * shape[i]; });
    return card;
  },

  // The plunger strikes the standing valve or the bottom of the barrel, so the
  // rods go into compression at minimum position and the load dips sharply
  // BELOW the downstroke load line. Mirror of tagging up, and the opposite
  // repair — re-space up rather than down — which is why they are two classes.
  PUMP_TAGGING_DOWN: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var high = p.uniform(14000, 19000);
    var low = p.uniform(4000, 7000);
    var card = baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: high,
      low: low,
      noisePct: 0.015,
      down: lateTransferDownstroke(theta, p.uniform(0.24, 0.34), 1.0, p.uniform(0.70, 0.80)),
    });
    var dip = p.uniform(0.62, 0.78) * (high - low);
    var shape = taggingSpike(theta, false, 0.60);
    card.load = card.load.map(function (l, i) { return l - dip * shape[i]; });
    return card;
  },

  // The pump is spaced so long that the plunger leaves the top of the barrel
  // before the upstroke ends. Fluid load is lost the moment it clears, so the
  // upstroke falls off a cliff mid-stroke and runs flat and low to the top —
  // the top-right corner of the card is missing entirely.
  PLUNGER_OUT_OF_BARREL: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var exitAt = p.uniform(0.46, 0.58);
    var exitWidth = p.uniform(0.18, 0.26);
    var residual = p.uniform(0.16, 0.26);
    var up = theta.map(function (t) {
      return 1 - (1 - residual) * smoothstep((positionFraction(t) - exitAt) / exitWidth);
    });
    return baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.015,
      up: up,
    });
  },

  // Unanchored tubing stretches and contracts with the fluid load, so plunger
  // travel is lost to tubing movement and the card elongates.
  TUBING_MOVEMENT: function (p) {
    var card = baseCard(p, {
      stroke: p.uniform(130, 180),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.03,
    });
    var slope = p.uniform(10, 40);
    var n = card.load.length;
    card.load = card.load.map(function (l, i) { return l + slope * (-1 + (2 * i) / (n - 1)); });
    return card;
  },

  // Fluid bypasses the travelling valve at a rate set by the pressure across
  // it, while the rate the plunger DISPLACES fluid is set by its velocity —
  // which is zero at the turnaround. Near the bottom of the upstroke the leak
  // wins outright and no load develops; the load only builds as the plunger
  // speeds up. Top-left corner rounded away, lower-right stays square.
  VALVE_LEAK_TV: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var leakRate = p.uniform(0.30, 0.55);
    var recoveredBy = p.uniform(0.28, 0.45);
    var up = theta.map(function (t) {
      return 1 - leakRate * (1 - smoothstep(positionFraction(t) / recoveredBy));
    });
    return baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.015,
      up: up,
    });
  },

  // The mirror of a travelling-valve leak. Fluid bypasses the standing valve,
  // so it cannot take the fluid column back off the rods at the top of the
  // stroke; the rods keep carrying part of it until the plunger is moving down
  // fast enough to out-run the leak. Lower-right opens up, the top stays square.
  VALVE_LEAK_SV: function (p) {
    var theta = crankPhase(NUM_POINTS);
    return baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.015,
      down: lateTransferDownstroke(
        theta, p.uniform(0.22, 0.38), p.uniform(0.92, 1.00), p.uniform(0.55, 0.72)
      ),
    });
  },

  // Below the break nothing is lifted, so the surviving string carries only its
  // own buoyant weight plus friction and inertia. That still traces a closed
  // loop. What makes it diagnosable is the SCALE: load range collapses to a
  // fraction of mean load. Absolute load, not shape, is the tell.
  ROD_PARTING: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var meanLoad = p.uniform(1000, 3000);
    var totalRange = p.uniform(0.18, 0.30) * meanLoad;
    var tiltShare = p.uniform(0.30, 0.42);
    var hysteresis = totalRange * (1 - tiltShare);
    var tilt = totalRange * tiltShare;
    var card = baseCard(p, {
      theta: theta,
      stroke: p.uniform(80, 120),
      high: meanLoad + hysteresis / 2,
      low: meanLoad - hysteresis / 2,
      noisePct: 0.02,
    });
    card.load = card.load.map(function (l, i) {
      return l + tilt * (positionFraction(theta[i]) - 0.5);
    });
    return card;
  },

  // Debris, scale or a mechanical obstruction stops the plunger: near-zero
  // position range and a tiny collapsed card.
  STUCK_PUMP: function (p) {
    var n = NUM_POINTS;
    var stroke = p.uniform(2, 10);
    var meanLoad = p.uniform(8000, 15000);
    var amplitude = p.uniform(500, 2000);
    var noise = p.normalArray(n, 200);
    var position = [];
    var load = [];
    for (var i = 0; i < n; i += 1) {
      var t = (2 * Math.PI * i) / (n - 1);
      position.push((stroke / 2) * (1 - Math.cos(t)));
      load.push(meanLoad + amplitude * Math.sin(t) + noise[i]);
    }
    return { position: position, load: load };
  },

  // A worn plunger/barrel fit slips progressively as the fluid column builds,
  // so the upstroke load decays away from the ideal plateau and card area is
  // lost.
  WORN_BARREL: function (p) {
    var high = p.uniform(12000, 18000);
    var low = p.uniform(4000, 7000);
    var card = baseCard(p, {
      stroke: p.uniform(80, 120), high: high, low: low, noisePct: 0.02,
    });
    var n = card.load.length;
    var half = Math.floor(n / 2);
    var decay = p.uniform(0.15, 0.35);
    for (var i = 0; i < half; i += 1) {
      var td = i / (half - 1);
      card.load[i] -= decay * (high - low) * td * td;
    }
    return card;
  },

  // Extreme gas interference: gas trapped in the barrel is compressed and
  // expanded without ever reaching discharge pressure, so the valves never
  // open and the card collapses to a low-load loop.
  GAS_LOCK: function (p) {
    var n = NUM_POINTS;
    var stroke = p.uniform(80, 120);
    var meanLoad = p.uniform(1000, 3000);
    var amplitude = p.uniform(300, 1000);
    var noise = p.normalArray(n, 50);
    var position = [];
    var load = [];
    for (var i = 0; i < n; i += 1) {
      var t = (2 * Math.PI * i) / (n - 1);
      position.push((stroke / 2) * (1 - Math.cos(t)));
      load.push(meanLoad + amplitude * Math.sin(t) + noise[i]);
    }
    return { position: position, load: load };
  },

  // A weak or fouled travelling-valve spring lets the valve close late, so load
  // is picked up on an exponential curve at the very start of the upstroke
  // instead of on the normal ramp.
  DELAYED_TV_CLOSURE: function (p) {
    var high = p.uniform(12000, 18000);
    var low = p.uniform(4000, 7000);
    var card = baseCard(p, {
      stroke: p.uniform(80, 120), high: high, low: low, noisePct: 0.02,
    });
    var delayPoints = p.integers(10, 25);
    for (var i = 0; i < delayPoints; i += 1) {
      var td = i / (delayPoints - 1);
      card.load[i] = low + (high - low) * (1 - Math.exp(-3 * td)) * 0.5;
    }
    return card;
  },

  // Rod-on-tubing drag, a tight stuffing box or a deviated hole: the upstroke
  // carries extra load and the downstroke carries less, opening the loop.
  EXCESSIVE_FRICTION: function (p) {
    var card = baseCard(p, {
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.02,
    });
    var n = card.load.length;
    var half = Math.floor(n / 2);
    var friction = p.uniform(1500, 4000);
    for (var i = 0; i < n; i += 1) card.load[i] += (i < half ? friction : -friction);
    return card;
  },

  // Short net stroke with a truncated position range — the plunger never
  // travels the stroke the surface unit is making.
  PLUNGER_UNDERTRAVEL: function (p) {
    return baseCard(p, {
      stroke: p.uniform(30, 55),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.02,
    });
  },

  // Paraffin deposition narrows the tubing and grabs the rods intermittently:
  // a thin card carrying concave dents plus a raised friction signature.
  PARAFFIN_RESTRICTION: function (p) {
    var card = baseCard(p, {
      stroke: p.uniform(80, 120),
      high: p.uniform(11000, 15000),
      low: p.uniform(5000, 8000),
      noisePct: 0.02,
    });
    var n = card.load.length;
    var numDents = p.integers(2, 5);
    for (var d = 0; d < numDents; d += 1) {
      var centre = p.integers(10, n - 10);
      var width = p.integers(3, 8);
      var depth = p.uniform(1000, 3000);
      for (var j = Math.max(0, centre - width); j < Math.min(n, centre + width); j += 1) {
        card.load[j] -= depth * Math.max(0, 1 - Math.abs(j - centre) / width);
      }
    }
    var half = Math.floor(n / 2);
    var friction = p.uniform(800, 2000);
    for (var i = 0; i < n; i += 1) card.load[i] += (i < half ? 1 : -1) * friction * 0.5;
    return card;
  },

  // A bent barrel binds at one end of the stroke, so load is biased with
  // position and the card's centroid shifts off centre.
  BENT_BARREL: function (p) {
    var card = baseCard(p, {
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.02,
    });
    var minPos = Math.min.apply(null, card.position);
    var maxPos = Math.max.apply(null, card.position);
    var direction = p.choice([-1, 1]);
    var magnitude = p.uniform(1500, 4000);
    card.load = card.load.map(function (l, i) {
      var norm = (card.position[i] - minPos) / (maxPos - minPos + 1e-10);
      return l + direction * magnitude * (norm - 0.5);
    });
    return card;
  },

  // Sand grinds the plunger-barrel clearance open, so the card carries two
  // marks: a jagged load trace from grains passing through the fit, and a
  // slant, because a worn fit slips at a rate that follows the differential
  // across the plunger. The jaggedness is the diagnostic feature.
  SAND_ABRASION: function (p) {
    var theta = crankPhase(NUM_POINTS);
    var high = p.uniform(12000, 18000);
    var low = p.uniform(4000, 7000);
    var card = baseCard(p, {
      theta: theta, stroke: p.uniform(80, 120), high: high, low: low, noisePct: 0.01,
    });
    var slant = p.uniform(0.13, 0.19) * (high - low);
    var jag = p.uniform(0.09, 0.13) * (high - low);
    var grains = p.uniformArray(card.load.length, -jag, jag);
    card.load = card.load.map(function (l, i) {
      return l + slant * (positionFraction(theta[i]) - 0.5) + grains[i];
    });
    return card;
  },

  // Mechanical resonance or imbalance in the unit puts a high-frequency
  // oscillation on top of the card that no pump condition produces.
  EXCESSIVE_VIBRATION: function (p) {
    var card = baseCard(p, {
      stroke: p.uniform(80, 120),
      high: p.uniform(12000, 18000),
      low: p.uniform(4000, 7000),
      noisePct: 0.01,
    });
    var n = card.load.length;
    var freq = p.uniform(6, 12);
    var amplitude = p.uniform(1000, 3000);
    for (var i = 0; i < n; i += 1) {
      card.load[i] += amplitude * Math.sin((2 * Math.PI * freq * i) / (n - 1));
    }
    return card;
  },
};

// Order matters: it is the order the demo page and the shortlist use.
var MODES = [
  'NORMAL',
  'GAS_INTERFERENCE',
  'FLUID_POUND',
  'PUMP_TAGGING_UP',
  'PUMP_TAGGING_DOWN',
  'PLUNGER_OUT_OF_BARREL',
  'TUBING_MOVEMENT',
  'VALVE_LEAK_TV',
  'VALVE_LEAK_SV',
  'ROD_PARTING',
  'STUCK_PUMP',
  'WORN_BARREL',
  'GAS_LOCK',
  'DELAYED_TV_CLOSURE',
  'EXCESSIVE_FRICTION',
  'PLUNGER_UNDERTRAVEL',
  'PARAFFIN_RESTRICTION',
  'BENT_BARREL',
  'SAND_ABRASION',
  'EXCESSIVE_VIBRATION',
];

// `PUMP_TAGGING` was one class covering two opposite mechanisms with opposite
// repairs. It is retired in favour of the two directional classes; the alias is
// kept so stored configs carrying the old name still resolve.
var MODE_ALIASES = { PUMP_TAGGING: 'PUMP_TAGGING_UP', VALVE_LEAK: 'VALVE_LEAK_TV' };

function resolveMode(mode) {
  var key = String(mode || '').toUpperCase();
  return MODE_ALIASES[key] || key;
}

/**
 * Generate one reference pump card.
 * @param {string} mode  failure-mode name (current or retired alias)
 * @param {number|null} seed  null/undefined -> the canonical centre-of-range
 *        card for that mode; an integer -> a perturbed draw
 * @param {number} [choiceIndex]  which branch to take at a two-sided shape
 *        choice, on a deterministic draw (see makeParams)
 */
function generateCard(mode, seed, choiceIndex) {
  var key = resolveMode(mode);
  var gen = GENERATORS[key];
  if (!gen) throw new Error('unknown dynacard failure mode: ' + mode);
  var card = gen(makeParams(seed === undefined ? null : seed, choiceIndex));
  card.mode = key;
  return card;
}

// ---------------------------------------------------------------------------
// Feature extraction
// ---------------------------------------------------------------------------

function minOf(a) { return a.reduce(function (m, v) { return v < m ? v : m; }, Infinity); }
function maxOf(a) { return a.reduce(function (m, v) { return v > m ? v : m; }, -Infinity); }
function meanOf(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }

function percentile(values, q) {
  var s = values.slice().sort(function (a, b) { return a - b; });
  var idx = clamp(q, 0, 1) * (s.length - 1);
  var lo = Math.floor(idx);
  var hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

// Signed area of the closed loop (shoelace), in position x load units — the
// work done per stroke. Taken absolute because traversal direction is not
// guaranteed.
function cardArea(position, load) {
  var n = position.length;
  var sum = 0;
  for (var i = 0; i < n; i += 1) {
    var j = (i + 1) % n;
    sum += position[i] * load[j] - position[j] * load[i];
  }
  return Math.abs(sum / 2);
}

/**
 * Index of the bottom-right corner — where the travelling valve finishes
 * opening on the downstroke. Ported from the corner detector: over the
 * downstroke, maximise (retained stroke - remaining load) in normalised
 * coordinates. It can sit well below maximum position when fillage is
 * incomplete, which is exactly what makes it the fillage corner.
 */
function bottomRightCorner(position, load) {
  var n = position.length;
  var posMin = minOf(position);
  var posSpan = maxOf(position) - posMin;
  var loadMin = minOf(load);
  var loadSpan = maxOf(load) - loadMin;
  if (n < 2 || posSpan <= 0 || loadSpan <= 0) return 0;

  var topIdx = position.indexOf(maxOf(position));
  var bottomIdx = position.lastIndexOf(minOf(position));
  var count = (((bottomIdx - topIdx) % n) + n) % n;
  var best = topIdx;
  var bestScore = -Infinity;
  for (var k = 0; k <= count; k += 1) {
    var idx = (topIdx + k) % n;
    var score = (position[idx] - posMin) / posSpan - (load[idx] - loadMin) / loadSpan;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

/**
 * Pump fillage from the PLUNGER stroke.
 *
 * fillage = net plunger travel / gross plunger travel, where net travel is the
 * position of the bottom-right corner above the bottom of the stroke.
 *
 * The stroke used here is the plunger's, taken from the downhole card. Running
 * this on a surface (polished-rod) card gives a number that is wrong by the rod
 * string's stretch and overtravel, and it is wrong in the unhelpful direction —
 * it flatters a starved pump.
 */
function pumpFillage(position, load) {
  var gross = maxOf(position) - minOf(position);
  var brIdx = bottomRightCorner(position, load);
  var net = position[brIdx] - minOf(position);
  var fillage = gross > 0 ? clamp((net / gross) * 100, 0, 100) : 0;
  return { grossStroke: gross, netStroke: net, fillage: fillage, brIndex: brIdx };
}

// Split the trace into the upstroke (start -> top of stroke) and the downstroke
// (top of stroke -> end), matching the feature extractor's convention.
function branchIndices(position) {
  var n = position.length;
  var peak = position.indexOf(maxOf(position));
  if (peak < 2 || peak >= n - 2) peak = Math.floor(n / 2);
  var up = [];
  var down = [];
  var i;
  for (i = 0; i <= peak; i += 1) up.push(i);
  for (i = peak; i < n; i += 1) down.push(i);
  return { up: up, down: down, peak: peak };
}

// Least-squares slope of normalised load against normalised position over the
// middle of a branch. The turnaround regions are excluded so the slope measures
// the branch itself rather than the corner rounding.
function branchSlope(pn, ln, idx) {
  var xs = [];
  var ys = [];
  for (var k = 0; k < idx.length; k += 1) {
    var i = idx[k];
    if (pn[i] >= 0.15 && pn[i] <= 0.85) { xs.push(pn[i]); ys.push(ln[i]); }
  }
  if (xs.length < 3) return 0;
  var mx = meanOf(xs);
  var my = meanOf(ys);
  var num = 0;
  var den = 0;
  for (var j = 0; j < xs.length; j += 1) {
    num += (xs[j] - mx) * (ys[j] - my);
    den += (xs[j] - mx) * (xs[j] - mx);
  }
  return den > 0 ? num / den : 0;
}

// Clearance between a bounding-box corner and the nearest point on the card,
// as a fraction of the normalised diagonal. A real card's corners are cut away
// by the valve-transfer window; a corner that is GONE (large clearance) or that
// the card actually REACHES (near zero) is the diagnostic signal.
function cornerClearance(pn, ln, cornerP, cornerL) {
  var best = Infinity;
  for (var i = 0; i < pn.length; i += 1) {
    var dp = pn[i] - cornerP;
    var dl = ln[i] - cornerL;
    var d = Math.sqrt(dp * dp + dl * dl);
    if (d < best) best = d;
  }
  return best / Math.SQRT2;
}

/**
 * Width, as a fraction of stroke, of the window over which the downstroke sheds
 * its fluid load. The single feature that separates fluid pound (abrupt, under
 * a fifth of the stroke) from gas interference (gradual, better than 0.4 of it).
 */
function downstrokeTransferWidth(pn, ln, downIdx) {
  var loads = downIdx.map(function (i) { return ln[i]; });
  var hi = maxOf(loads);
  var lo = minOf(loads);
  if (hi - lo < 1e-9) return 1;
  var upper = lo + 0.75 * (hi - lo);
  var lower = lo + 0.25 * (hi - lo);
  var pUpper = null;
  var pLower = null;
  for (var k = 0; k < downIdx.length; k += 1) {
    var i = downIdx[k];
    if (pUpper === null && ln[i] <= upper) pUpper = pn[i];
    if (pLower === null && ln[i] <= lower) pLower = pn[i];
  }
  if (pUpper === null || pLower === null) return 1;
  return clamp(Math.abs(pUpper - pLower), 0, 1);
}

// Residual after a 7-point moving average, and its lag-1 autocorrelation.
// Texture magnitude alone cannot tell sand abrasion from unit vibration: both
// roughen the trace. Vibration is PERIODIC, so its residual autocorrelates
// strongly at lag 1 while sand's grain-by-grain scatter does not.
function textureStats(ln) {
  var n = ln.length;
  var w = 3;
  var residual = [];
  for (var i = 0; i < n; i += 1) {
    var sum = 0;
    var count = 0;
    for (var j = Math.max(0, i - w); j <= Math.min(n - 1, i + w); j += 1) {
      sum += ln[j]; count += 1;
    }
    residual.push(ln[i] - sum / count);
  }
  var rms = Math.sqrt(meanOf(residual.map(function (r) { return r * r; })));
  var num = 0;
  var den = 0;
  for (var k = 0; k < n - 1; k += 1) {
    num += residual[k] * residual[k + 1];
    den += residual[k] * residual[k];
  }
  den += residual[n - 1] * residual[n - 1];
  return { roughness: rms, autocorr: den > 1e-12 ? num / den : 0 };
}

// Count of downward excursions below the local trend deep enough to read as a
// dent rather than noise — the paraffin signature.
function dentCount(ln) {
  var n = ln.length;
  var w = 8;
  var count = 0;
  for (var i = w; i < n - w; i += 1) {
    var window = ln.slice(i - w, i + w + 1);
    var med = percentile(window, 0.5);
    if (med - ln[i] > 0.10
        && ln[i] <= ln[i - 1] && ln[i] <= ln[i + 1]) count += 1;
  }
  return count;
}

/**
 * The published geometric feature vector for a downhole card.
 * Every value is either dimensionless or in the card's own units (inches, lbs).
 */
function extractFeatures(position, load) {
  var posMin = minOf(position);
  var posMax = maxOf(position);
  var loadMin = minOf(load);
  var loadMax = maxOf(load);
  var strokeLength = posMax - posMin;
  var loadRange = loadMax - loadMin;
  var meanLoad = meanOf(load);

  var span = strokeLength > 0 ? strokeLength : 1;
  var lspan = loadRange > 0 ? loadRange : 1;
  var pn = position.map(function (p) { return (p - posMin) / span; });
  var ln = load.map(function (l) { return (l - loadMin) / lspan; });

  var branches = branchIndices(position);
  var texture = textureStats(ln);
  var fill = pumpFillage(position, load);

  return {
    strokeLength: strokeLength,
    loadRange: loadRange,
    meanLoad: meanLoad,
    // Load range as a fraction of mean load. A parted rod string carries only
    // its own buoyant weight, so this collapses; absolute load is the tell.
    loadRangeRatio: meanLoad > 0 ? loadRange / meanLoad : 0,
    // Enclosed area over the bounding box. A full card fills its box; a
    // collapsed or gutted one does not.
    fillRatio: (strokeLength > 0 && loadRange > 0)
      ? cardArea(position, load) / (strokeLength * loadRange) : 0,
    cardArea: cardArea(position, load),
    clearTL: cornerClearance(pn, ln, 0, 1),
    clearTR: cornerClearance(pn, ln, 1, 1),
    clearBL: cornerClearance(pn, ln, 0, 0),
    clearBR: cornerClearance(pn, ln, 1, 0),
    upperSlope: branchSlope(pn, ln, branches.up),
    lowerSlope: branchSlope(pn, ln, branches.down),
    transferWidth: downstrokeTransferWidth(pn, ln, branches.down),
    // Where on the stroke the load extremes fall. Tagging up peaks at the top
    // of the stroke; tagging down bottoms at the bottom of it.
    posAtMaxLoad: pn[ln.indexOf(maxOf(ln))],
    posAtMinLoad: pn[ln.indexOf(minOf(ln))],
    // How far the extremes stand clear of the body of the trace — an impact
    // spike is a distinct peak, not a raised plateau.
    peakiness: 1 - percentile(ln, 0.95),
    dipness: percentile(ln, 0.05),
    roughness: texture.roughness,
    periodicity: texture.autocorr,
    dents: dentCount(ln),
    fillage: fill.fillage,
    grossStroke: fill.grossStroke,
    netStroke: fill.netStroke,
    brIndex: fill.brIndex,
  };
}

// ---------------------------------------------------------------------------
// Nearest-signature screen
// ---------------------------------------------------------------------------

// Features the screen compares on, and how much weight each carries. Weights
// are coarse on purpose: they express which measurements are diagnostic, not a
// fitted model. Anything absent from this list is reported to the reader but
// does not steer the ranking.
var SCREEN_FEATURES = [
  { key: 'clearTL', weight: 1.0, label: 'Top-left corner clearance' },
  { key: 'clearTR', weight: 1.0, label: 'Top-right corner clearance' },
  { key: 'clearBL', weight: 1.0, label: 'Bottom-left corner clearance' },
  { key: 'clearBR', weight: 1.0, label: 'Bottom-right corner clearance' },
  { key: 'fillRatio', weight: 1.0, label: 'Card fill ratio' },
  { key: 'upperSlope', weight: 1.0, label: 'Upstroke branch slope' },
  { key: 'lowerSlope', weight: 1.0, label: 'Downstroke branch slope' },
  { key: 'transferWidth', weight: 1.0, label: 'Downstroke transfer width' },
  { key: 'loadRangeRatio', weight: 1.2, label: 'Load range / mean load' },
  { key: 'strokeLength', weight: 1.2, label: 'Plunger stroke length' },
  { key: 'posAtMaxLoad', weight: 0.8, label: 'Stroke position of peak load' },
  { key: 'posAtMinLoad', weight: 0.8, label: 'Stroke position of minimum load' },
  { key: 'peakiness', weight: 1.0, label: 'Peak load prominence' },
  { key: 'dipness', weight: 1.0, label: 'Minimum load prominence' },
  { key: 'roughness', weight: 1.2, label: 'Trace roughness' },
  { key: 'periodicity', weight: 1.2, label: 'Trace periodicity' },
  { key: 'dents', weight: 0.8, label: 'Concave dent count' },
  { key: 'fillage', weight: 1.0, label: 'Pump fillage (plunger stroke)' },
];

/**
 * How the reference set is built, applied uniformly to every mode: the
 * canonical centre-of-range card, plus three draws that span the generator's
 * parameter ranges. A single canonical card cannot stand in for a signature
 * whose severity, placement or texture is stochastic — a barely-delayed valve
 * closure and a badly-delayed one are the same fault and different shapes.
 *
 * The seed block is deliberately disjoint from the small integers the test
 * suite screens with: a reference set drawn from the holdout would make the
 * round-trip check circular and prove nothing.
 */
var REFERENCE_SEEDS = [null, 1001, 1002, 1003];

/**
 * Modes that additionally carry a mirrored canonical card. A bent barrel binds
 * at one end of the stroke or the other depending on which way it is bent, so
 * its load-versus-position bias runs in either direction — two shapes, one
 * fault, and a single canonical card can only be one of them.
 */
var MIRRORED_MODES = ['BENT_BARREL'];

// Reference signatures, built once: the canonical centre-of-range card for each
// mode plus the standardisation the screen measures distance in.
var _reference = null;

function referenceSignatures() {
  if (_reference) return _reference;
  var rows = [];
  MODES.forEach(function (mode) {
    var variants = REFERENCE_SEEDS.map(function (seed) { return { seed: seed, choice: 0 }; });
    if (MIRRORED_MODES.indexOf(mode) !== -1) variants.push({ seed: null, choice: 1 });
    variants.forEach(function (v, i) {
      var card = generateCard(mode, v.seed, v.choice);
      rows.push({
        mode: mode,
        variant: i,
        card: card,
        features: extractFeatures(card.position, card.load),
      });
    });
  });
  var stats = {};
  SCREEN_FEATURES.forEach(function (f) {
    var values = rows.map(function (r) { return r.features[f.key]; });
    var mu = meanOf(values);
    var variance = meanOf(values.map(function (v) { return (v - mu) * (v - mu); }));
    // Guard a degenerate feature: a zero spread would divide the whole screen
    // by zero rather than simply carrying no information.
    stats[f.key] = { mean: mu, sd: Math.max(Math.sqrt(variance), 1e-9) };
  });
  _reference = { rows: rows, stats: stats };
  return _reference;
}

/**
 * Rank a downhole card against the reference signatures.
 *
 * Returns { features, ranking: [{ mode, variant, distance, agrees, disagrees }] },
 * best first. `agrees` names the three measurements that pulled the card TOWARDS
 * that signature and `disagrees` the three that pushed it away, so the reader can
 * check the match by eye instead of taking it on faith.
 *
 * This is a similarity ranking over card geometry. It is not a trained
 * classifier and carries no accuracy claim: a card can sit closest to a
 * signature and still not be that fault, and two faults can leave the same
 * mark on a card.
 */
function screenCard(position, load) {
  var ref = referenceSignatures();
  var features = extractFeatures(position, load);

  // A mode may carry several reference variants; it is ranked by its closest
  // one, since any variant is that same fault.
  var byMode = {};
  ref.rows.forEach(function (row) {
    var total = 0;
    var perFeature = [];
    SCREEN_FEATURES.forEach(function (f) {
      var s = ref.stats[f.key];
      var z = ((features[f.key] - s.mean) / s.sd) - ((row.features[f.key] - s.mean) / s.sd);
      var contribution = f.weight * z * z;
      total += contribution;
      perFeature.push({
        key: f.key, label: f.label, contribution: contribution,
        value: features[f.key], reference: row.features[f.key],
      });
    });
    perFeature.sort(function (a, b) { return a.contribution - b.contribution; });
    var entry = {
      mode: row.mode,
      variant: row.variant,
      distance: Math.sqrt(total),
      agrees: perFeature.slice(0, 3),
      disagrees: perFeature.slice(-3).reverse(),
    };
    if (!byMode[row.mode] || entry.distance < byMode[row.mode].distance) {
      byMode[row.mode] = entry;
    }
  });

  var ranking = MODES.map(function (m) { return byMode[m]; });
  ranking.sort(function (a, b) { return a.distance - b.distance; });
  return { features: features, ranking: ranking };
}

/** Convenience: the top `n` (default 3) signatures for a card. */
function shortlist(position, load, n) {
  return screenCard(position, load).ranking.slice(0, n || 3);
}

// ---------------------------------------------------------------------------

var API = {
  NUM_POINTS: NUM_POINTS,
  MODES: MODES,
  MODE_ALIASES: MODE_ALIASES,
  SCREEN_FEATURES: SCREEN_FEATURES,
  REFERENCE_SEEDS: REFERENCE_SEEDS,
  MIRRORED_MODES: MIRRORED_MODES,
  resolveMode: resolveMode,
  generateCard: generateCard,
  cardArea: cardArea,
  bottomRightCorner: bottomRightCorner,
  pumpFillage: pumpFillage,
  extractFeatures: extractFeatures,
  referenceSignatures: referenceSignatures,
  screenCard: screenCard,
  shortlist: shortlist,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
if (typeof window !== 'undefined') {
  window.Dynacard = API;
}
