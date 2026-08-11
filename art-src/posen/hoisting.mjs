/** PROBESTREIFEN 2 — wird ersetzt. Hängebild: Rumpfneigung und Armlage. */
const V = [
  // [spine01, oberarm, unterarm]
  [0, -150, 0],
  [0, -150, 50],
  [-10, -140, 40],
  [10, -140, 40],
  [0, -110, 0],
  [0, -110, -30],
];

function helm(neigung) {
  const b = (neigung * Math.PI) / 180;
  const cos = Math.cos(b);
  const sin = Math.sin(b);
  const dreh = (z, y) => [y * sin + z * cos, y * cos - z * sin, 0];
  return [
    { an: 'Head', pos: dreh(1.5, 4.9), mass: [3.4, 1.4, 4.0], dreh: [neigung, 0, 0], farbe: 'werkzeug' },
    { an: 'Head', pos: dreh(3.4, 4.3), mass: [1.6, 0.6, 4.2], dreh: [neigung, 0, 0], farbe: 'werkzeug' },
  ];
}

export default {
  clip: 'hoisting',
  frames: 6,

  pose(i) {
    const [s, ua, fa] = V[i];
    return {
      Spine01: [s, 0, 0],
      Head: [-14, 0, 0],
      L_Upperarm: [ua + 6, 0, -90],
      R_Upperarm: [ua - 6, 0, 90],
      L_Forearm: [fa, 0, 0],
      R_Forearm: [fa, 0, 0],
      L_Thigh: [10, 0, -5],
      R_Thigh: [12, 0, 5],
      L_Calf: [12, 0, 0],
      R_Calf: [16, 0, 0],
      L_Foot: [22, 0, 0],
      R_Foot: [24, 0, 0],
      _versatz: [0, -3],
    };
  },

  teile(i) {
    return helm(V[i][0] - 14);
  },
};
