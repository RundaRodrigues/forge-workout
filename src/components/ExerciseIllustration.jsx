import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ─── Per-exercise 3D animation config ─────────────────── */
const CONFIGS = {
  'bench-press': {
    light: 0xff3b3b, bg: '#0d080f',
    bodyColor: 0xf4a261,
    setup(fig, scene) {
      // lying on back
      fig.root.rotation.z = Math.PI / 2
      fig.root.position.set(0, -0.15, 0)
      // add bench
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.08, 0.3),
        new THREE.MeshPhongMaterial({ color: 0x222244, shininess: 80 })
      )
      bench.position.set(0, -0.45, 0)
      scene.add(bench)
      // barbell
      const barMat = new THREE.MeshPhongMaterial({ color: 0xaaaacc, shininess: 120 })
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 12), barMat)
      bar.rotation.z = Math.PI / 2
      fig.barbell = bar
      fig.root.add(bar)
      // plates
      for (const x of [-0.6, 0.6]) {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16), new THREE.MeshPhongMaterial({ color: 0xff3b3b }))
        plate.rotation.z = Math.PI / 2
        plate.position.x = x
        fig.root.add(plate)
      }
    },
    animate(fig, t) {
      const press = (Math.sin(t * 1.1) + 1) / 2 // 0→1
      // arms extend upward (in body space = along z when lying)
      fig.lShoulder.rotation.x = -0.3 - press * 0.8
      fig.rShoulder.rotation.x = -0.3 - press * 0.8
      fig.lElbow.rotation.x = 0.6 - press * 0.5
      fig.rElbow.rotation.x = 0.6 - press * 0.5
      // barbell follows hands
      if (fig.barbell) fig.barbell.position.z = 0.38 + press * 0.35
    },
  },

  'overhead-press': {
    light: 0xff7a1a, bg: '#0f0a07',
    bodyColor: 0xf4a261,
    setup(fig) {
      fig.root.position.set(0, -0.6, 0)
      fig.lHip.rotation.x = 0; fig.rHip.rotation.x = 0
      fig.lKnee.rotation.x = 0; fig.rKnee.rotation.x = 0
    },
    animate(fig, t) {
      const press = (Math.sin(t * 1.0) + 1) / 2
      fig.lShoulder.rotation.x = -(0.2 + press * 1.4)
      fig.rShoulder.rotation.x = -(0.2 + press * 1.4)
      fig.lElbow.rotation.x = -(0.1 + press * 0.6)
      fig.rElbow.rotation.x = -(0.1 + press * 0.6)
    },
  },

  'squat': {
    light: 0x06d6a0, bg: '#070f0c',
    bodyColor: 0xf4a261,
    setup(fig) {
      fig.root.position.set(0, -0.2, 0)
    },
    animate(fig, t) {
      const depth = (Math.sin(t * 0.9) + 1) / 2
      // squat depth
      fig.root.position.y = -0.2 - depth * 0.35
      fig.lHip.rotation.x = depth * 1.6
      fig.rHip.rotation.x = depth * 1.6
      fig.lKnee.rotation.x = -(depth * 1.5)
      fig.rKnee.rotation.x = -(depth * 1.5)
      // slight lean
      fig.torso.rotation.x = depth * 0.3
    },
  },

  'pullup': {
    light: 0x4cc9f0, bg: '#07090f',
    bodyColor: 0xf4a261,
    setup(fig, scene) {
      fig.root.position.set(0, -0.4, 0)
      fig.lHip.rotation.x = 0.3; fig.rHip.rotation.x = 0.3
      fig.lKnee.rotation.x = -0.5; fig.rKnee.rotation.x = -0.5
      const barMat = new THREE.MeshPhongMaterial({ color: 0x888899 })
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 12), barMat)
      bar.rotation.z = Math.PI / 2
      bar.position.y = 1.35
      scene.add(bar)
    },
    animate(fig, t) {
      const pull = (Math.sin(t * 1.0) + 1) / 2
      fig.root.position.y = -0.4 + pull * 0.5
      fig.lShoulder.rotation.x = -(1.4 - pull * 0.8)
      fig.rShoulder.rotation.x = -(1.4 - pull * 0.8)
      fig.lElbow.rotation.x = -(1.0 - pull * 0.8)
      fig.rElbow.rotation.x = -(1.0 - pull * 0.8)
    },
  },

  'barbell-row': {
    light: 0x4cc9f0, bg: '#07090f',
    bodyColor: 0xf4a261,
    setup(fig, scene) {
      fig.torso.rotation.x = 0.8
      fig.root.position.set(0, -0.5, 0)
      fig.lHip.rotation.x = -0.2; fig.rHip.rotation.x = -0.2
      const barMat = new THREE.MeshPhongMaterial({ color: 0xaaaacc, shininess: 120 })
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 12), barMat)
      bar.rotation.z = Math.PI / 2
      fig.rowBar = bar
      fig.root.add(bar)
    },
    animate(fig, t) {
      const row = (Math.sin(t * 1.1) + 1) / 2
      fig.lShoulder.rotation.x = 0.2 + row * 0.9
      fig.rShoulder.rotation.x = 0.2 + row * 0.9
      fig.lElbow.rotation.x = row * 1.1
      fig.rElbow.rotation.x = row * 1.1
      if (fig.rowBar) fig.rowBar.position.y = -0.55 + row * 0.3
    },
  },

  'romanian-deadlift': {
    light: 0x06d6a0, bg: '#070f0c',
    bodyColor: 0xf4a261,
    setup(fig, scene) {
      fig.root.position.set(0, -0.5, 0)
      const barMat = new THREE.MeshPhongMaterial({ color: 0xaaaacc, shininess: 120 })
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 12), barMat)
      bar.rotation.z = Math.PI / 2
      fig.rdlBar = bar
      fig.root.add(bar)
    },
    animate(fig, t) {
      const hinge = (Math.sin(t * 0.9) + 1) / 2
      fig.torso.rotation.x = hinge * 0.9
      fig.lHip.rotation.x = hinge * 0.4
      fig.rHip.rotation.x = hinge * 0.4
      fig.lKnee.rotation.x = -(hinge * 0.2)
      fig.rKnee.rotation.x = -(hinge * 0.2)
      if (fig.rdlBar) {
        fig.rdlBar.position.y = -0.5 - hinge * 0.4
        fig.rdlBar.position.z = 0.1 + hinge * 0.05
      }
    },
  },

  'default': {
    light: 0xff7a1a, bg: '#0a0a12',
    bodyColor: 0xf4a261,
    setup(fig) { fig.root.position.set(0, -0.6, 0) },
    animate(fig, t) {
      fig.lShoulder.rotation.x = Math.sin(t * 1.2) * 0.4
      fig.rShoulder.rotation.x = -Math.sin(t * 1.2) * 0.4
      fig.lHip.rotation.x = -Math.sin(t * 1.2) * 0.3
      fig.rHip.rotation.x = Math.sin(t * 1.2) * 0.3
    },
  },
}

