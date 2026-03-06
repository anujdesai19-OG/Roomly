'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Environment } from '@react-three/drei'
import type * as THREE from 'three'
import type { PlanItemData } from '@/types/plan'
import type { RoomType } from '@/types/session'

// Room floor dimensions [width, depth] in 3D units (≈ feet)
const ROOM_DIMS: Record<RoomType, [number, number]> = {
  LIVING_ROOM: [14, 16],
  BEDROOM:     [12, 15],
  DINING_ROOM: [12, 13],
  HOME_OFFICE: [10, 12],
  NURSERY:     [10, 11],
}

// Box sizes [w, h, d] per category
const FURNITURE_SIZE: Record<string, [number, number, number]> = {
  SOFA:          [6.5, 1.5, 2.8],
  COFFEE_TABLE:  [3.5, 0.7, 2.0],
  ARMCHAIR:      [2.5, 2.2, 2.5],
  FLOOR_LAMP:    [0.4, 5.5, 0.4],
  RUG:           [7.0, 0.1, 5.0],
  DINING_TABLE:  [5.0, 1.2, 3.0],
  DINING_CHAIR:  [1.6, 3.0, 1.6],
  BED_FRAME:     [5.8, 1.2, 7.0],
  DRESSER:       [3.5, 3.0, 1.4],
  DESK:          [4.5, 1.2, 2.2],
  DESK_CHAIR:    [2.0, 3.2, 2.0],
  BOOKSHELF:     [2.6, 6.0, 1.0],
  SIDE_TABLE:    [1.6, 1.8, 1.6],
  TABLE_LAMP:    [0.7, 2.2, 0.7],
  STORAGE:       [4.5, 3.0, 1.2],
  MIRROR:        [2.5, 4.5, 0.2],
  ARTWORK:       [3.0, 2.2, 0.2],
  ACCENT_PIECE:  [1.2, 2.5, 1.2],
}

// Default [x, z] positions inside the room (0,0 = room centre)
const FURNITURE_POS: Record<string, [number, number]> = {
  SOFA:          [0,    4.5],
  COFFEE_TABLE:  [0,    1.8],
  ARMCHAIR:      [-4.5, 1.8],
  FLOOR_LAMP:    [-5.5, 4.5],
  RUG:           [0,    3.0],
  DINING_TABLE:  [0,    0],
  DINING_CHAIR:  [0,    0],
  BED_FRAME:     [0,    4.5],
  DRESSER:       [-4.5, -4.0],
  DESK:          [0,    5.0],
  DESK_CHAIR:    [0,    2.8],
  BOOKSHELF:     [-5.0, 0],
  SIDE_TABLE:    [3.5,  4.5],
  TABLE_LAMP:    [3.5,  4.5],
  STORAGE:       [4.5, -4.0],
  MIRROR:        [4.5, -3.0],
  ARTWORK:       [0,   -5.5],
  ACCENT_PIECE:  [3.5, -2.0],
}

// Colours per category
const FURNITURE_COLOR: Record<string, string> = {
  SOFA:         '#8fa5c8',
  COFFEE_TABLE: '#b5976a',
  ARMCHAIR:     '#a08aae',
  FLOOR_LAMP:   '#d4bc96',
  RUG:          '#c8b89e',
  DINING_TABLE: '#b5976a',
  DINING_CHAIR: '#a08aae',
  BED_FRAME:    '#8fa5c8',
  DRESSER:      '#b5976a',
  DESK:         '#c4a87e',
  DESK_CHAIR:   '#7a8c9a',
  BOOKSHELF:    '#a08560',
  SIDE_TABLE:   '#c4a87e',
  TABLE_LAMP:   '#e8d8b4',
  STORAGE:      '#8a927a',
  MIRROR:       '#a8c0d0',
  ARTWORK:      '#c4786a',
  ACCENT_PIECE: '#b09870',
}

