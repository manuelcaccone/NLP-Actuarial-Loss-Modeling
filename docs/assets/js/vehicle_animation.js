/**
 * Vehicle Animation and State Management Functions
 */

function updateVehiclePositions(stepIndex, animate = true) {
    if (!currentPattern || stepIndex < 0 || stepIndex >= currentPattern.steps.length) {
        return;
    }

    const step = currentPattern.steps[stepIndex];
    console.log(`Updating vehicles for step ${stepIndex}:`, step.description);
    
    // Highlight current step in timeline
    document.querySelectorAll('.scenario-step').forEach((el, index) => {
        el.classList.toggle('active', index === stepIndex);
    });

    // Update each vehicle in the step
    step.vehicles.forEach(vehicleData => {
        const vehicle = vehicles[vehicleData.id];
        if (!vehicle) {
            console.warn(`Vehicle ${vehicleData.id} not found`);
            return;
        }

        const targetPosition = new THREE.Vector3(vehicleData.x, 0, vehicleData.z);
        const targetRotation = (vehicleData.rotation || 0) * Math.PI / 180;

        if (animate && !vehicle.userData.isAnimating) {
            animateVehicle(vehicle, targetPosition, targetRotation, vehicleData);
        } else {
            // Instant positioning
            vehicle.position.copy(targetPosition);
            vehicle.rotation.y = targetRotation;
            updateVehicleState(vehicle, vehicleData);
        }
    });
}

function animateVehicle(vehicle, targetPosition, targetRotation, vehicleData) {
    vehicle.userData.isAnimating = true;
    
    const startPosition = vehicle.position.clone();
    const startRotation = vehicle.rotation.y;
    const duration = 800 / animationSpeed;
    const startTime = performance.now();

    function animateFrame(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        
        // Interpolate position and rotation
        vehicle.position.lerpVectors(startPosition, targetPosition, easeProgress);
        vehicle.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
        
        // Update visual state during animation
        updateVehicleState(vehicle, vehicleData);
        
        if (progress < 1) {
            requestAnimationFrame(animateFrame);
        } else {
            vehicle.userData.isAnimating = false;
            console.log(`Vehicle ${vehicleData.id} animation complete`);
        }
    }
    
    requestAnimationFrame(animateFrame);
}

function updateVehicleState(vehicle, vehicleData) {
    const userData = vehicle.userData;
    if (!userData) return;
    
    // Reset to default state
    resetVehicleToDefault(vehicle);

    // Apply state-specific visual effects
    if (vehicleData.braking || vehicleData.emergency_brake) {
        activateBrakeLights(vehicle, vehicleData.emergency_brake);
    }

    if (vehicleData.damaged) {
        showDamageState(vehicle);
    }

    if (vehicleData.distracted) {
        showDistractionState(vehicle);
    }

    if (vehicleData.sliding || vehicleData.understeer) {
        showLossOfControlState(vehicle);
    }

    if (vehicleData.changing) {
        showLaneChangeState(vehicle);
    }

    if (vehicleData.turning) {
        showTurningState(vehicle);
    }
}

function resetVehicleToDefault(vehicle) {
    const userData = vehicle.userData;
    
    // Reset brake lights
    if (userData.brakeLeft) userData.brakeLeft.material.opacity = 0.3;
    if (userData.brakeRight) userData.brakeRight.material.opacity = 0.3;
    
    // Reset body color
    if (userData.body) {
        userData.body.material.color.setHex(userData.originalColor);
    }
}

function activateBrakeLights(vehicle, isEmergency = false) {
    const userData = vehicle.userData;
    
    if (userData.brakeLeft && userData.brakeRight) {
        if (isEmergency) {
            // Flashing effect for emergency braking
            const flashRate = Date.now() * 0.02;
            const opacity = 0.7 + 0.3 * Math.sin(flashRate);
            userData.brakeLeft.material.opacity = opacity;
            userData.brakeRight.material.opacity = opacity;
        } else {
            // Steady brake lights
            userData.brakeLeft.material.opacity = 1.0;
            userData.brakeRight.material.opacity = 1.0;
        }
    }
}

function showDamageState(vehicle) {
    const userData = vehicle.userData;
    
    // Change vehicle color to dark red
    if (userData.body) {
        userData.body.material.color.setHex(0x8b0000);
    }
    
    // Create damage effect only once
    if (!userData.damageEffectCreated) {
        createDamageEffect(vehicle.position);
        userData.damageEffectCreated = true;
    }
}

function showDistractionState(vehicle) {
    const userData = vehicle.userData;
    
    // Orange color for distracted driver
    if (userData.body) {
        userData.body.material.color.setHex(0xffaa00);
    }
}

function showLossOfControlState(vehicle) {
    const userData = vehicle.userData;
    
    // Yellow/orange for loss of control
    if (userData.body) {
        userData.body.material.color.setHex(0xff6600);
    }
}

function showLaneChangeState(vehicle) {
    const userData = vehicle.userData;
    
    // Blue tint for lane changing
    if (userData.body) {
        userData.body.material.color.setHex(0x4488ff);
    }
}

function showTurningState(vehicle) {
    const userData = vehicle.userData;
    
    // Green tint for turning vehicles
    if (userData.body) {
        userData.body.material.color.setHex(0x44aa44);
    }
}

function createDamageEffect(position) {
    const particleCount = 15;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xff4444 : 0xffaa00,
            transparent: true
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Random position around impact point
        particle.position.set(
            position.x + (Math.random() - 0.5) * 3,
            position.y + Math.random() * 2,
            position.z + (Math.random() - 0.5) * 3
        );
        
        // Random velocity
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            Math.random() * 0.15,
            (Math.random() - 0.5) * 0.15
        );
        
        scene.add(particle);
        particles.push(particle);
    }

    // Animate particles
    let lifeTime = 3000; // 3 seconds
    
    function animateParticles() {
        lifeTime -= 16; // ~60fps
        
        if (lifeTime <= 0) {
            // Clean up particles
            particles.forEach(particle => {
                scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
            return;
        }

        particles.forEach(particle => {
            // Update position
            particle.position.add(particle.velocity);
            
            // Apply gravity
            particle.velocity.y -= 0.003;
            
            // Fade out over time
            particle.material.opacity = lifeTime / 3000;
            
            // Slight rotation for visual effect
            particle.rotation.x += 0.02;
            particle.rotation.y += 0.02;
        });

        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}