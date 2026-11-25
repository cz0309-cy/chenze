<template>
  <div class="cosmos-scene" ref="host">
    <canvas ref="cv"></canvas>
    <div v-if="failed" class="scene-fallback">当前环境不支持 WebGL，已切换为静态星图背景。</div>
  </div>
</template>

<script setup>
/**
 * 宇宙尺度星尘场景（three.js）
 * - 粒子星尘：每个层级有独立的空间形态与配色，切换时平滑插值过渡
 * - 中心发光核：随层级变色 / 缩放
 * - 相机距离随层级缩放；zoom 由外部滚轮控制
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  layers: { type: Array, required: true },
  active: { type: Number, default: -1 }, // -1 = 全景
  zoom: { type: Number, default: 1 }     // 用户缩放系数，越小越近
})

const host = ref(null)
const cv = ref(null)
const failed = ref(false)

let renderer, scene, camera, points, geo, mat, core, coreMat, raf = 0
let ro = null
const COUNT = 1600
const seeds = new Float32Array(COUNT * 3)
for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random()

// 当前 / 目标 位置与颜色
let curPos = new Float32Array(COUNT * 3)
let curCol = new Float32Array(COUNT * 3)
let fromPos = new Float32Array(COUNT * 3)
let toPos = new Float32Array(COUNT * 3)
let fromCol = new Float32Array(COUNT * 3)
let toCol = new Float32Array(COUNT * 3)
let morph = 1
let camZ = 300, camTargetZ = 300
let coreColor = new THREE.Color('#ffd479'), coreTargetColor = new THREE.Color('#ffd479')
let spin = 0.0004

function shapeFor(layer, out) {
  const kind = layer ? layer.shape : 'panorama'
  for (let i = 0; i < COUNT; i++) {
    const a = seeds[i * 3], b = seeds[i * 3 + 1], c = seeds[i * 3 + 2]
    let x, y, z
    if (kind === 'earth') {
      const th = Math.acos(2 * a - 1), ph = 2 * Math.PI * b, r = 26 + c * 5
      x = r * Math.sin(th) * Math.cos(ph); y = r * Math.cos(th); z = r * Math.sin(th) * Math.sin(ph)
    } else if (kind === 'solar') {
      const r = 12 + a * 70, ang = b * Math.PI * 2
      x = Math.cos(ang) * r; z = Math.sin(ang) * r; y = (c - 0.5) * 6
    } else if (kind === 'galaxy') {
      const arm = i % 4, r = 14 + a * 78
      const ang = r * 0.09 + arm * (Math.PI / 2) + (c - 0.5) * 0.5
      x = Math.cos(ang) * r; z = Math.sin(ang) * r; y = (b - 0.5) * 8
    } else if (kind === 'cluster') {
      const cx = [(-1) ** (i % 2)] * 34, cz = [(-1) ** (Math.floor(i / 2) % 2)] * 34
      x = cx + (a - 0.5) * 40; z = cz + (b - 0.5) * 40; y = (c - 0.5) * 26
    } else if (kind === 'ocean') {
      x = (a - 0.5) * 190; z = (b - 0.5) * 190
      y = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 9 + (c - 0.5) * 5
    } else if (kind === 'grid') {
      const cols = 40
      x = ((i % cols) - cols / 2) * 4.2 + (a - 0.5) * 2
      z = (Math.floor(i / cols) - COUNT / cols / 2) * 4.2 + (b - 0.5) * 2
      y = (c - 0.5) * 5
    } else if (kind === 'dark') {
      const r = 30 + a * 90, ang = b * Math.PI * 2
      x = Math.cos(ang) * r; z = Math.sin(ang) * r; y = (c - 0.5) * 40
    } else { // panorama
      const th = Math.acos(2 * a - 1), ph = 2 * Math.PI * b, r = 60 + c * 90
      x = r * Math.sin(th) * Math.cos(ph); y = r * Math.cos(th); z = r * Math.sin(th) * Math.sin(ph)
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z
  }
}

function colorFor(layer, out) {
  const base = new THREE.Color(layer ? layer.color : '#9fb4ff')
  const alt = new THREE.Color(layer ? (layer.color2 || '#ffd479') : '#ffd479')
  const tmp = new THREE.Color()
  for (let i = 0; i < COUNT; i++) {
    const t = seeds[i * 3 + 2]
    tmp.copy(base).lerp(alt, t * 0.55)
    const glow = 0.55 + seeds[i * 3] * 0.45
    out[i * 3] = tmp.r * glow; out[i * 3 + 1] = tmp.g * glow; out[i * 3 + 2] = tmp.b * glow
  }
}

function transitionTo(index) {
  const layer = index >= 0 ? props.layers[index] : null
  shapeFor(layer, toPos)
  colorFor(layer, toCol)
  fromPos = new Float32Array(curPos)
  fromCol = new Float32Array(curCol)
  morph = 0
  camTargetZ = (layer ? layer.camZ : 300)
  coreTargetColor = new THREE.Color(layer ? layer.color : '#ffd479')
  spin = layer ? layer.spin || 0.0004 : 0.00025
}

function animate() {
  raf = requestAnimationFrame(animate)
  if (!renderer) return
  if (morph < 1) {
    morph = Math.min(1, morph + 0.02)
    const e = 1 - Math.pow(1 - morph, 3)
    for (let i = 0; i < curPos.length; i++) {
      curPos[i] = fromPos[i] + (toPos[i] - fromPos[i]) * e
      curCol[i] = fromCol[i] + (toCol[i] - fromCol[i]) * e
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true
  }
  camZ += (camTargetZ * props.zoom - camZ) * 0.08
  camera.position.z = camZ
  coreColor.lerp(coreTargetColor, 0.05)
  coreMat.color.copy(coreColor)
  coreMat.opacity = 0.55 + Math.sin(performance.now() * 0.0012) * 0.12
  points.rotation.y += spin
  points.rotation.x = Math.sin(performance.now() * 0.0002) * 0.08
  core.scale.setScalar(1 + Math.sin(performance.now() * 0.001) * 0.08)
  renderer.render(scene, camera)
}

function resize() {
  if (!renderer || !host.value) return
  const w = host.value.clientWidth, h = host.value.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv.value, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2000)
    camZ = camTargetZ = 300
    camera.position.z = camZ

    geo = new THREE.BufferGeometry()
    curPos = new Float32Array(COUNT * 3)
    curCol = new Float32Array(COUNT * 3)
    shapeFor(null, curPos)
    colorFor(null, curCol)
    geo.setAttribute('position', new THREE.BufferAttribute(curPos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(curCol, 3))
    mat = new THREE.PointsMaterial({
      size: 1.6, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.9, depthWrite: false,
      blending: THREE.AdditiveBlending, map: spriteTexture()
    })
    points = new THREE.Points(geo, mat)
    scene.add(points)

    // 中心发光核
    const sg = new THREE.SphereGeometry(9, 24, 24)
    coreMat = new THREE.MeshBasicMaterial({
      color: 0xffd479, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
    core = new THREE.Mesh(sg, coreMat)
    scene.add(core)

    resize()
    ro = new ResizeObserver(resize)
    ro.observe(host.value)
    animate()
    transitionTo(props.active)
  } catch (e) {
    failed.value = true
  }
}

function spriteTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

watch(() => props.active, (v) => { if (renderer) transitionTo(v) })
watch(() => props.zoom, () => { /* 在 animate 中读取，实时生效 */ })

onMounted(init)
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (ro) ro.disconnect()
  if (geo) geo.dispose()
  if (mat) { if (mat.map) mat.map.dispose(); mat.dispose() }
  if (core && core.geometry) core.geometry.dispose()
  if (coreMat) coreMat.dispose()
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.cosmos-scene { position: absolute; inset: 0; overflow: hidden; border-radius: 16px; }
canvas { display: block; width: 100%; height: 100%; }
.scene-fallback {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: var(--muted); font-size: 12px; letter-spacing: 2px;
  background: radial-gradient(circle at 50% 50%, rgba(102,224,255,.12), transparent 60%);
}
</style>