/* ─── Build stick figure from Three.js primitives ──────── */
function buildFigure(scene, bodyColor) {
  const mat = (color, emissive = 0x000000) =>
    new THREE.MeshPhongMaterial({ color, emissive, shininess: 60 })

  const skin = mat(bodyColor, 0x110500)
  const cloth = mat(0x2244cc, 0x000511)
  const pant = mat(0x112266, 0x000208)

  function seg(rx, ry, rz, len, material) {
    const g = new THREE.CylinderGeometry(rx, rz, len, 10)
    return new THREE.Mesh(g, material)
  }
  function box(w, h, d, material) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  }
  function sph(r, material) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), material)
  }

  const root = new THREE.Group()

  // Torso
  const torso = box(0.3, 0.44, 0.18, cloth)
  torso.position.y = 0.22
  root.add(torso)

  // Head
  const head = sph(0.13, skin)
  head.position.y = 0.62
  root.add(head)

  // Hips
  const hips = box(0.26, 0.16, 0.15, pant)
  hips.position.y = -0.08
  root.add(hips)

  // ── Arms ─────────────
  function makeArm(side) {
    const shoulderGroup = new THREE.Group()
    shoulderGroup.position.set(side * 0.22, 0.35, 0)

    const upper = seg(0.048, 0.042, 0.048, 0.28, skin)
    upper.position.y = -0.14
    shoulderGroup.add(upper)

    const elbowGroup = new THREE.Group()
    elbowGroup.position.y = -0.28
    const fore = seg(0.04, 0.036, 0.04, 0.26, skin)
    fore.position.y = -0.13
    elbowGroup.add(fore)

    const hand = sph(0.055, skin)
    hand.position.y = -0.26
    elbowGroup.add(hand)

    shoulderGroup.add(elbowGroup)
    root.add(shoulderGroup)
    return { shoulder: shoulderGroup, elbow: elbowGroup }
  }

  const leftArm = makeArm(-1)
  const rightArm = makeArm(1)

  // ── Legs ─────────────
  function makeLeg(side) {
    const hipGroup = new THREE.Group()
    hipGroup.position.set(side * 0.1, -0.16, 0)

    const upper = seg(0.068, 0.062, 0.068, 0.38, pant)
    upper.position.y = -0.19
    hipGroup.add(upper)

    const kneeGroup = new THREE.Group()
    kneeGroup.position.y = -0.38

    const lower = seg(0.056, 0.05, 0.056, 0.35, pant)
    lower.position.y = -0.175
    kneeGroup.add(lower)

    const foot = box(0.1, 0.07, 0.2, pant)
    foot.position.set(0, -0.37, 0.04)
    kneeGroup.add(foot)

    hipGroup.add(kneeGroup)
    root.add(hipGroup)
    return { hip: hipGroup, knee: kneeGroup }
  }

  const leftLeg = makeLeg(-1)
  const rightLeg = makeLeg(1)

  scene.add(root)

  return {
    root,
    torso,
    head,
    lShoulder: leftArm.shoulder,
    lElbow:    leftArm.elbow,
    rShoulder: rightArm.shoulder,
    rElbow:    rightArm.elbow,
    lHip:  leftLeg.hip,
    lKnee: leftLeg.knee,
    rHip:  rightLeg.hip,
    rKnee: rightLeg.knee,
  }
}

