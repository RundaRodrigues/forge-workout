import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PI = Math.PI

/* ── easing ── */
const ss = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) }
const pulse = (t, spd = 1.0) => ss((Math.sin(t * spd * PI - PI * 0.5) + 1) / 2)

/* ── equipment builders ── */
function makeBarbell(len = 1.4, plateR = 0.13) {
  const g = new THREE.Group()
  const barMat = new THREE.MeshPhongMaterial({ color: 0xbbbbcc, shininess: 140 })
  const plateMat = new THREE.MeshPhongMaterial({ color: 0xcc2222, shininess: 60 })
  const collarMat = new THREE.MeshPhongMaterial({ color: 0x333344, shininess: 80 })

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 10), barMat)
  bar.rotation.z = PI / 2
  g.add(bar)

  const platePositions = [-(len / 2 - 0.07), (len / 2 - 0.07)]
  for (const x of platePositions) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(plateR, plateR, 0.045, 16), plateMat)
    plate.rotation.z = PI / 2
    plate.position.x = x
    g.add(plate)
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 10), collarMat)
    collar.rotation.z = PI / 2
    collar.position.x = x + (x < 0 ? -0.065 : 0.065)
    g.add(collar)
  }
  return g
}

function makeDumbbell(side = 1) {
  const g = new THREE.Group()
  const handleMat = new THREE.MeshPhongMaterial({ color: 0x444455, shininess: 100 })
  const headMat = new THREE.MeshPhongMaterial({ color: 0x222233, shininess: 60 })
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), handleMat)
  handle.rotation.z = PI / 2
  g.add(handle)
  for (const x of [-0.13, 0.13]) {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), headMat)
    head.position.x = x * side
    g.add(head)
  }
  return g
}

function makeBench(tilt = 0) {
  const g = new THREE.Group()
  const padMat = new THREE.MeshPhongMaterial({ color: 0x111122, shininess: 40 })
  const frameMat = new THREE.MeshPhongMaterial({ color: 0x333344, shininess: 100 })
  const pad = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.32), padMat)
  pad.rotation.x = tilt
  g.add(pad)
  for (const x of [-0.58, 0.58]) {
    for (const z of [-0.12, 0.12]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.38, 8), frameMat)
      leg.position.set(x, -0.22, z)
      g.add(leg)
    }
  }
  return g
}

function makePullBar() {
  const g = new THREE.Group()
  const mat = new THREE.MeshPhongMaterial({ color: 0x777788, shininess: 120 })
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 10), mat)
  bar.rotation.z = PI / 2
  g.add(bar)
  for (const x of [-0.55, 0.55]) {
    const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), mat)
    vert.position.set(x, 0.14, 0)
    g.add(vert)
  }
  return g
}

