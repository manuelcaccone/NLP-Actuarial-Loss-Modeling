/**
 * User Interface Functions
 */

function setupUI() {
    createPatternButtons();
    updateScenarioPanel();
    console.log('UI setup complete');
}

function createPatternButtons() {
    const container = document.getElementById('pattern-buttons');
    if (!container) {
        console.error('Pattern buttons container not found');
        return;
    }
    
    container.innerHTML = '';
    
    Object.entries(crashPatterns).forEach(([key, pattern]) => {
        const button = document.createElement('button');
        button.className = 'pattern-btn';
        button.dataset.pattern = key;
        
        const riskClass = pattern.riskScore > 2.0 ? 'risk-high' : 
                         pattern.riskScore > 1.6 ? 'risk-medium' : 'risk-low';
        
        button.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${pattern.name}</strong>
                    <br><small style="opacity: 0.8;">${pattern.description}</small>
                </div>
                <span class="risk-indicator ${riskClass}">${pattern.riskScore}</span>
            </div>
        `;
        
        button.addEventListener('click', () => selectPattern(key, button));
        container.appendChild(button);
    });
}

function selectPattern(patternKey, buttonElement) {
    // Update button states
    document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    // Load the selected pattern
    loadCrashPattern(patternKey);
}

function loadCrashPattern(patternKey) {
    try {
        console.log('Loading crash pattern:', patternKey);
        
        currentPattern = crashPatterns[patternKey];
        currentStep = 0;
        isPlaying = false;

        // Clean up previous scene
        clearVehicles();
        
        // Update UI panels
        updateScenarioPanel();
        updateTimelinePanel();

        // Create vehicles for this pattern
        const uniqueVehicles = new Set();
        currentPattern.steps.forEach(step => {
            step.vehicles.forEach(v => uniqueVehicles.add(v.id));
        });

        // Assign different colors to each vehicle
        const colors = [0x2194ce, 0xff4444, 0x44ff44, 0xffaa44, 0x8844ff];
        let colorIndex = 0;

        uniqueVehicles.forEach(vehicleId => {
            createVehicle(vehicleId, colors[colorIndex % colors.length]);
            colorIndex++;
        });

        // Set initial positions without animation
        updateVehiclePositions(0, false);

        // Reset controls
        const timelineSlider = document.getElementById('timeline-slider');
        const playBtn = document.getElementById('play-btn');
        const progressFill = document.getElementById('progress-fill');
        
        if (timelineSlider) timelineSlider.value = 0;
        if (playBtn) playBtn.textContent = '▶ Play';
        if (progressFill) progressFill.style.width = '0%';

        console.log('Pattern loaded successfully');

    } catch (error) {
        console.error('Error loading pattern:', error);
        showError('Failed to load crash pattern: ' + error.message);
    }
}

function clearVehicles() {
    Object.values(vehicles).forEach(vehicle => {
        scene.remove(vehicle);
        
        // Dispose of geometries and materials to prevent memory leaks
        vehicle.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    });
    vehicles = {};
}

function updateScenarioPanel() {
    const content = document.getElementById('scenario-content');
    if (!content) return;
    
    if (!currentPattern) {
        content.innerHTML = `
            <div class="scenario-details">
                <h4>Select a pattern to view detailed crash reconstruction</h4>
                <p>Choose from the most common crash patterns to see a 3D reconstruction of the incident scenario.</p>
                <div style="margin-top: 15px; padding: 10px; background: rgba(255, 215, 0, 0.1); border-radius: 8px; border-left: 3px solid #ffd700;">
                    <p style="font-size: 10px; margin: 0;"><strong>Instructions:</strong></p>
                    <ul style="font-size: 10px; margin: 5px 0 0 15px; padding: 0;">
                        <li>Click any crash pattern button to begin</li>
                        <li>Use Space bar to play/pause animations</li>
                        <li>Arrow keys to navigate step by step</li>
                        <li>Camera controls on the left side</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }

    const pattern = currentPattern;
    const riskClass = pattern.riskScore > 2.0 ? 'risk-high' : 
                     pattern.riskScore > 1.6 ? 'risk-medium' : 'risk-low';
    
    content.innerHTML = `
        <div class="scenario-details">
            <h4>${pattern.name}</h4>
            <p><strong>Description:</strong> ${pattern.description}</p>
            <p><strong>Risk Score:</strong> <span class="risk-indicator ${riskClass}">${pattern.riskScore}</span></p>
            <p><strong>Frequency:</strong> ${pattern.frequency}</p>
            <p><strong>Steps:</strong> ${pattern.steps.length} | <strong>Current:</strong> ${currentStep + 1}</p>
        </div>
        
        <div style="background: rgba(255, 215, 0, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #ffd700;">
            <h5 style="margin: 0 0 8px 0; color: #ffd700;">🎬 Active Reconstruction</h5>
            <p style="margin: 0; font-size: 10px; line-height: 1.4;">
                <strong>Controls:</strong> Space=Play/Pause, ←→=Navigate<br>
                <strong>Camera:</strong> Left panel buttons for views<br>
                <strong>Visual Cues:</strong> 🔴=Damage, 🟠=Distraction, 🔵=Lane Change, ⚡=Emergency Brake
            </p>
        </div>
    `;
}

function updateTimelinePanel() {
    const timelineDiv = document.getElementById('timeline-steps');
    if (!timelineDiv) return;
    
    if (!currentPattern) {
        timelineDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999;">
                Select a crash pattern to view the step-by-step reconstruction
            </div>
        `;
        return;
    }

    const pattern = currentPattern;
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; max-height: 80px; overflow-y: auto;">';
    
    pattern.steps.forEach((step, index) => {
        const isActive = index === currentStep ? 'active' : '';
        html += `
            <div class="scenario-step ${isActive}" data-step="${index}" onclick="jumpToStep(${index})">
                <span class="step-number">${index + 1}.</span>
                ${step.description}
            </div>
        `;
    });
    
    html += '</div>';
    timelineDiv.innerHTML = html;
}

function jumpToStep(stepIndex) {
    if (!currentPattern || stepIndex < 0 || stepIndex >= currentPattern.steps.length) {
        return;
    }
    
    console.log('Jumping to step:', stepIndex);
    
    currentStep = stepIndex;
    updateVehiclePositions(stepIndex, true);
    
    // Update slider and progress bar
    const progress = stepIndex === 0 ? 0 : (stepIndex / (currentPattern.steps.length - 1)) * 100;
    
    const timelineSlider = document.getElementById('timeline-slider');
    const progressFill = document.getElementById('progress-fill');
    
    if (timelineSlider) timelineSlider.value = progress;
    if (progressFill) progressFill.style.width = progress + '%';
    
    // Update scenario panel to show current step
    updateScenarioPanel();
    updateTimelinePanel();
}

function filterPatternsByDemographic(demographic) {
    const buttons = document.querySelectorAll('.pattern-btn');
    
    buttons.forEach(button => {
        const patternKey = button.dataset.pattern;
        const pattern = crashPatterns[patternKey];
        
        if (!pattern) return;
        
        const shouldShow = demographic === 'all' || 
                         (pattern.demographics && pattern.demographics.includes(demographic));
        
        button.style.display = shouldShow ? 'block' : 'none';
    });
    
    console.log('Filtered patterns by demographic:', demographic);
}