/* ─── React component ───────────────────────────────────── */
export default function ExerciseIllustration({ exerciseId }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const config = CONFIGS[exerciseId] ?? CONFIGS['default']
    const W = mount.clientWidth || 320
    const H = mount.clientHeight || 200

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(config.bg)
    scene.fog = new THREE.Fog(config.bg, 6, 14)

    // Camera
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50)
    camera.position.set(0, 0.3, 3.4)
    camera.lookAt(0, 0.2, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0x222233, 2.5))

    const keyLight = new THREE.DirectionalLight(config.light, 3.5)
    keyLight.position.set(2, 3, 2)
    keyLight.castShadow = true
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x334455, 1.5)
    rimLight.position.set(-3, 1, -2)
    scene.add(rimLight)

    // Grid floor
    const grid = new THREE.GridHelper(6, 12, 0x111133, 0x0d0d22)
    grid.position.y = -0.85
    scene.add(grid)

    // Figure
    const fig = buildFigure(scene, config.bodyColor ?? 0xf4a261)
    config.setup(fig, scene)

    // Glow sphere (accent color behind figure)
    const glowGeo = new THREE.SphereGeometry(0.6, 16, 16)
    const glowMat = new THREE.MeshBasicMaterial({
      color: config.light,
      transparent: true,
      opacity: 0.06,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(0, 0.3, -0.5)
    scene.add(glow)

    // Animate
    const clock = new THREE.Clock()
    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      config.animate(fig, t)
      // gentle scene rotation
      scene.rotation.y = Math.sin(t * 0.2) * 0.12
      renderer.render(scene, camera)
    }
    tick()

    // Resize observer
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