/* ── figure builder ── */
function buildFigure(scene, shirtColor) {
  const skin = new THREE.MeshPhongMaterial({ color: 0xd4916a, emissive: 0x110500, shininess: 60 })
  const shirt = new THREE.MeshPhongMaterial({ color: shirtColor, emissive: 0x050510, shininess: 40 })
  const pants = new THREE.MeshPhongMaterial({ color: 0x1a1a33, shininess: 30 })
  const shoe = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 60 })

  const cyl = (rt, rb, h, mat, seg = 10) =>
    new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
  const box = (w, h, d, mat) =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  const sph = (r, mat) =>
    new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat)

  const root = new THREE.Group()

  /* pelvis */
  const pelvis = box(0.28, 0.13, 0.16, pants)
  pelvis.position.y = 0
  root.add(pelvis)

  /* spine group — everything above pelvis */
  const spine = new THREE.Group()
  spine.position.y = 0.065
  root.add(spine)

  const torsoMesh = box(0.3, 0.42, 0.18, shirt)
  torsoMesh.position.y = 0.21
  spine.add(torsoMesh)

  const neck = cyl(0.055, 0.055, 0.1, skin)
  neck.position.y = 0.465
  spine.add(neck)

  const head = sph(0.13, skin)
  head.position.y = 0.585
  spine.add(head)

  /* arms — children of spine so they lean with torso */
  function makeArm(side) {
    const shoulderPivot = new THREE.Group()
    shoulderPivot.position.set(side * 0.22, 0.35, 0)
    spine.add(shoulderPivot)

    const upper = cyl(0.048, 0.042, 0.28, skin)
    upper.position.y = -0.14
    shoulderPivot.add(upper)

    const elbowPivot = new THREE.Group()
    elbowPivot.position.y = -0.28
    shoulderPivot.add(elbowPivot)

    const forearm = cyl(0.04, 0.035, 0.26, skin)
    forearm.position.y = -0.13
    elbowPivot.add(forearm)

    const hand = sph(0.052, skin)
    hand.position.y = -0.265
    elbowPivot.add(hand)

    return { shoulder: shoulderPivot, elbow: elbowPivot, hand }
  }

  const LA = makeArm(-1)
  const RA = makeArm(1)

  /* legs */
  function makeLeg(side) {
    const hipPivot = new THREE.Group()
    hipPivot.position.set(side * 0.1, -0.065, 0)
    root.add(hipPivot)

    const thigh = cyl(0.068, 0.062, 0.38, pants)
    thigh.position.y = -0.19
    hipPivot.add(thigh)

    const kneePivot = new THREE.Group()
    kneePivot.position.y = -0.38
    hipPivot.add(kneePivot)

    const shin = cyl(0.054, 0.048, 0.35, pants)
    shin.position.y = -0.175
    kneePivot.add(shin)

    const foot = box(0.1, 0.065, 0.22, shoe)
    foot.position.set(0, -0.37, 0.05)
    kneePivot.add(foot)

    return { hip: hipPivot, knee: kneePivot }
  }

  const LL = makeLeg(-1)
  const RL = makeLeg(1)

  scene.add(root)

  return {
    root, spine,
    torso: torsoMesh,
    lShoulder: LA.shoulder, lElbow: LA.elbow, lHand: LA.hand,
    rShoulder: RA.shoulder, rElbow: RA.elbow, rHand: RA.hand,
    lHip: LL.hip, lKnee: LL.knee,
    rHip: RL.hip, rKnee: RL.knee,
  }
}

/* helper: set barbell/dumbbell between hands */
function trackBarToHands(fig, bar) {
  fig.root.updateWorldMatrix(true, true)
  const lPos = new THREE.Vector3()
  const rPos = new THREE.Vector3()
  fig.lHand.getWorldPosition(lPos)
  fig.rHand.getWorldPosition(rPos)
  const mid = lPos.clone().add(rPos).multiplyScalar(0.5)
  bar.position.copy(mid)
}

