"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Box, Sphere, Text, OrbitControls, Environment, Cylinder } from "@react-three/drei"
import * as THREE from "three"

interface Vehicle {
  id: string
  x: number
  z: number
  rotation?: number
  speed?: number
  braking?: boolean
  damaged?: boolean
  changing?: boolean
  turning?: boolean
  distracted?: boolean
  speeding?: boolean
}

interface CrashStep {
  time: number
  description: string
  vehicles: Vehicle[]
}

interface CrashSceneProps {
  pattern: string
  isPlaying: boolean
  currentStep: number
  onStepChange: (step: number) => void
  speed: number
}

function AnimatedVehicle({
  vehicle,
  color = 0x2194ce,
  targetPosition,
  targetRotation = 0,
  animationSpeed = 1,
}: {
  vehicle: Vehicle
  color?: number
  targetPosition: [number, number, number]
  targetRotation?: number
  animationSpeed?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const brakeLeftRef = useRef<THREE.Mesh>(null)
  const brakeRightRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const lerpFactor = delta * 2 * animationSpeed

    // Smooth movement animation with speed factor
    groupRef.current.position.lerp(
      new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]),
      lerpFactor,
    )

    // Smooth rotation with speed factor
    const currentRotation = groupRef.current.rotation.y
    const rotationDiff = targetRotation - currentRotation
    groupRef.current.rotation.y += rotationDiff * lerpFactor

    // Enhanced brake light effects
    if (vehicle.braking && brakeLeftRef.current && brakeRightRef.current) {
      const intensity = vehicle.speeding ? 1.0 : 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 15)
      brakeLeftRef.current.material.opacity = intensity
      brakeRightRef.current.material.opacity = intensity
    }

    // Enhanced damage effect with sparks
    if (vehicle.damaged && bodyRef.current) {
      const flash = 0.3 + 0.4 * Math.sin(state.clock.elapsedTime * 8)
      ;(bodyRef.current.material as THREE.MeshPhongMaterial).color.setRGB(flash, 0.1, 0.1)

      // Add shaking effect for damaged vehicles
      groupRef.current.position.x += (Math.random() - 0.5) * 0.05
      groupRef.current.position.z += (Math.random() - 0.5) * 0.05
    }

    // Distraction effect
    if (vehicle.distracted && bodyRef.current) {
      const pulse = 0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 3)
      ;(bodyRef.current.material as THREE.MeshPhongMaterial).color.setRGB(pulse, pulse * 0.8, 0.2)
    }

    // Speeding effect
    if (vehicle.speeding && bodyRef.current) {
      const speedPulse = 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 6)
      ;(bodyRef.current.material as THREE.MeshPhongMaterial).color.setRGB(speedPulse, 0.3, speedPulse * 0.5)
    }
  })

  return (
    <group ref={groupRef} position={targetPosition} rotation={[0, targetRotation, 0]}>
      {/* Enhanced Car Body with better proportions */}
      <Box ref={bodyRef} args={[4.2, 1.6, 1.9]} position={[0, 0.8, 0]} castShadow>
        <meshPhongMaterial
          color={vehicle.damaged ? 0x8b0000 : vehicle.distracted ? 0xffaa00 : vehicle.speeding ? 0xff6600 : color}
          shininess={80}
          specular={0x222222}
        />
      </Box>

      {/* Enhanced Windshield */}
      <Box args={[2.8, 0.9, 1.7]} position={[0.6, 1.5, 0]}>
        <meshPhongMaterial color={0x87ceeb} transparent opacity={0.7} reflectivity={0.8} />
      </Box>

      {/* Hood */}
      <Box args={[1.5, 0.3, 1.8]} position={[1.3, 1.0, 0]}>
        <meshPhongMaterial color={vehicle.damaged ? 0x666666 : color} shininess={60} />
      </Box>

      {/* Enhanced Wheels with rims */}
      {[
        [-1.4, 0.35, -1.1],
        [-1.4, 0.35, 1.1],
        [1.4, 0.35, -1.1],
        [1.4, 0.35, 1.1],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          <Cylinder args={[0.35, 0.35, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshLambertMaterial color={0x1a1a1a} />
          </Cylinder>
          <Cylinder args={[0.25, 0.25, 0.32]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhongMaterial color={0x888888} shininess={100} />
          </Cylinder>
        </group>
      ))}

      {/* Enhanced Brake Lights */}
      <Sphere ref={brakeLeftRef} args={[0.15]} position={[-2.0, 0.8, -0.8]}>
        <meshBasicMaterial color={0xff0000} transparent opacity={vehicle.braking ? 1.0 : 0.2} />
      </Sphere>
      <Sphere ref={brakeRightRef} args={[0.15]} position={[-2.0, 0.8, 0.8]}>
        <meshBasicMaterial color={0xff0000} transparent opacity={vehicle.braking ? 1.0 : 0.2} />
      </Sphere>

      {/* Headlights */}
      <Sphere args={[0.12]} position={[2.0, 0.8, -0.7]}>
        <meshBasicMaterial color={0xffffcc} transparent opacity={0.8} />
      </Sphere>
      <Sphere args={[0.12]} position={[2.0, 0.8, 0.7]}>
        <meshBasicMaterial color={0xffffcc} transparent opacity={0.8} />
      </Sphere>

      {/* Vehicle ID Label with better styling */}
      <Text position={[0, 2.8, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {vehicle.id.toUpperCase()}
      </Text>

      {/* Speed indicator for speeding vehicles */}
      {vehicle.speeding && (
        <Text position={[0, 2.3, 0]} fontSize={0.3} color="red" anchorX="center" anchorY="middle">
          SPEEDING
        </Text>
      )}

      {/* Distraction indicator */}
      {vehicle.distracted && (
        <Text position={[0, 2.3, 0]} fontSize={0.3} color="orange" anchorX="center" anchorY="middle">
          DISTRACTED
        </Text>
      )}
    </group>
  )
}

function RoadEnvironment({ pattern }: { pattern: string }) {
  const isIntersection = pattern.includes("intersection")
  const isRoadRight = pattern.includes("road-right")

  if (isIntersection) {
    return (
      <group>
        {/* Main Road (North-South) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[22, 80]} />
          <meshLambertMaterial color={0x2a2a2a} />
        </mesh>

        {/* Cross Road (East-West) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 22]} />
          <meshLambertMaterial color={0x2a2a2a} />
        </mesh>

        {/* Intersection Lane Markings */}
        <Box args={[0.4, 0.03, 35]} position={[-3.5, 0.01, 0]}>
          <meshBasicMaterial color={0xffffff} />
        </Box>
        <Box args={[0.4, 0.03, 35]} position={[3.5, 0.01, 0]}>
          <meshBasicMaterial color={0xffffff} />
        </Box>
        <Box args={[35, 0.03, 0.4]} position={[0, 0.01, -3.5]}>
          <meshBasicMaterial color={0xffffff} />
        </Box>
        <Box args={[35, 0.03, 0.4]} position={[0, 0.01, 3.5]}>
          <meshBasicMaterial color={0xffffff} />
        </Box>

        {/* Stop signs */}
        <group position={[8, 0, 8]}>
          <Box args={[0.2, 3, 0.2]} position={[0, 1.5, 0]}>
            <meshLambertMaterial color={0x444444} />
          </Box>
          <Box args={[0.8, 0.8, 0.1]} position={[0, 2.5, 0]}>
            <meshBasicMaterial color={0xff0000} />
          </Box>
        </group>

        {/* Traffic lights */}
        <group position={[-8, 0, -8]}>
          <Box args={[0.3, 4, 0.3]} position={[0, 2, 0]}>
            <meshLambertMaterial color={0x333333} />
          </Box>
          <Sphere args={[0.2]} position={[0, 3.5, 0]}>
            <meshBasicMaterial color={0xff0000} />
          </Sphere>
          <Sphere args={[0.2]} position={[0, 3.0, 0]}>
            <meshBasicMaterial color={0xffff00} />
          </Sphere>
          <Sphere args={[0.2]} position={[0, 2.5, 0]}>
            <meshBasicMaterial color={0x00ff00} />
          </Sphere>
        </group>
      </group>
    )
  }

  if (isRoadRight) {
    return (
      <group>
        {/* Curved road section */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 25]} />
          <meshLambertMaterial color={0x2a2a2a} />
        </mesh>

        {/* Curved lane markings */}
        {Array.from({ length: 15 }, (_, i) => {
          const angle = (i - 7) * 0.3
          const radius = 20
          const x = Math.sin(angle) * radius
          const z = Math.cos(angle) * radius - 10
          return (
            <Box key={i} args={[3, 0.03, 0.4]} position={[x, 0.01, z]} rotation={[0, angle, 0]}>
              <meshBasicMaterial color={0xffffff} />
            </Box>
          )
        })}

        {/* Road barriers for curve */}
        <Box args={[60, 1, 0.5]} position={[0, 0.5, -20]} castShadow>
          <meshLambertMaterial color={0x666666} />
        </Box>
        <Box args={[60, 1, 0.5]} position={[0, 0.5, 15]} castShadow>
          <meshLambertMaterial color={0x666666} />
        </Box>

        {/* Curve warning signs */}
        <group position={[15, 0, -15]}>
          <Box args={[0.2, 3, 0.2]} position={[0, 1.5, 0]}>
            <meshLambertMaterial color={0x444444} />
          </Box>
          <Box args={[1, 1, 0.1]} position={[0, 2.5, 0]}>
            <meshBasicMaterial color={0xffff00} />
          </Box>
        </group>
      </group>
    )
  }

  // Regular straight road
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 25]} />
        <meshLambertMaterial color={0x2a2a2a} />
      </mesh>

      {/* Enhanced lane markings */}
      {Array.from({ length: 13 }, (_, i) => (
        <group key={i}>
          <Box args={[3.5, 0.03, 0.4]} position={[i * 6 - 36, 0.01, 0]}>
            <meshBasicMaterial color={0xffffff} />
          </Box>
          <Box args={[3.5, 0.03, 0.4]} position={[i * 6 - 36, 0.01, -8]}>
            <meshBasicMaterial color={0xffffff} />
          </Box>
          <Box args={[3.5, 0.03, 0.4]} position={[i * 6 - 36, 0.01, 8]}>
            <meshBasicMaterial color={0xffffff} />
          </Box>
        </group>
      ))}

      {/* Road barriers */}
      <Box args={[80, 1, 0.5]} position={[0, 0.5, -15]} castShadow>
        <meshLambertMaterial color={0x666666} />
      </Box>
      <Box args={[80, 1, 0.5]} position={[0, 0.5, 15]} castShadow>
        <meshLambertMaterial color={0x666666} />
      </Box>
    </group>
  )
}

