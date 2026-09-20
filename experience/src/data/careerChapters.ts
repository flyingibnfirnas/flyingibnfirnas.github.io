export type Vec3 = [number, number, number]

export type CameraKeyframe = {
  /** 0–1 progress within this chapter */
  t: number
  position: Vec3
  lookAt: Vec3
  fov?: number
  /** Subject yaw in radians (optional; splined with the camera path) */
  subjectYaw?: number
}

export type OverlayBeat = {
  /** 0–1 progress within this chapter when this overlay is most visible */
  t: number
  title: string
  body: string
}

export type CareerChapter = {
  id: string
  name: string
  title: string
  subtitle: string
  description: string
  /** Short date range for the top timeline (e.g. 2018–Present) */
  era: string
  /** Scroll height multiplier for this chapter (vh units) */
  scrollLengthVh: number
  /** Fallback subject yaw if keyframes omit subjectYaw */
  subjectYaw?: number
  /** World-space offset for this chapter’s subject (e.g. car bay beside the jet) */
  subjectOffset?: Vec3
  environment: {
    fogColor: string
    fogNear: number
    fogFar: number
    ambientIntensity: number
    keyLightIntensity: number
    accentColor: string
  }
  camera: CameraKeyframe[]
  overlays: OverlayBeat[]
  contentBeats: OverlayBeat[]
}

/** Drone bay — port of the robot (journey starts here) */
export const DRONE_BAY_OFFSET: Vec3 = [-14, 0, 0]

/** Jet bay on the shared hangar — starboard of the robot */
export const JET_BAY_OFFSET: Vec3 = [16, 0, 0]

/** Virtek laser cell — starboard of the jet (was the car slot) */
export const VIRTEK_BAY_OFFSET: Vec3 = [30, 0, 0]

/** Car bay — starboard of Virtek */
export const HANGAR_CAR_OFFSET: Vec3 = [44, 0, 0]

/** AMD server bay — starboard of the car */
export const AMD_BAY_OFFSET: Vec3 = [58, 0, 0]

/**
 * Chapter copy aligned to Mohamed_Helal_Resume_Staff_Architect.docx.
 * Amel Group (f16) content is intentionally left unchanged.
 */
