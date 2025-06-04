/**
 * Three.js Setup and 3D Environment Functions
 */

// Initialize the application
function init() {
    try {
        console.log('Initializing 3D crash reconstruction...');
        
        setupThreeJS();
        setupLighting();
        createEnvironment();
        setupUI();
        setupEventListeners();
        setupCameraControls();
        
        document.getElementById('loading').style.display = 'none';
        console.log('Initialization complete');
        animate();
        
    } catch (error) {
        console.error('Init failed:', error);
        showError('Failed to initialize: ' + error.message);
    }
}

function setupThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x001122, 30, 150);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x001122, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

function setupLighting() {
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(30, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-30, 20, -20);
    scene.add(fillLight);
}

function createEnvironment() {
    // Road surface
    const roadGeometry = new THREE.PlaneGeometry(80, 20);
    const roadMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.9
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    createLaneMarkings();
    createRoadBoundaries();
}

function createLaneMarkings() {
    const markingGeometry = new THREE.BoxGeometry(3, 0.02, 0.3);
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Center line markings (dashed)
    for (let i = -30; i <= 30; i += 6) {
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);
        marking.position.set(i, 0.01, 0);
        scene.add(marking);
    }

    // Lane boundaries
    [-7, 7].forEach(z => {
        for (let i = -30; i <= 30; i += 6) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.position.set(i, 0.01, z);
            scene.add(marking);
        }
    });
    
    // Additional lane dividers for multi-lane highway
    [-3.5, 3.5].forEach(z => {
        const dividerGeometry = new THREE.BoxGeometry(1.5, 0.03, 0.2);
        const dividerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        for (let i = -30; i <= 30; i += 4) {
            const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
            divider.position.set(i, 0.015, z);
            scene.add(divider);
        }
    });
}

function createRoadBoundaries() {
    const barrierGeometry = new THREE.BoxGeometry(80, 0.8, 0.3);
    const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

    // Safety barriers on both sides
    [-12, 12].forEach(z => {
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(0, 0.4, z);
        barrier.castShadow = true;
        scene.add(barrier);
    });
}

function createVehicle(id, color = 0x2194ce) {
    const vehicleGroup = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 1.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: color, 
        shininess: 50,
        specular: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    vehicleGroup.add(body);

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.6);
    const windshieldMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb, 
        transparent: true, 
        opacity: 0.6,
        reflectivity: 0.8
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0.5, 1.4, 0);
    vehicleGroup.add(windshield);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    const wheelPositions = [[-1.2, 0.3, -1], [-1.2, 0.3, 1], [1.2, 0.3, -1], [1.2, 0.3, 1]];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        vehicleGroup.add(wheel);
    });

    // Brake lights
    const brakeGeometry = new THREE.SphereGeometry(0.12);
    const brakeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.3 
    });
    
    const leftBrake = new THREE.Mesh(brakeGeometry, brakeMaterial.clone());
    leftBrake.position.set(-1.8, 0.7, -0.7);
    vehicleGroup.add(leftBrake);

    const rightBrake = new THREE.Mesh(brakeGeometry, brakeMaterial.clone());
    rightBrake.position.set(-1.8, 0.7, 0.7);
    vehicleGroup.add(rightBrake);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffaa,
        transparent: true,
        opacity: 0.8
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(1.8, 0.7, -0.7);
    vehicleGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(1.8, 0.7, 0.7);
    vehicleGroup.add(rightHeadlight);

    // Store references in userData
    vehicleGroup.userData = { 
        id, 
        brakeLeft: leftBrake, 
        brakeRight: rightBrake,
        body, 
        windshield, 
        originalColor: color, 
        isAnimating: false,
        damageEffectCreated: false
    };

    scene.add(vehicleGroup);
    vehicles[id] = vehicleGroup;
    return vehicleGroup;
}

function animate() {
    requestAnimationFrame(animate);

    // Auto rotate camera if enabled
    if (autoRotateEnabled && cameraMode === 'default') {
        const time = Date.now() * 0.0002;
        camera.position.x = Math.cos(time) * 25;
        camera.position.z = Math.sin(time) * 25;
        camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
}

function showError(message) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    console.error(message);
    
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <h3>⚠️ Error</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px;
            padding: 5px 15px;
            background: white;
            color: red;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;
    document.body.appendChild(errorDiv);
}