function Wall({ w, h, d, x, y, z, color = '#f0ece6' }: {
  w: number; h: number; d: number
  x: number; y: number; z: number
  color?: string
}) {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[w, h, d]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

function FurnitureItem({
  category,
  label,
  x,
  z,
  offsetX = 0,
  offsetZ = 0,
}: {
  category: string
  label: string
  x: number
  z: number
  offsetX?: number
  offsetZ?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [w, h, d] = FURNITURE_SIZE[category] ?? [2, 1.5, 2]
  const color = FURNITURE_COLOR[category] ?? '#aaa'
  const px = x + offsetX
  const pz = z + offsetZ
  const py = h / 2  // sit on the floor

  return (
    <group position={[px, 0, pz]}>
      {/* furniture box */}
      <mesh ref={meshRef} position={[0, py, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* top highlight line */}
      <mesh position={[0, h + 0.05, 0]}>
        <boxGeometry args={[w + 0.05, 0.08, d + 0.05]} />
        <meshLambertMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {/* floating label */}
      <Text
        position={[0, h + 0.8, 0]}
        fontSize={0.55}
        color="#1a1a2e"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#ffffff"
      >
        {label.length > 18 ? label.slice(0, 16) + '…' : label}
      </Text>
    </group>
  )
}

function Room({ roomType, items }: { roomType: RoomType; items: PlanItemData[] }) {
  const [roomW, roomD] = ROOM_DIMS[roomType] ?? [12, 14]
  const wallH = 8
  const wallThick = 0.3

  // Group items by category and assign offsets for duplicates
  const categoryCount: Record<string, number> = {}
  const placedItems = items.map((item) => {
    const cat = item.product.category
    const count = categoryCount[cat] ?? 0
    categoryCount[cat] = count + 1
    const offsetX = count * 1.8
    const offsetZ = count % 2 === 0 ? 0 : -1.5
    return { item, cat, offsetX, offsetZ }
  })

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshLambertMaterial color="#f5f0e8" />
      </mesh>

      {/* Floor grid lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshLambertMaterial color="#e8e0d0" transparent opacity={0.4} wireframe />
      </mesh>

      {/* Back wall */}
      <Wall w={roomW} h={wallH} d={wallThick}
        x={0} y={wallH / 2} z={-(roomD / 2)} color="#f0ece6" />

      {/* Left wall */}
      <Wall w={wallThick} h={wallH} d={roomD}
        x={-(roomW / 2)} y={wallH / 2} z={0} color="#ede9e3" />

      {/* Right wall (shorter, open feel) */}
      <Wall w={wallThick} h={wallH} d={roomD}
        x={roomW / 2} y={wallH / 2} z={0} color="#ede9e3" />

      {/* Ceiling edge trim */}
      <mesh position={[0, wallH, -(roomD / 2 - 0.2)]}>
        <boxGeometry args={[roomW, 0.15, 0.15]} />
        <meshLambertMaterial color="#d8d4ce" />
      </mesh>

      {/* Skirting board */}
      <mesh position={[0, 0.15, -(roomD / 2 - 0.2)]}>
        <boxGeometry args={[roomW, 0.3, 0.15]} />
        <meshLambertMaterial color="#e8e4de" />
      </mesh>

      {/* Furniture items */}
      {placedItems.map(({ item, cat, offsetX, offsetZ }) => {
        const [baseX, baseZ] = FURNITURE_POS[cat] ?? [0, 0]
        // Clamp to within room bounds
        const halfW = roomW / 2 - 1.5
        const halfD = roomD / 2 - 1.5
        const clampedX = Math.max(-halfW, Math.min(halfW, baseX + offsetX))
        const clampedZ = Math.max(-halfD, Math.min(halfD, baseZ + offsetZ))
        return (
          <FurnitureItem
            key={item.id}
            category={cat}
            label={item.product.name}
            x={clampedX}
            z={clampedZ}
          />
        )
      })}
    </group>
  )
}

interface FloorPlan3DProps {
  roomType: RoomType
  items: PlanItemData[]
}

export function FloorPlan3D({ roomType, items }: FloorPlan3DProps) {
  const [roomW, roomD] = ROOM_DIMS[roomType] ?? [12, 14]
  const camDist = Math.max(roomW, roomD) * 1.6

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl border bg-[#f7f4ef]">
      <p className="absolute left-3 top-3 z-10 rounded-md bg-black/20 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
        Drag to rotate · Scroll to zoom
      </p>
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [0, camDist * 0.75, camDist * 0.85], fov: 45 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-8, 10, -6]} intensity={0.4} />

        <Suspense fallback={null}>
          <Room roomType={roomType} items={items} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={camDist + 10}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 2, 0]}
        />
      </Canvas>
    </div>
  )
}