function EnhancedDamageParticles({
  position,
  intensity = 1,
}: { position: [number, number, number]; intensity?: number }) {
  const particlesRef = useRef<THREE.Group>(null)
  const sparkRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!particlesRef.current || !sparkRef.current) return

    // Debris particles
    particlesRef.current.children.forEach((particle, i) => {
      particle.position.y += delta * (2 + i * 0.1)
      particle.position.x += Math.sin(state.clock.elapsedTime + i) * delta * 0.5
      particle.position.z += Math.cos(state.clock.elapsedTime + i) * delta * 0.5
      particle.rotation.x += delta * 3
      particle.rotation.y += delta * 2

      if (particle.position.y > 6) {
        particle.position.y = 0
        particle.position.x = position[0] + (Math.random() - 0.5) * 4
        particle.position.z = position[2] + (Math.random() - 0.5) * 4
      }
    })

    // Sparks
    sparkRef.current.children.forEach((spark, i) => {
      spark.position.y += delta * (3 + i * 0.2)
      spark.position.x += (Math.random() - 0.5) * delta * 2
      spark.position.z += (Math.random() - 0.5) * delta * 2

      if (spark.position.y > 4) {
        spark.position.y = 0.5
        spark.position.x = position[0] + (Math.random() - 0.5) * 2
        spark.position.z = position[2] + (Math.random() - 0.5) * 2
      }
    })
  })

  return (
    <group position={position}>
      {/* Debris particles */}
      <group ref={particlesRef}>
        {Array.from({ length: Math.floor(15 * intensity) }, (_, i) => (
          <Sphere
            key={i}
            args={[0.06 + Math.random() * 0.04]}
            position={[(Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 4]}
          >
            <meshBasicMaterial
              color={Math.random() > 0.6 ? 0xff4444 : Math.random() > 0.3 ? 0xffaa44 : 0x888888}
              transparent
              opacity={0.8}
            />
          </Sphere>
        ))}
      </group>

      {/* Sparks */}
      <group ref={sparkRef}>
        {Array.from({ length: Math.floor(8 * intensity) }, (_, i) => (
          <Sphere
            key={i}
            args={[0.02]}
            position={[(Math.random() - 0.5) * 2, 0.5 + Math.random(), (Math.random() - 0.5) * 2]}
          >
            <meshBasicMaterial color={0xffff00} transparent opacity={0.9} />
          </Sphere>
        ))}
      </group>
    </group>
  )
}