/* ── per-exercise configs ── */
const CONFIGS = {
  'bench-press': {
    light: 0xff3b3b, bg: '#0d080f', shirt: 0x991122,
    cam: { pos: [2.2, 1.0, 1.8], look: [0.2, 0, 0] },
    setup(fig, scene) {
      fig.root.rotation.z = -PI / 2
      fig.root.position.set(0, -0.1, 0)
      const bench = makeBench()
      bench.position.set(0, -0.52, 0)
      bench.rotation.z = PI / 2
      scene.add(bench)
      const bar = makeBarbell(1.4)
      scene.add(bar)
      fig._bar = bar
      fig.lShoulder.rotation.z = 0.35
      fig.rShoulder.rotation.z = -0.35
    },
    animate(fig, t) {
      const p = pulse(t, 0.55)
      fig.lShoulder.rotation.x = -(0.25 + p * 0.75)
      fig.rShoulder.rotation.x = -(0.25 + p * 0.75)
      fig.lElbow.rotation.x = 0.55 - p * 0.5
      fig.rElbow.rotation.x = 0.55 - p * 0.5
      if (fig._bar) trackBarToHands(fig, fig._bar)
    },
  },

  'overhead-press': {
    light: 0xff7a1a, bg: '#0f0a07', shirt: 0x991122,
    cam: { pos: [2.2, 0.5, 2.2], look: [0, 0.3, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      const bar = makeBarbell(1.2)
      scene.add(bar)
      fig._bar = bar
    },
    animate(fig, t) {
      const p = pulse(t, 0.5)
      const angle = -(0.2 + p * 1.5)
      fig.lShoulder.rotation.x = angle
      fig.rShoulder.rotation.x = angle
      fig.lElbow.rotation.x = -(p * 0.5)
      fig.rElbow.rotation.x = -(p * 0.5)
      if (fig._bar) trackBarToHands(fig, fig._bar)
    },
  },

  'incline-press': {
    light: 0xff3b3b, bg: '#0d080f', shirt: 0x991122,
    cam: { pos: [2.2, 1.2, 1.8], look: [0.1, 0.1, 0] },
    setup(fig, scene) {
      fig.root.rotation.z = -PI / 2
      fig.root.rotation.x = -0.35
      fig.root.position.set(0, -0.1, -0.1)
      const bench = makeBench(0.35)
      bench.position.set(0, -0.52, 0)
      bench.rotation.z = PI / 2
      scene.add(bench)
      const bar = makeBarbell(1.4)
      scene.add(bar)
      fig._bar = bar
      fig.lShoulder.rotation.z = 0.3
      fig.rShoulder.rotation.z = -0.3
    },
    animate(fig, t) {
      const p = pulse(t, 0.55)
      fig.lShoulder.rotation.x = -(0.3 + p * 0.8)
      fig.rShoulder.rotation.x = -(0.3 + p * 0.8)
      fig.lElbow.rotation.x = 0.5 - p * 0.45
      fig.rElbow.rotation.x = 0.5 - p * 0.45
      if (fig._bar) trackBarToHands(fig, fig._bar)
    },
  },

  'lateral-raise': {
    light: 0xff7a1a, bg: '#0f0a07', shirt: 0x991122,
    cam: { pos: [0, 0.4, 3.2], look: [0, 0.2, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      const dL = makeDumbbell(-1)
      const dR = makeDumbbell(1)
      scene.add(dL)
      scene.add(dR)
      fig._dL = dL
      fig._dR = dR
    },
    animate(fig, t) {
      const p = pulse(t, 0.6)
      fig.lShoulder.rotation.z = -(p * 1.1)
      fig.rShoulder.rotation.z = p * 1.1
      fig.lElbow.rotation.z = -(p * 0.15)
      fig.rElbow.rotation.z = p * 0.15
      if (fig._dL) {
        fig.root.updateWorldMatrix(true, true)
        const lPos = new THREE.Vector3()
        const rPos = new THREE.Vector3()
        fig.lHand.getWorldPosition(lPos)
        fig.rHand.getWorldPosition(rPos)
        fig._dL.position.copy(lPos)
        fig._dR.position.copy(rPos)
      }
    },
  },

  'pullup': {
    light: 0x4cc9f0, bg: '#07090f', shirt: 0x0a2a6e,
    cam: { pos: [2.2, 0.6, 2.5], look: [0, 0.3, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.55, 0)
      fig.lHip.rotation.x = 0.25
      fig.rHip.rotation.x = 0.25
      fig.lKnee.rotation.x = -0.5
      fig.rKnee.rotation.x = -0.5
      const pullBar = makePullBar()
      pullBar.position.y = 1.45
      scene.add(pullBar)
    },
    animate(fig, t) {
      const p = pulse(t, 0.5)
      fig.root.position.y = -0.55 + p * 0.5
      const armAngle = -(1.45 - p * 0.9)
      fig.lShoulder.rotation.x = armAngle
      fig.rShoulder.rotation.x = armAngle
      fig.lElbow.rotation.x = -(1.1 - p * 0.9)
      fig.rElbow.rotation.x = -(1.1 - p * 0.9)
    },
  },

  'barbell-row': {
    light: 0x4cc9f0, bg: '#07090f', shirt: 0x0a2a6e,
    cam: { pos: [2.8, 0.8, 1.2], look: [0, 0, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.55, 0)
      fig.spine.rotation.x = 0.82
      fig.lHip.rotation.x = -0.18
      fig.rHip.rotation.x = -0.18
      fig.lKnee.rotation.x = 0.15
      fig.rKnee.rotation.x = 0.15
      const bar = makeBarbell(1.3)
      scene.add(bar)
      fig._bar = bar
    },
    animate(fig, t) {
      const p = pulse(t, 0.55)
      fig.lShoulder.rotation.x = 0.15 + p * 1.0
      fig.rShoulder.rotation.x = 0.15 + p * 1.0
      fig.lElbow.rotation.x = p * 1.1
      fig.rElbow.rotation.x = p * 1.1
      if (fig._bar) trackBarToHands(fig, fig._bar)
    },
  },

  'face-pull': {
    light: 0x4cc9f0, bg: '#07090f', shirt: 0x0a2a6e,
    cam: { pos: [2.2, 0.5, 2.2], look: [0, 0.2, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6),
        new THREE.MeshPhongMaterial({ color: 0x888877 })
      )
      rope.rotation.z = PI / 2
      rope.position.set(0, 0.2, 0.4)
      scene.add(rope)
      fig._rope = rope
    },
    animate(fig, t) {
      const p = pulse(t, 0.55)
      fig.lShoulder.rotation.x = -(0.3 + p * 0.5)
      fig.rShoulder.rotation.x = -(0.3 + p * 0.5)
      fig.lShoulder.rotation.y = 0.5 + p * 0.4
      fig.rShoulder.rotation.y = -(0.5 + p * 0.4)
      fig.lElbow.rotation.x = -(0.6 + p * 0.8)
      fig.rElbow.rotation.x = -(0.6 + p * 0.8)
    },
  },

  'bicep-curl': {
    light: 0xff7a1a, bg: '#0f0a07', shirt: 0x991122,
    cam: { pos: [2.2, 0.4, 2.2], look: [0, 0.1, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      const dL = makeDumbbell(-1)
      const dR = makeDumbbell(1)
      scene.add(dL)
      scene.add(dR)
      fig._dL = dL
      fig._dR = dR
    },
    animate(fig, t) {
      const p = pulse(t, 0.6)
      fig.lElbow.rotation.x = -(p * 1.8)
      fig.rElbow.rotation.x = -(p * 1.8)
      fig.lShoulder.rotation.x = -(p * 0.15)
      fig.rShoulder.rotation.x = -(p * 0.15)
      if (fig._dL) {
        fig.root.updateWorldMatrix(true, true)
        const lPos = new THREE.Vector3()
        const rPos = new THREE.Vector3()
        fig.lHand.getWorldPosition(lPos)
        fig.rHand.getWorldPosition(rPos)
        fig._dL.position.copy(lPos)
        fig._dR.position.copy(rPos)
      }
    },
  },

  'squat': {
    light: 0x06d6a0, bg: '#070f0c', shirt: 0x0a4a30,
    cam: { pos: [2.4, 0.3, 2.2], look: [0, 0.1, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.25, 0)
      const bar = makeBarbell(1.5, 0.14)
      scene.add(bar)
      fig._bar = bar
    },
    animate(fig, t) {
      const p = pulse(t, 0.5)
      fig.root.position.y = -0.25 - p * 0.38
      fig.lHip.rotation.x = p * 1.7
      fig.rHip.rotation.x = p * 1.7
      fig.lKnee.rotation.x = -(p * 1.55)
      fig.rKnee.rotation.x = -(p * 1.55)
      fig.spine.rotation.x = p * 0.28
      if (fig._bar) {
        fig.root.updateWorldMatrix(true, true)
        const spinePos = new THREE.Vector3()
        fig.spine.getWorldPosition(spinePos)
        fig._bar.position.set(spinePos.x, spinePos.y + 0.25, spinePos.z - 0.06)
      }
    },
  },

  'romanian-deadlift': {
    light: 0x06d6a0, bg: '#070f0c', shirt: 0x0a4a30,
    cam: { pos: [2.8, 0.5, 1.6], look: [0, 0, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.55, 0)
      const bar = makeBarbell(1.3, 0.14)
      scene.add(bar)
      fig._bar = bar
    },
    animate(fig, t) {
      const p = pulse(t, 0.5)
      fig.spine.rotation.x = p * 0.95
      fig.lHip.rotation.x = p * 0.38
      fig.rHip.rotation.x = p * 0.38
      fig.lKnee.rotation.x = -(p * 0.18)
      fig.rKnee.rotation.x = -(p * 0.18)
      if (fig._bar) trackBarToHands(fig, fig._bar)
    },
  },

  'leg-press': {
    light: 0x06d6a0, bg: '#070f0c', shirt: 0x0a4a30,
    cam: { pos: [2.5, 0.5, 1.8], look: [0, -0.1, 0] },
    setup(fig, scene) {
      fig.root.rotation.z = -PI * 0.45
      fig.root.position.set(0, -0.2, 0)
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.38),
        new THREE.MeshPhongMaterial({ color: 0x111122 })
      )
      seat.position.set(0, -0.45, 0)
      seat.rotation.z = PI * 0.45
      scene.add(seat)
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.38),
        new THREE.MeshPhongMaterial({ color: 0x111122 })
      )
      back.position.set(-0.5, -0.2, 0)
      scene.add(back)
    },
    animate(fig, t) {
      const p = pulse(t, 0.5)
      fig.lHip.rotation.x = 0.8 + p * 0.9
      fig.rHip.rotation.x = 0.8 + p * 0.9
      fig.lKnee.rotation.x = -(0.6 + p * 1.0)
      fig.rKnee.rotation.x = -(0.6 + p * 1.0)
    },
  },

  'calf-raise': {
    light: 0x06d6a0, bg: '#070f0c', shirt: 0x0a4a30,
    cam: { pos: [2.5, 0.2, 2.2], look: [0, 0, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.3),
        new THREE.MeshPhongMaterial({ color: 0x222233 })
      )
      platform.position.y = -0.82
      scene.add(platform)
    },
    animate(fig, t) {
      const p = pulse(t, 0.7)
      fig.root.position.y = -0.62 + p * 0.12
      fig.lKnee.rotation.x = -(p * 0.08)
      fig.rKnee.rotation.x = -(p * 0.08)
    },
  },

  'machine-fly': {
    light: 0xff3b3b, bg: '#0d080f', shirt: 0x991122,
    cam: { pos: [0, 0.4, 3.2], look: [0, 0.2, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      // machine seat
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.07, 0.32),
        new THREE.MeshPhongMaterial({ color: 0x111122 })
      )
      seat.position.set(0, -0.7, 0)
      scene.add(seat)
      // machine frame poles (left & right)
      const frameMat = new THREE.MeshPhongMaterial({ color: 0x333344, shininess: 90 })
      for (const x of [-0.7, 0.7]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.6, 8), frameMat)
        pole.position.set(x, 0.1, -0.1)
        scene.add(pole)
        // cable handle sphere
        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshPhongMaterial({ color: 0x555566 }))
        handle.position.set(x * 0.75, 0.2, 0)
        scene.add(handle)
        fig[x < 0 ? '_hL' : '_hR'] = handle
      }
    },
    animate(fig, t) {
      const p = pulse(t, 0.6)
      // arms sweep from wide open to closed in front
      fig.lShoulder.rotation.z = -(0.1 + (1 - p) * 1.2)
      fig.rShoulder.rotation.z = 0.1 + (1 - p) * 1.2
      fig.lShoulder.rotation.x = -(p * 0.2)
      fig.rShoulder.rotation.x = -(p * 0.2)
      fig.lElbow.rotation.x = 0.15
      fig.rElbow.rotation.x = 0.15
      // handles track hands
      if (fig._hL) {
        fig.root.updateWorldMatrix(true, true)
        const lPos = new THREE.Vector3()
        const rPos = new THREE.Vector3()
        fig.lHand.getWorldPosition(lPos)
        fig.rHand.getWorldPosition(rPos)
        fig._hL.position.copy(lPos)
        fig._hR.position.copy(rPos)
      }
    },
  },

  'lat-pulldown': {
    light: 0x4cc9f0, bg: '#07090f', shirt: 0x0a2a6e,
    cam: { pos: [2.2, 0.5, 2.4], look: [0, 0.3, 0] },
    setup(fig, scene) {
      fig.root.position.set(0, -0.62, 0)
      // overhead bar
      const bar = makePullBar()
      bar.position.y = 1.55
      scene.add(bar)
      fig._bar = bar
    },
    animate(fig, t) {
      const p = pulse(t, 0.55)
      const armAngle = -(0.3 + p * 1.1)
      fig.lShoulder.rotation.x = armAngle
      fig.rShoulder.rotation.x = armAngle
      fig.lShoulder.rotation.z = -0.25
      fig.rShoulder.rotation.z = 0.25
      fig.lElbow.rotation.x = -(0.2 + p * 0.8)
      fig.rElbow.rotation.x = -(0.2 + p * 0.8)
      // slight torso lean back at peak contraction
      fig.spine.rotation.x = -(p * 0.15)
    },
  },

  'leg-curl': {
    light: 0x06d6a0, bg: '#070f0c', shirt: 0x0a4a30,
    cam: { pos: [2.5, 0.3, 2.0], look: [0, -0.1, 0] },
    setup(fig, scene) {
      // prone (face-down) position
      fig.root.rotation.z = PI / 2
      fig.root.position.set(0, -0.05, 0)
      const bench = makeBench()
      bench.position.set(0, -0.52, 0)
      bench.rotation.z = PI / 2
      scene.add(bench)
    },
    animate(fig, t) {
      const p = pulse(t, 0.6)
      fig.lKnee.rotation.x = -(p * 1.7)
      fig.rKnee.rotation.x = -(p * 1.7)
      fig.lHip.rotation.x = p * 0.1
      fig.rHip.rotation.x = p * 0.1
    },
  },

  'default': {
    light: 0xff7a1a, bg: '#0a0a12', shirt: 0x222266,
    cam: { pos: [0, 0.3, 3.4], look: [0, 0.2, 0] },
    setup(fig) { fig.root.position.set(0, -0.62, 0) },
    animate(fig, t) {
      fig.lShoulder.rotation.x = Math.sin(t * 1.2) * 0.35
      fig.rShoulder.rotation.x = -Math.sin(t * 1.2) * 0.35
      fig.lHip.rotation.x = -Math.sin(t * 1.2) * 0.28
      fig.rHip.rotation.x = Math.sin(t * 1.2) * 0.28
    },
  },
}

