/**
 * Controls and Event Handling Functions
 */

function setupEventListeners() {
    // Timeline slider
    const slider = document.getElementById('timeline-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            if (!currentPattern) return;
            
            const progress = parseFloat(e.target.value) / 100;
            const stepIndex = Math.floor(progress * (currentPattern.steps.length - 1));
            jumpToStep(stepIndex);
        });
    }

    // Play button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            togglePlayback();
        });
    }

    // Demographic filters
    const demographicFilters = document.getElementById('demographic-filters');
    if (demographicFilters) {
        demographicFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('demo-btn')) {
                document.querySelectorAll('.demo-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                filterPatternsByDemographic(e.target.dataset.demo);
            }
        });
    }

    // Window resize
    window.addEventListener('resize', () => onWindowResize());

    // Keyboard controls
    document.addEventListener('keydown', handleKeyboardInput);
    
    console.log('Event listeners setup complete');
}

function handleKeyboardInput(e) {
    if (!currentPattern) return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayback();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            jumpToStep(Math.max(0, currentStep - 1));
            break;
        case 'ArrowRight':
            e.preventDefault();
            jumpToStep(Math.min(currentPattern.steps.length - 1, currentStep + 1));
            break;
        case 'Escape':
            e.preventDefault();
            if (isPlaying) togglePlayback();
            break;
        case 'KeyR':
            e.preventDefault();
            setCameraPosition(20, 15, 20);
            cameraMode = 'default';
            break;
    }
}

function setupCameraControls() {
    // Reset camera button
    const resetBtn = document.getElementById('resetCamera');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            setCameraPosition(20, 15, 20);
            cameraMode = 'default';
            updateCameraButtonStates('resetCamera');
        });
    }

    // Top view button
    const topBtn = document.getElementById('topView');
    if (topBtn) {
        topBtn.addEventListener('click', () => {
            setCameraPosition(0, 40, 0);
            cameraMode = 'top';
            updateCameraButtonStates('topView');
        });
    }

    // Side view button
    const sideBtn = document.getElementById('sideView');
    if (sideBtn) {
        sideBtn.addEventListener('click', () => {
            setCameraPosition(30, 5, 0);
            cameraMode = 'side';
            updateCameraButtonStates('sideView');
        });
    }

    // Auto rotate button
    const autoBtn = document.getElementById('autoRotate');
    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            autoRotateEnabled = !autoRotateEnabled;
            cameraMode = autoRotateEnabled ? 'auto' : 'default';
            updateCameraButtonStates('autoRotate');
        });
    }
    
    console.log('Camera controls setup complete');
}

function updateCameraButtonStates(activeButton) {
    // Reset all camera button styles
    document.querySelectorAll('.camera-btn').forEach(btn => {
        btn.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    
    // Highlight active button
    const activeBtn = document.getElementById(activeButton);
    if (activeBtn) {
        activeBtn.style.background = 'rgba(255, 69, 0, 0.8)';
    }
}

function setCameraPosition(x, y, z) {
    if (!camera) return;
    
    const targetPosition = new THREE.Vector3(x, y, z);
    const startPosition = camera.position.clone();
    const duration = 1000;
    const startTime = performance.now();

    function animateCamera(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    requestAnimationFrame(animateCamera);
    console.log(`Camera moving to position: (${x}, ${y}, ${z})`);
}

function togglePlayback() {
    if (!currentPattern) {
        console.warn('No pattern selected');
        return;
    }

    isPlaying = !isPlaying;
    const playBtn = document.getElementById('play-btn');
    
    if (playBtn) {
        playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    }

    if (isPlaying) {
        console.log('Starting animation playback');
        playAnimation();
    } else {
        console.log('Pausing animation playback');
    }
}

function playAnimation() {
    if (!isPlaying || !currentPattern) return;

    const totalSteps = currentPattern.steps.length;
    const stepDuration = 1500 / animationSpeed;

    function nextStep() {
        if (!isPlaying) return;

        currentStep = (currentStep + 1) % totalSteps;
        updateVehiclePositions(currentStep, true);

        // Update UI elements
        const progress = currentStep === 0 ? 0 : (currentStep / (totalSteps - 1)) * 100;
        
        const timelineSlider = document.getElementById('timeline-slider');
        const progressFill = document.getElementById('progress-fill');
        
        if (timelineSlider) timelineSlider.value = progress;
        if (progressFill) progressFill.style.width = progress + '%';

        updateScenarioPanel();

        // Schedule next step or restart
        if (currentStep === totalSteps - 1) {
            // Pause at the end before restarting
            setTimeout(() => {
                if (isPlaying) {
                    currentStep = -1; // Will become 0 on next iteration
                    setTimeout(nextStep, stepDuration);
                }
            }, stepDuration * 2);
        } else {
            setTimeout(nextStep, stepDuration);
        }
    }

    setTimeout(nextStep, stepDuration);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    console.log('Window resized, camera and renderer updated');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting 3D crash reconstruction dashboard...');
    
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        showError('Three.js library failed to load. Please check your internet connection.');
        return;
    }
    
    // Initialize the application
    try {
        init();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to initialize 3D dashboard: ' + error.message);
    }
});

// Fallback initialization for already loaded DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else if (document.readyState === 'complete') {
    console.log('DOM already loaded, initializing immediately...');
    init();
}