export function CrashScene({ pattern, isPlaying, currentStep, onStepChange, speed }: CrashSceneProps) {
  const [showDamageEffect, setShowDamageEffect] = useState(false)
  const [damagePosition, setDamagePosition] = useState<[number, number, number]>([0, 1, 0])
  const [damageIntensity, setDamageIntensity] = useState(1)

  // Memoize crash scenarios to prevent recreation on every render
  const crashScenarios = {
    "intersection-complexity": [
      {
        time: 0,
        description: "V1 approaches intersection from south, V2 from west at high speed",
        vehicles: [
          { id: "v1", x: 0, z: -18, rotation: 0 },
          { id: "v2", x: -18, z: 0, rotation: 90, speeding: true },
        ],
      },
      {
        time: 1,
        description: "Both vehicles approach intersection, V2 not slowing down",
        vehicles: [
          { id: "v1", x: 0, z: -10 },
          { id: "v2", x: -10, z: 0, rotation: 90, speeding: true },
        ],
      },
      {
        time: 2,
        description: "V1 enters intersection, V2 realizes danger and brakes hard",
        vehicles: [
          { id: "v1", x: 0, z: -3 },
          { id: "v2", x: -5, z: 0, rotation: 90, braking: true },
        ],
      },
      {
        time: 3,
        description: "Critical moment - V2 cannot stop in time, begins evasive turn",
        vehicles: [
          { id: "v1", x: 0, z: 1 },
          { id: "v2", x: -2, z: -1, rotation: 60, braking: true },
        ],
      },
      {
        time: 4,
        description: "High-speed T-bone collision in intersection center",
        vehicles: [
          { id: "v1", x: 1, z: 2, damaged: true, rotation: 25 },
          { id: "v2", x: 2, z: 0, damaged: true, rotation: 75 },
        ],
      },
    ],

    "road-right": [
      {
        time: 0,
        description: "V1 approaching sharp right curve at excessive speed",
        vehicles: [{ id: "v1", x: -20, z: -5, rotation: 0, speeding: true }],
      },
      {
        time: 1,
        description: "V1 enters curve without reducing speed sufficiently",
        vehicles: [{ id: "v1", x: -12, z: -3, rotation: 15, speeding: true }],
      },
      {
        time: 2,
        description: "V1 realizes curve is tighter than expected, brakes hard",
        vehicles: [{ id: "v1", x: -5, z: 0, rotation: 30, braking: true }],
      },
      {
        time: 3,
        description: "Vehicle begins to understeer, losing control on curve",
        vehicles: [{ id: "v1", x: 2, z: 3, rotation: 45, braking: true }],
      },
      {
        time: 4,
        description: "V1 runs off road and crashes into barrier",
        vehicles: [{ id: "v1", x: 8, z: 8, rotation: 60, damaged: true }],
      },
    ],

    "vehicle-lane": [
      {
        time: 0,
        description: "V1 in left lane, V2 approaching faster in right lane",
        vehicles: [
          { id: "v1", x: -18, z: -4, rotation: 0 },
          { id: "v2", x: -25, z: 4, rotation: 0, speeding: true },
        ],
      },
      {
        time: 1,
        description: "V2 gaining rapidly on V1, both vehicles advancing",
        vehicles: [
          { id: "v1", x: -12, z: -4 },
          { id: "v2", x: -15, z: 4, speeding: true },
        ],
      },
      {
        time: 2,
        description: "V1 begins sudden lane change without proper checking",
        vehicles: [
          { id: "v1", x: -6, z: -1, changing: true, rotation: 15 },
          { id: "v2", x: -5, z: 4, speeding: true },
        ],
      },
      {
        time: 3,
        description: "Critical moment - V1 moves into V2's path, V2 emergency brakes",
        vehicles: [
          { id: "v1", x: -1, z: 2, changing: true, rotation: 25 },
          { id: "v2", x: 1, z: 3, braking: true },
        ],
      },
      {
        time: 4,
        description: "High-speed side-impact collision",
        vehicles: [
          { id: "v1", x: 3, z: 3, damaged: true, rotation: 35 },
          { id: "v2", x: 4, z: 3.5, damaged: true, rotation: -10 },
        ],
      },
    ],

    "vehicle-driver-critical": [
      {
        time: 0,
        description: "V1 distracted driver, V2 approaching from behind",
        vehicles: [
          { id: "v1", x: -10, z: 0, rotation: 0, distracted: true },
          { id: "v2", x: -20, z: 0, rotation: 0 },
        ],
      },
      {
        time: 1,
        description: "V1 suddenly brakes due to distraction, V2 closing distance",
        vehicles: [
          { id: "v1", x: -8, z: 0, braking: true, distracted: true },
          { id: "v2", x: -15, z: 0 },
        ],
      },
      {
        time: 2,
        description: "V2 realizes V1 has stopped, begins emergency braking",
        vehicles: [
          { id: "v1", x: -6, z: 0, braking: true },
          { id: "v2", x: -10, z: 0, braking: true },
        ],
      },
      {
        time: 3,
        description: "V2 cannot stop in time, attempts lane change",
        vehicles: [
          { id: "v1", x: -5, z: 0, braking: true },
          { id: "v2", x: -7, z: -2, braking: true, changing: true, rotation: -15 },
        ],
      },
      {
        time: 4,
        description: "Severe rear-end collision with high injury potential",
        vehicles: [
          { id: "v1", x: -3, z: 0, damaged: true, rotation: 10 },
          { id: "v2", x: -4, z: -1, damaged: true, rotation: -20 },
        ],
      },
    ],

    "intersection-secondary": [
      {
        time: 0,
        description: "V1 approaching intersection, V2 making left turn",
        vehicles: [
          { id: "v1", x: 0, z: -15, rotation: 0 },
          { id: "v2", x: -12, z: -8, rotation: 45, turning: true },
        ],
      },
      {
        time: 1,
        description: "V1 continues straight, V2 completing turn into V1's path",
        vehicles: [
          { id: "v1", x: 0, z: -8 },
          { id: "v2", x: -6, z: -4, rotation: 90, turning: true },
        ],
      },
      {
        time: 2,
        description: "Both drivers see each other, begin evasive actions",
        vehicles: [
          { id: "v1", x: 0, z: -3, braking: true },
          { id: "v2", x: -2, z: -2, rotation: 100, braking: true },
        ],
      },
      {
        time: 3,
        description: "Insufficient time to avoid collision",
        vehicles: [
          { id: "v1", x: 0, z: 0, braking: true },
          { id: "v2", x: 0, z: -1, rotation: 110, braking: true },
        ],
      },
      {
        time: 4,
        description: "Intersection collision with moderate severity",
        vehicles: [
          { id: "v1", x: 1, z: 1, damaged: true, rotation: 15 },
          { id: "v2", x: 1, z: 0, damaged: true, rotation: 120 },
        ],
      },
    ],
  }

  const currentScenario = crashScenarios[pattern as keyof typeof crashScenarios] || crashScenarios["vehicle-lane"]
  const currentStepData = currentScenario[currentStep] || currentScenario[0]

  // Use useCallback to prevent function recreation on every render
  const updateDamageEffect = useCallback(() => {
    const damagedVehicles = currentStepData.vehicles.filter((v) => v.damaged)
    if (damagedVehicles.length > 0) {
      const primaryDamaged = damagedVehicles[0]
      setDamagePosition([primaryDamaged.x, 1, primaryDamaged.z])

      // Set damage intensity based on pattern severity
      const severityMap: Record<string, number> = {
        "vehicle-driver-critical": 2.42,
        "intersection-complexity": 2.15,
        "intersection-secondary": 1.82,
        "road-right": 1.73,
        "vehicle-lane": 1.7,
      }
      setDamageIntensity(severityMap[pattern] || 1.0)
      setShowDamageEffect(true)
    } else {
      setShowDamageEffect(false)
    }
  }, [currentStepData.vehicles, pattern])

  // Update damage effect when step data changes
  useEffect(() => {
    updateDamageEffect()
  }, [updateDamageEffect])

  // Animation effect for auto-advancing steps when playing
  useEffect(() => {
    let animationTimer: NodeJS.Timeout

    if (isPlaying && currentStep < currentScenario.length - 1) {
      const delay = 2500 / speed

      animationTimer = setTimeout(() => {
        onStepChange(currentStep + 1)
      }, delay)
    }

    return () => {
      if (animationTimer) clearTimeout(animationTimer)
    }
  }, [isPlaying, currentStep, currentScenario.length, onStepChange, speed])

  const vehicleColors = {
    v1: 0x2194ce,
    v2: 0xff4444,
    v3: 0x44ff44,
  }

  return (
    <div className="h-96 w-full relative">
      <Canvas camera={{ position: [25, 18, 25], fov: 65 }} shadows>
        <Environment preset="night" />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[40, 40, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <pointLight position={[0, 10, 0]} intensity={0.3} color={0xffffff} />

        <RoadEnvironment pattern={pattern} />

        {currentStepData.vehicles.map((vehicle) => (
          <AnimatedVehicle
            key={vehicle.id}
            vehicle={vehicle}
            color={vehicleColors[vehicle.id as keyof typeof vehicleColors] || 0x888888}
            targetPosition={[vehicle.x, 0, vehicle.z]}
            targetRotation={((vehicle.rotation || 0) * Math.PI) / 180}
            animationSpeed={speed}
          />
        ))}

        {showDamageEffect && <EnhancedDamageParticles position={damagePosition} intensity={damageIntensity / 2} />}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={15}
          maxDistance={60}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Enhanced Step Description Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
        <div className="text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 font-bold text-lg">
              Step {currentStep + 1} of {currentScenario.length}
            </span>
            <span className="text-slate-300 text-sm">Pattern: {pattern.replace("-", " ").toUpperCase()}</span>
          </div>
          <p className="text-sm leading-relaxed">{currentStepData.description}</p>
        </div>
      </div>
    </div>
  )
}