export const careerChapters: CareerChapter[] = [
  {
    id: 'avionics',
    name: "Bachelor's",
    title: 'Aerospace Avionics',
    subtitle: 'B.Eng · Aerospace Engineering–Avionics · TMU',
    description:
      'Bachelor of Aerospace Engineering with an Avionics major — sensors, control, and the electronics that keep aircraft oriented and flyable.',
    era: '2009',
    scrollLengthVh: 360,
    subjectYaw: 0.35,
    subjectOffset: DRONE_BAY_OFFSET,
    environment: {
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.16,
      keyLightIntensity: 0.7,
      accentColor: '#e87a20',
    },
    // Arrive + hold rhythm (≈0.05 move, ≈0.075 hold) — same as robot / F-16
    camera: [
      // 1 — establish
      {
        t: 0.0,
        position: [11.2, 6.4, 9.5],
        lookAt: [0, 1.15, 0.1],
        fov: 38,
        subjectYaw: 0.35,
      },
      {
        t: 0.075,
        position: [11.2, 6.4, 9.5],
        lookAt: [0, 1.15, 0.1],
        fov: 38,
        subjectYaw: 0.35,
      },
      // 2 — top / rotor plane
      {
        t: 0.125,
        position: [0.4, 8.2, 0.8],
        lookAt: [0, 1.0, 0],
        fov: 40,
        subjectYaw: 0.35,
      },
      {
        t: 0.2,
        position: [0.4, 8.2, 0.8],
        lookAt: [0, 1.0, 0],
        fov: 40,
        subjectYaw: 0.35,
      },
      // 3 — side hover
      {
        t: 0.25,
        position: [5.6, 2.8, 4.2],
        lookAt: [0, 1.25, 0.1],
        fov: 36,
        subjectYaw: 0.35,
      },
      {
        t: 0.325,
        position: [5.6, 2.8, 4.2],
        lookAt: [0, 1.25, 0.1],
        fov: 36,
        subjectYaw: 0.35,
      },
      // 4 — nose / avionics
      {
        t: 0.375,
        position: [0.3, 1.6, 4.8],
        lookAt: [0, 1.15, 0],
        fov: 34,
        subjectYaw: 0.4,
      },
      {
        t: 0.45,
        position: [0.3, 1.6, 4.8],
        lookAt: [0, 1.15, 0],
        fov: 34,
        subjectYaw: 0.4,
      },
      // 5 — opposite quarter
      {
        t: 0.5,
        position: [-5.2, 3.4, 4.6],
        lookAt: [0, 1.2, 0.05],
        fov: 36,
        subjectYaw: 0.45,
      },
      {
        t: 0.575,
        position: [-5.2, 3.4, 4.6],
        lookAt: [0, 1.2, 0.05],
        fov: 36,
        subjectYaw: 0.45,
      },
      // 6 — wide from the south: drone (left) + robot (right) both in frame
      // World: cam [0, 7, 16] lookAt [-7, 1.2, 0]
      {
        t: 0.625,
        position: [14.0, 7.0, 16.0],
        lookAt: [7.0, 1.2, 0],
        fov: 42,
        subjectYaw: 0.45,
      },
      {
        t: 0.7,
        position: [14.0, 7.0, 16.0],
        lookAt: [7.0, 1.2, 0],
        fov: 42,
        subjectYaw: 0.45,
      },
      // Slide +X — drone rides the left edge of the frame (not behind the robot)
      // World: cam [2, 6, 15] lookAt [-3, 1.3, 0]
      {
        t: 0.82,
        position: [16.0, 6.0, 15.0],
        lookAt: [11.0, 1.3, 0],
        fov: 40,
        subjectYaw: 0.45,
      },
      // Hold on robot — drone center is past the left edge (NDC x < -1)
      // World: cam [5, 5.5, 14] lookAt [0.5, 1.45, 0]
      {
        t: 0.92,
        position: [19.0, 5.5, 14.0],
        lookAt: [14.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.45,
      },
      {
        t: 1.0,
        position: [19.0, 5.5, 14.0],
        lookAt: [14.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.45,
      },
    ],
    contentBeats: [
      {
        t: 0.037,
        title: "Bachelor's — Aerospace Engineering",
        body: 'Toronto Metropolitan University (TMU) — Bachelor of Aerospace Engineering, Avionics major. Dean’s List and Student Scholar; CGPA 3.96/4.33.',
      },
      {
        t: 0.162,
        title: 'Quadrotor dynamics',
        body: 'Designed and simulated quadrotor hover dynamics in Matlab/Simulink — the first full loop from plant model to closed-loop flight.',
      },
      {
        t: 0.287,
        title: 'Stability & control',
        body: 'PID and LQR controllers for altitude and attitude — comparing classical and optimal control on the same vehicle plant.',
      },
      {
        t: 0.412,
        title: 'Simulink verification',
        body: 'Controllers exercised against nonlinear dynamics so hover and tracking behavior could be proven before hardware.',
      },
      {
        t: 0.67,
        title: 'From undergrad to research',
        body: 'Avionics and control became the runway for graduate work — next: industrial robotic tooling calibration on the hangar floor.',
      },
    ],
    overlays: [
      { t: 0.037, title: 'B.Eng', body: 'Aerospace · Avionics · TMU' },
      { t: 0.162, title: 'Dynamics', body: 'Quadrotor · hover plant' },
      { t: 0.287, title: 'Control', body: 'PID · LQR' },
      { t: 0.412, title: 'Simulink', body: 'Nonlinear verification' },
    ],
  },
  {
    id: 'robotics',
    name: "Master's",
    title: 'Robotic Tooling Calibration',
    subtitle: 'MASc · Aerospace–Avionics · industrial robotics',
    description:
      'Master’s research on automated percussive riveting and robotic tooling calibration — ABB robot, vision, and 0.2 mm insertion tolerance.',
    era: '2013',
    scrollLengthVh: 400,
    subjectYaw: 0.4,
    environment: {
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.16,
      keyLightIntensity: 0.7,
      accentColor: '#e87a20',
    },
    // Same arrive + hold rhythm as the F-16 chapter (≈0.05 move, ≈0.075 hold)
    camera: [
      // 1 — establish (matches Bachelor's truck end — drone already off-frame left)
      {
        t: 0.0,
        position: [5.0, 5.5, 14.0],
        lookAt: [0.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.4,
      },
      {
        t: 0.075,
        position: [5.0, 5.5, 14.0],
        lookAt: [0.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.4,
      },
      // 2
      {
        t: 0.125,
        position: [5.194, 4.148, 0.486],
        lookAt: [-0.117, 1.791, 0.505],
        fov: 38,
        subjectYaw: 0.4,
      },
      {
        t: 0.2,
        position: [5.194, 4.148, 0.486],
        lookAt: [-0.117, 1.791, 0.505],
        fov: 38,
        subjectYaw: 0.4,
      },
      // 3
      {
        t: 0.25,
        position: [4.853, 4.622, 2.105],
        lookAt: [-0.273, 1.588, 0.749],
        fov: 38,
        subjectYaw: 0.4,
      },
      {
        t: 0.325,
        position: [4.853, 4.622, 2.105],
        lookAt: [-0.273, 1.588, 0.749],
        fov: 38,
        subjectYaw: 0.4,
      },
      // 4
      {
        t: 0.375,
        position: [5.2, 3.4, 6.4],
        lookAt: [0, 1.35, 0.25],
        fov: 38,
        subjectYaw: 0.4,
      },
      {
        t: 0.45,
        position: [5.2, 3.4, 6.4],
        lookAt: [0, 1.35, 0.25],
        fov: 38,
        subjectYaw: 0.4,
      },
      // 5 — opposite side
      {
        t: 0.5,
        position: [-4.6, 3.2, 5],
        lookAt: [0, 1.5, 0.2],
        fov: 36,
        subjectYaw: 0.5,
      },
      {
        t: 0.575,
        position: [-4.6, 3.2, 5],
        lookAt: [0, 1.5, 0.2],
        fov: 36,
        subjectYaw: 0.5,
      },
      // 6 — wide, robot + jet already on the shared hangar floor
      {
        t: 0.625,
        position: [8.0, 7.2, 14.0],
        lookAt: [8.0, 1.2, 0.0],
        fov: 42,
        subjectYaw: 0.5,
      },
      {
        t: 0.72,
        position: [8.0, 7.2, 14.0],
        lookAt: [8.0, 1.2, 0.0],
        fov: 42,
        subjectYaw: 0.5,
      },
      // Truck onto jet — robot leaves frame; hold for Amel handoff
      {
        t: 0.85,
        position: [23.564, 6.011, 20.668],
        lookAt: [13.131, -0.459, -7.164],
        fov: 44,
        subjectYaw: 0.5,
      },
      {
        t: 1.0,
        position: [23.564, 6.011, 20.668],
        lookAt: [13.131, -0.459, -7.164],
        fov: 44,
        subjectYaw: 0.5,
      },
    ],
    contentBeats: [
      {
        t: 0.037,
        title: "Master's research",
        body: 'MASc in Aerospace Engineering–Avionics at Toronto Metropolitan University (TMU) — CGPA 4.26/4.33 — building and proving an automated percussive riveting cell for aerospace manufacturing.',
      },
      {
        t: 0.287,
        title: 'ABB robot + vision',
        body: 'Integrated an industrial ABB robot with a 3D tracker and camera vision for tool-hole localization — calibration methods targeting 0.2 mm rivet insertion tolerance.',
      },
      {
        t: 0.67,
        title: 'Tooling calibration',
        body: 'Novel robotic tooling calibration so precision stays on the shop floor — the bridge from academic control work into industrial systems.',
      },
    ],
    overlays: [
      { t: 0.037, title: 'MASc', body: 'Aerospace · Avionics · TMU' },
      { t: 0.287, title: 'ABB + vision', body: 'Tracker · camera · 0.2 mm' },
      { t: 0.67, title: 'Calibration', body: 'Tooling · hangar floor' },
    ],
  },
  {
    id: 'f16',
    name: 'Amel Group',
    title: 'F-16 Simulator',
    subtitle: 'Aerospace simulation & complex systems',
    description:
      'Where the journey begins: modeling, simulating, and understanding flight systems under extreme operating conditions.',
    era: '2015',
    scrollLengthVh: 560,
    // Fallback orientation; prefer per-keyframe subjectYaw when authoring shots
    subjectYaw: 0.6519,
    subjectOffset: JET_BAY_OFFSET,
    environment: {
      // Cold steel void — teal-black, not purple
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.14,
      keyLightIntensity: 0.35,
      accentColor: '#e87a20',
    },
    // Each unique shot is an arrive + hold pair so the camera freezes while you read
    camera: [
      // 1 — establish
      {
        t: 0.0,
        position: [7.564, 6.011, 20.668],
        lookAt: [-2.869, -0.459, -7.164],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.075,
        position: [7.564, 6.011, 20.668],
        lookAt: [-2.869, -0.459, -7.164],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 2 — F100
      {
        t: 0.125,
        position: [-0.215, 1.1, 7.965],
        lookAt: [3.912, -0.523, -7.007],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.2,
        position: [-0.215, 1.1, 7.965],
        lookAt: [3.912, -0.523, -7.007],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 3 — F110 / GE
      {
        t: 0.25,
        position: [-9.557, 1.478, -4.06],
        lookAt: [2.91, 0.944, -1.6],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.325,
        position: [-9.557, 1.478, -4.06],
        lookAt: [2.91, 0.944, -1.6],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 4 — architecture & DEEC
      {
        t: 0.375,
        position: [-1.096, 2.085, -13.851],
        lookAt: [0.607, 1.463, -1.262],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.45,
        position: [-1.096, 2.085, -13.851],
        lookAt: [0.607, 1.463, -1.262],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 5 — weapons
      {
        t: 0.5,
        position: [7.394, 0.168, -2.201],
        lookAt: [0.645, 1.445, -1.972],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.575,
        position: [7.394, 0.168, -2.201],
        lookAt: [0.645, 1.445, -1.972],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 6 — SMS
      {
        t: 0.625,
        position: [4.575, 2.518, 3.746],
        lookAt: [0.058, 0.813, 1.516],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.7,
        position: [4.575, 2.518, 3.746],
        lookAt: [0.058, 0.813, 1.516],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 7 — faults
      {
        t: 0.75,
        position: [-8.47, 6.736, -0.525],
        lookAt: [-0.067, 0.678, -0.635],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.81,
        position: [-8.47, 6.736, -0.525],
        lookAt: [-0.067, 0.678, -0.635],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 8 — Level 5 cockpit (top hold on the jet)
      {
        t: 0.82,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 0.825, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.9,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 0.825, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // Truck across the hangar — top view slides from jet to Virtek bay (world x≈30)
      {
        t: 1.0,
        position: [11.691, 16.711, -3.537],
        lookAt: [14.284, 0.825, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
    ],
    contentBeats: [
      {
        t: 0.037,
        title: 'F-16 simulator',
        body: 'Where the work began: building and validating high-fidelity models that let a fighter simulator behave like the real aircraft under load.',
      },
      {
        t: 0.162,
        title: 'Power plant — F100-PW-229',
        body: 'Pratt & Whitney F100-PW-229 turbofan simulation — modeling the engine as a live system the rest of the simulator could trust.',
      },
      {
        t: 0.287,
        title: 'Power plant — F110-GE-129',
        body: 'General Electric F110-GE-129 — the second engine variant on the same generic turbofan architecture, tuned and verified as its own configuration.',
      },
      {
        t: 0.412,
        title: 'Engine architecture & DEEC',
        body: 'Low-bypass mixed-flow turbofan from inlet through core and afterburner — with the DEEC and fuel metering loop turning throttle intent into thrust the simulated aircraft can fly on.',
      },
      {
        t: 0.537,
        title: 'Weapons simulation',
        body: 'Air-to-air and air-to-ground stores modeled in the loop — including AIM-9 Sidewinder and AGM-65 Maverick — so employment, cues, and release behave like the real jet.',
      },
      {
        t: 0.662,
        title: 'Stores Management System',
        body: 'SMS — the stores management system that inventories, selects, and releases weapons and stores in the simulated aircraft, keeping cockpit cues and employment logic consistent with the real jet.',
      },
      {
        t: 0.787,
        title: 'Faults & indicators',
        body: 'Malfunction injection, detection, and cockpit indications — so the simulated jet can be failed on purpose, then warn and recover the way the real systems do.',
      },
      {
        t: 0.86,
        title: 'Cockpit hardware — Level 5',
        body: 'Building the cockpit hardware for a Level 5 simulator — the physical crew station where the simulated aircraft becomes something you can sit in and fly.',
      },
    ],
    overlays: [
      { t: 0.162, title: 'F100-PW-229', body: 'Pratt & Whitney · turbofan' },
      { t: 0.287, title: 'F110-GE-129', body: 'GE · second engine variant' },
      { t: 0.412, title: 'DEEC', body: 'Architecture · fuel · control loop' },
      { t: 0.537, title: 'Weapons', body: 'AIM-9 · AGM-65' },
      { t: 0.662, title: 'SMS', body: 'Stores management system' },
      { t: 0.787, title: 'BIT / faults', body: 'Injection · detection · cockpit cues' },
      { t: 0.86, title: 'Level 5', body: 'Cockpit hardware build' },
    ],
  },
  {
    id: 'virtek',
    name: 'Virtek Vision',
    title: 'Laser Templating',
    subtitle: 'Software / Embedded Systems Engineer · aerospace laser projection',
    description:
      'Built software and embedded systems for aerospace laser projection — bridging sensors, projector hardware, and IRIS / VPS so CAD templates land accurately on real composite parts.',
    era: '2016',
    scrollLengthVh: 360,
    subjectYaw: 0.2,
    subjectOffset: VIRTEK_BAY_OFFSET,
    environment: {
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.16,
      keyLightIntensity: 0.55,
      accentColor: '#e87a20',
    },
    camera: [
      // 1 — establish (matches F-16 truck end in world space)
      {
        t: 0.0,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 1.8, -0.208],
        fov: 44,
        subjectYaw: 0.2,
      },
      {
        t: 0.075,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 1.8, -0.208],
        fov: 44,
        subjectYaw: 0.2,
      },
      // 2 — projector / boom (pulled back for full fuselage + head)
      {
        t: 0.125,
        position: [5.2, 8.4, 12.5],
        lookAt: [0.1, 3.4, 0.1],
        fov: 40,
        subjectYaw: 0.2,
      },
      {
        t: 0.2,
        position: [5.2, 8.4, 12.5],
        lookAt: [0.1, 3.4, 0.1],
        fov: 40,
        subjectYaw: 0.2,
      },
      // 3 — green cone volume
      {
        t: 0.25,
        position: [-8.5, 5.2, 12.0],
        lookAt: [0.2, 2.4, 0],
        fov: 40,
        subjectYaw: 0.25,
      },
      {
        t: 0.325,
        position: [-8.5, 5.2, 12.0],
        lookAt: [0.2, 2.4, 0],
        fov: 40,
        subjectYaw: 0.25,
      },
      // 4 — ply outlines on the fuselage skin
      {
        t: 0.375,
        position: [4.2, 5.0, 10.5],
        lookAt: [0.1, 2.9, 0.5],
        fov: 38,
        subjectYaw: 0.25,
      },
      {
        t: 0.5,
        position: [4.2, 5.0, 10.5],
        lookAt: [0.1, 2.9, 0.5],
        fov: 38,
        subjectYaw: 0.25,
      },
      // 5 — system wide
      {
        t: 0.55,
        position: [11.0, 7.5, 15.0],
        lookAt: [0.2, 2.2, 0],
        fov: 42,
        subjectYaw: 0.3,
      },
      {
        t: 0.68,
        position: [11.0, 7.5, 15.0],
        lookAt: [0.2, 2.2, 0],
        fov: 42,
        subjectYaw: 0.3,
      },
      // 6 — wide from the south: Virtek cell (left) + car bay (right)
      // World: cam [44, 7, 16] lookAt [37, 1.2, 0]
      {
        t: 0.72,
        position: [14.0, 7.0, 16.0],
        lookAt: [7.0, 1.2, 0],
        fov: 42,
        subjectYaw: 0.3,
      },
      {
        t: 0.78,
        position: [14.0, 7.0, 16.0],
        lookAt: [7.0, 1.2, 0],
        fov: 42,
        subjectYaw: 0.3,
      },
      // Slide +X — fuselage rides the left edge (same cadence as drone→robot)
      // World: cam [46, 6, 15] lookAt [41, 1.3, 0]
      {
        t: 0.86,
        position: [16.0, 6.0, 15.0],
        lookAt: [11.0, 1.3, 0],
        fov: 40,
        subjectYaw: 0.3,
      },
      // Hold on car — Virtek center past left edge (NDC x < -1)
      // World: cam [49, 5.5, 14] lookAt [44.5, 1.45, 0]
      {
        t: 0.92,
        position: [19.0, 5.5, 14.0],
        lookAt: [14.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.3,
      },
      {
        t: 1.0,
        position: [19.0, 5.5, 14.0],
        lookAt: [14.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.3,
      },
    ],
    contentBeats: [
      {
        t: 0.037,
        title: 'Virtek Vision',
        body: 'Software/Embedded Systems Engineer on high-end aerospace laser projection — owning the seam between sensors, projector hardware, and the software that puts CAD templates onto the part.',
      },
      {
        t: 0.162,
        title: 'Shipping IRIS & VPS',
        body: 'Contributed to the release of IRIS and the Laser Templating Visual Positioning System (VPS) — vision-aligned projection so the laser locks to the tool, not a taped-up mylar template.',
      },
      {
        t: 0.287,
        title: 'Linux · Windows · delivery',
        body: 'Implemented production features across Linux and Windows platforms, driving sprint goals and defect closure in JIRA / Confluence so shop-floor releases stayed on schedule.',
      },
      {
        t: 0.437,
        title: 'Light as the template',
        body: 'Projected ply nests and station guides follow the fuselage curvature — composite layup guided by light instead of physical templates and tape measures.',
      },
      {
        t: 0.62,
        title: 'Shop floor → vehicle floor',
        body: 'Aerospace manufacturing systems taught the same discipline as vehicle electronics: sensors, embedded control, and software that has to work on the real hardware — next stop: GM diagnostics.',
      },
    ],
    overlays: [
      { t: 0.037, title: 'SW · Embedded', body: 'Sensors · projector · CAD' },
      { t: 0.162, title: 'IRIS · VPS', body: 'Shipped laser templating' },
      { t: 0.287, title: 'Linux · Windows', body: 'Features · sprint delivery' },
      { t: 0.437, title: 'Ply on the skin', body: 'Light replaces mylar' },
    ],
  },
  {
    id: 'automotive',
    name: 'General Motors',
    title: 'Automotive Diagnostics',
    subtitle: 'Perception Sensor Technical Team Lead · GM Canada',
    description:
      'Eight-plus years at General Motors leading embedded diagnostics — from control systems engineering into Perception Sensor Technical Team Lead for vehicle platforms.',
    era: '2018',
    scrollLengthVh: 420,
    subjectOffset: HANGAR_CAR_OFFSET,
    subjectYaw: 0.6519,
    environment: {
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.18,
      keyLightIntensity: 1.25,
      accentColor: '#e87a20',
    },
    camera: [
      // 1 — establish (matches Virtek truck end — fuselage already off-frame left)
      {
        t: 0.0,
        position: [5.0, 5.5, 14.0],
        lookAt: [0.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.6519,
      },
      {
        t: 0.12,
        position: [5.0, 5.5, 14.0],
        lookAt: [0.5, 1.45, 0],
        fov: 38,
        subjectYaw: 0.6519,
      },
      // 2 — nose / front quarter
      {
        t: 0.18,
        position: [-2.167, 2.286, 6.184],
        lookAt: [-0.931, 1.215, 2.408],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.32,
        position: [-2.167, 2.286, 6.184],
        lookAt: [-0.931, 1.215, 2.408],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 3 — side / body electronics
      {
        t: 0.38,
        position: [4.2, 2.4, 5.2],
        lookAt: [0.1, 1.05, 0.15],
        fov: 40,
        subjectYaw: 0.6519,
      },
      {
        t: 0.5,
        position: [4.2, 2.4, 5.2],
        lookAt: [0.1, 1.05, 0.15],
        fov: 40,
        subjectYaw: 0.6519,
      },
      // 4 — rear three-quarter (pulled clear of the body — no cabin clip)
      {
        t: 0.52,
        position: [-5.8, 3.2, -8.2],
        lookAt: [0.2, 1.15, 0.1],
        fov: 38,
        subjectYaw: 0.7,
      },
      {
        t: 0.6,
        position: [-5.8, 3.2, -8.2],
        lookAt: [0.2, 1.15, 0.1],
        fov: 38,
        subjectYaw: 0.7,
      },
      // 4b — arc south / elevated so the rise to top never tunnels through the car
      {
        t: 0.64,
        position: [6.5, 7.5, 10.5],
        lookAt: [0.3, 1.2, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
      {
        t: 0.68,
        position: [6.5, 7.5, 10.5],
        lookAt: [0.3, 1.2, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
      // 5 — rise to top view over the car (sets up the hangar truck)
      {
        t: 0.72,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 1.1, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.8,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 1.1, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // Truck across the hangar — top view slides from car to AMD bay (world x≈58)
      // World: cam [55.691, 16.711, -3.537] lookAt [58.284, 2.05, -0.208]
      {
        t: 0.88,
        position: [11.691, 16.711, -3.537],
        lookAt: [14.284, 2.05, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 1.0,
        position: [11.691, 16.711, -3.537],
        lookAt: [14.284, 2.05, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
    ],
    contentBeats: [
      {
        t: 0.06,
        title: 'General Motors Canada',
        body: 'Perception Sensor Technical Team Lead — leading 20+ Software, Systems, and Test engineers delivering diagnostic software across sensors, architecture, and infrastructure.',
      },
      {
        t: 0.25,
        title: 'Diagnostics & compliance',
        body: 'Diagnostic strategies spanning UDS (ISO-14229), ISO 26262, and CARB/OBDII — DTCs, DIDs, RIDs, and legislative standards on safety-critical platforms.',
      },
      {
        t: 0.44,
        title: 'From controls to perception',
        body: 'Earlier as Control Systems Engineer: diagnostic systems for autonomous and active safety, rationality diagnostics Product Owner, and the Smart System Learning (SSL) operational statistics module.',
      },
      {
        t: 0.7,
        title: 'ACP · SDV · next stop silicon',
        body: 'Requirements and technical solutions with architects, design leads, and suppliers for ACP and SDV 2.0 — next: datacenter-scale validation platforms at AMD.',
      },
    ],
    overlays: [
      { t: 0.06, title: 'Team Lead', body: '20+ engineers · perception' },
      { t: 0.25, title: 'UDS · ISO 26262', body: 'Diagnostics · compliance' },
      { t: 0.44, title: 'Controls → SME', body: 'Rationality · SSL · ADAS' },
      { t: 0.7, title: 'ACP · SDV 2.0', body: 'Next: AMD validation' },
    ],
  },
  {
    id: 'amd',
    name: 'AMD',
    title: 'Validation Platform Architecture',
    subtitle: 'Staff Architect · GPU validation · datacenter scale',
    description:
      'Staff Architect at Advanced Micro Devices — leading system architecture for a datacenter-scale, AI-driven automated validation platform for GPU systems.',
    era: '2026',
    scrollLengthVh: 360,
    subjectOffset: AMD_BAY_OFFSET,
    subjectYaw: 0.6519,
    environment: {
      fogColor: '#05070b',
      fogNear: 16,
      fogFar: 96,
      ambientIntensity: 0.17,
      keyLightIntensity: 0.9,
      accentColor: '#e87a20',
    },
    camera: [
      // 1 — establish (matches GM truck end in world space — car already off pad left)
      {
        t: 0.0,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 2.05, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      {
        t: 0.14,
        position: [-2.309, 16.711, -3.537],
        lookAt: [0.284, 2.05, -0.208],
        fov: 44,
        subjectYaw: 0.6519,
      },
      // 2 — descend to front of rack / console
      {
        t: 0.22,
        position: [3.2, 3.0, 7.2],
        lookAt: [0.15, 2.2, 0.1],
        fov: 36,
        subjectYaw: 0.6519,
      },
      {
        t: 0.36,
        position: [3.2, 3.0, 7.2],
        lookAt: [0.15, 2.2, 0.1],
        fov: 36,
        subjectYaw: 0.6519,
      },
      // 3 — side bay / chassis depth
      {
        t: 0.42,
        position: [5.8, 2.6, 1.4],
        lookAt: [0, 2.15, 0],
        fov: 38,
        subjectYaw: 0.6519,
      },
      {
        t: 0.56,
        position: [5.8, 2.6, 1.4],
        lookAt: [0, 2.15, 0],
        fov: 38,
        subjectYaw: 0.6519,
      },
      // 4 — high three-quarter of the cell
      {
        t: 0.62,
        position: [-4.2, 5.4, 8.0],
        lookAt: [0.2, 2.3, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
      {
        t: 0.76,
        position: [-4.2, 5.4, 8.0],
        lookAt: [0.2, 2.3, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
      // 5 — closing wide
      {
        t: 0.84,
        position: [7.0, 5.2, 12.0],
        lookAt: [0.2, 2.1, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
      {
        t: 1.0,
        position: [7.0, 5.2, 12.0],
        lookAt: [0.2, 2.1, 0],
        fov: 40,
        subjectYaw: 0.6519,
      },
    ],
    contentBeats: [
      {
        t: 0.05,
        title: 'AMD — Staff Architect',
        body: 'Leading architecture of a datacenter-scale automated validation platform for GPU systems — replacing manual testing with scalable, CI-integrated workflows.',
      },
      {
        t: 0.23,
        title: 'Distributed orchestration',
        body: 'End-to-end system design across distributed test orchestration, hardware lab infrastructure, and user-facing interfaces for test planning and execution.',
      },
      {
        t: 0.43,
        title: 'AI-driven validation',
        body: 'Shaping validation strategy with AI-driven test generation, failure detection, and automated triage — improving coverage and execution efficiency.',
      },
      {
        t: 0.64,
        title: 'Cross-functional delivery',
        body: 'Technical leadership across infrastructure, validation, and software teams — closing architectural gaps and accelerating platform delivery on a high-visibility program.',
      },
    ],
    overlays: [
      { t: 0.05, title: 'Staff Architect', body: 'Validation platform' },
      { t: 0.23, title: 'Datacenter scale', body: 'Orchestration · lab infra' },
      { t: 0.43, title: 'AI validation', body: 'Generate · detect · triage' },
      { t: 0.64, title: 'CI workflows', body: 'GPU systems · delivery' },
    ],
  },
]

export const totalScrollVh = careerChapters.reduce((sum, c) => sum + c.scrollLengthVh, 0)

export function chapterIndexById(id: string): number {
  const i = careerChapters.findIndex((c) => c.id === id)
  return i >= 0 ? i : 0
}

export function chapterProgressBounds(index: number): { start: number; end: number } {
  let start = 0
  for (let i = 0; i < index; i++) {
    start += careerChapters[i].scrollLengthVh / totalScrollVh
  }
  const end = start + careerChapters[index].scrollLengthVh / totalScrollVh
  return { start, end }
}
