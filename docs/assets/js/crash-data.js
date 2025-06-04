/**
 * 3D Crash Scene Reconstruction Dashboard
 * Crash Pattern Data and Global Variables
 */

// Global variables
let scene, camera, renderer;
let vehicles = {};
let currentPattern = null;
let currentStep = 0;
let isPlaying = false;
let animationSpeed = 1.0;
let cameraMode = 'default';
let autoRotateEnabled = false;

// Crash patterns data with realistic accident scenarios
const crashPatterns = {
    'vehicle-lane-critical': {
        name: 'Vehicle-Lane Critical',
        description: 'Lane management failure leading to multi-vehicle collision',
        riskScore: 1.70,
        frequency: 'Very High',
        demographics: ['young-male', 'all'],
        steps: [
            { 
                time: 0, 
                description: 'Vehicle 1 in left lane, Vehicle 2 approaching faster in right lane', 
                vehicles: [
                    {id: 'v1', x: -15, z: -3, speed: 1.0, rotation: 0}, 
                    {id: 'v2', x: -20, z: 3, speed: 1.3, rotation: 0}
                ] 
            },
            { 
                time: 1, 
                description: 'Both vehicles advancing, V2 gaining on V1', 
                vehicles: [
                    {id: 'v1', x: -10, z: -3}, 
                    {id: 'v2', x: -12, z: 3, speed: 1.3}
                ] 
            },
            { 
                time: 2, 
                description: 'V1 begins sudden lane change without checking blind spot', 
                vehicles: [
                    {id: 'v1', x: -5, z: -1, changing: true, rotation: 10}, 
                    {id: 'v2', x: -4, z: 3, speed: 1.3}
                ] 
            },
            { 
                time: 3, 
                description: 'Critical moment - V1 moves into V2 path, V2 brakes hard', 
                vehicles: [
                    {id: 'v1', x: -1, z: 1, changing: true, rotation: 20}, 
                    {id: 'v2', x: 0, z: 2.5, braking: true, emergency_brake: true}
                ] 
            },
            { 
                time: 4, 
                description: 'Side-impact collision as V2 cannot avoid V1', 
                vehicles: [
                    {id: 'v1', x: 2, z: 2, damaged: true, rotation: 25}, 
                    {id: 'v2', x: 3, z: 2.5, damaged: true, rotation: -15}
                ] 
            }
        ]
    },
    
    'intersection-complexity': {
        name: 'Intersection Complexity',
        description: 'Complex intersection with right-of-way violation',
        riskScore: 2.15,
        frequency: 'High',
        demographics: ['senior-male', 'all'],
        steps: [
            { 
                time: 0, 
                description: 'V1 approaches intersection from south, V2 from west', 
                vehicles: [
                    {id: 'v1', x: 0, z: -15, rotation: 0}, 
                    {id: 'v2', x: -15, z: 0, rotation: 90}
                ] 
            },
            { 
                time: 1, 
                description: 'Both vehicles approach intersection simultaneously', 
                vehicles: [
                    {id: 'v1', x: 0, z: -8}, 
                    {id: 'v2', x: -8, z: 0}
                ] 
            },
            { 
                time: 2, 
                description: 'V1 enters intersection assuming right-of-way', 
                vehicles: [
                    {id: 'v1', x: 0, z: -2}, 
                    {id: 'v2', x: -4, z: 0, turning: true}
                ] 
            },
            { 
                time: 3, 
                description: 'V2 runs stop sign and begins left turn into V1 path', 
                vehicles: [
                    {id: 'v1', x: 0, z: 1}, 
                    {id: 'v2', x: -1, z: -1, turning: true, rotation: 45}
                ] 
            },
            { 
                time: 4, 
                description: 'T-bone collision in intersection center', 
                vehicles: [
                    {id: 'v1', x: 0, z: 2, damaged: true, rotation: 15}, 
                    {id: 'v2', x: 1, z: 0, damaged: true, rotation: 60}
                ] 
            }
        ]
    },
    
    'vehicle-driver-critical': {
        name: 'Vehicle-Driver Critical',
        description: 'Driver distraction leading to rear-end collision',
        riskScore: 2.42,
        frequency: 'Medium',
        demographics: ['female', 'all'],
        steps: [
            { 
                time: 0, 
                description: 'Normal following distance on highway', 
                vehicles: [
                    {id: 'v1', x: -12, z: 0, speed: 1.0}, 
                    {id: 'v2', x: 0, z: 0, speed: 1.0}
                ] 
            },
            { 
                time: 1, 
                description: 'Traffic ahead slows, lead vehicle begins braking', 
                vehicles: [
                    {id: 'v1', x: -8, z: 0}, 
                    {id: 'v2', x: 2, z: 0, braking: true}
                ] 
            },
            { 
                time: 2, 
                description: 'Following driver distracted by phone, misses brake lights', 
                vehicles: [
                    {id: 'v1', x: -4, z: 0, distracted: true}, 
                    {id: 'v2', x: 4, z: 0, braking: true, stopped: true}
                ] 
            },
            { 
                time: 3, 
                description: 'Driver looks up, realizes danger, emergency braking', 
                vehicles: [
                    {id: 'v1', x: 0, z: 0, emergency_brake: true}, 
                    {id: 'v2', x: 5, z: 0, stopped: true}
                ] 
            },
            { 
                time: 4, 
                description: 'Insufficient braking distance - rear-end collision', 
                vehicles: [
                    {id: 'v1', x: 4, z: 0, damaged: true}, 
                    {id: 'v2', x: 6, z: 0, damaged: true}
                ] 
            }
        ]
    },
    
    'road-right-navigation': {
        name: 'Road-Right Navigation', 
        description: 'Curve navigation failure in adverse conditions',
        riskScore: 1.73,
        frequency: 'High',
        demographics: ['young-male', 'all'],
        steps: [
            { 
                time: 0, 
                description: 'Vehicle approaches sharp curve at excessive speed', 
                vehicles: [{id: 'v1', x: -12, z: -4, speed: 1.2, rotation: 0}] 
            },
            { 
                time: 1, 
                description: 'Entering curve, speed still too high for conditions', 
                vehicles: [{id: 'v1', x: -6, z: -2, speed: 1.2, rotation: 15}] 
            },
            { 
                time: 2, 
                description: 'Mid-curve - physics take over, understeer begins', 
                vehicles: [{id: 'v1', x: 0, z: 0, understeer: true, rotation: 30}] 
            },
            { 
                time: 3, 
                description: 'Loss of control - vehicle slides toward outside of curve', 
                vehicles: [{id: 'v1', x: 4, z: 3, sliding: true, rotation: 60}] 
            },
            { 
                time: 4, 
                description: 'Vehicle leaves roadway and impacts barrier', 
                vehicles: [{id: 'v1', x: 7, z: 6, crashed: true, rotation: 90}] 
            }
        ]
    }
};