/* ── React component ── */
export default function ExerciseIllustration({ exerciseId }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const cfg = CONFIGS[exerciseId] ?? CONFIGS['default']
    const W = mount.clientWidth || 320
    const H = mount.clientHeight || 200

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(cfg.bg)
    scene.fog = new THREE.Fog(cfg.bg, 7, 16)

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 50)
    const cp = cfg.cam?.pos ?? [0, 0.3, 3.4]
    const cl = cfg.cam?.look ?? [0, 0.2, 0]
    camera.position.set(...cp)
    camera.lookAt(...cl)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x1a1a2e, 3.5))

    const key = new THREE.DirectionalLight(cfg.light, 4.0)
    key.position.set(2.5, 3, 2)
    key.castShadow = true
    scene.add(key)

    const rim = new THREE.DirectionalLight(0x334466, 2.0)
    rim.position.set(-3, 1, -2)
    scene.add(rim)

    const fill = new THREE.DirectionalLight(0xffffff, 0.8)
    fill.position.set(0, -2, 3)
    scene.add(fill)

    const grid = new THREE.GridHelper(6, 14, 0x0d0d22, 0x080818)
    grid.position.y = -0.88
    scene.add(grid)

    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 16, 16),
      new THREE.MeshBasicMaterial({ color: cfg.light, transparent: true, opacity: 0.055 })
    )
    glowMesh.position.set(0, 0.2, -0.6)
    scene.add(glowMesh)

    const fig = buildFigure(scene, cfg.shirt)
    cfg.setup(fig, scene)

    const clock = new THREE.Clock()
    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      cfg.animate(fig, t)
      scene.rotation.y = Math.sin(t * 0.18) * 0.1
      renderer.render(scene, camera)
    }
    tick()

    const ro = new ResizeObserver(() => {
      const nW = mount.clientWidth
      const nH = mount.clientHeight
      camera.aspect = nW / nH
      camera.updateProjectionMatrix()
      renderer.setSize(nW, nH)
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      scene.clear()
    }
  }, [exerciseId])

  return <div ref={mountRef} className="illustration-canvas" />
}
