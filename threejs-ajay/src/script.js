import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as dat from 'dat.gui';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let scene, camera, renderer, controls, selectedObject, isDragging, clonedButton, SVGObject;

function init() {
    // Set up Three.js scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 100); // Set camera position

    renderer = new THREE.WebGLRenderer({ alpha: true} );//
    renderer.setSize(window.innerWidth-300, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 0.1)
    pointLight.position.set(2, 3, 4)
    scene.add(pointLight)

    // Add SVG
    var svgPath = 'assets/images/SVGImage.svg';
    loadSVGTexture(svgPath);


    // Create an array of draggable objects (buttons)
    const buttons = document.querySelectorAll('.draggable');
    const draggableObjects = [];

    buttons.forEach(button => {
        draggableObjects.push(button);
        button.addEventListener('mousedown', onMouseDown);
    });

    // // Initialize DragControls
    // controls = new DragControls(draggableObjects, camera, renderer.domElement);

    // // Event listeners for drag start and drag end
    // controls.addEventListener('dragstart', onDragStart);
    // controls.addEventListener('dragend', onDragEnd);

    // Sizes
    const sizes = {
        width: window.innerWidth-300,
        height: window.innerHeight
    }

    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth-300
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    // orbit.update(); // Update the controls in the animation loop
    renderer.render(scene, camera);
}


function loadSVGTexture(svgPath) {
    var loader = new SVGLoader();
    loader.load(svgPath, function (data) {
        var paths = data.paths;
        var group = new THREE.Group();
        
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var shapes = path.toShapes(true);
            
            for (var j = 0; j < shapes.length; j++) {
                var shape = shapes[j];
                var geometry = new THREE.ShapeGeometry(shape);
                //geometry.scale( - 1, 1, 1 );
                var fillColor = path.userData.style.fill; // Extract fill color from SVG
                var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(fillColor) });
                
                var mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            }
        }
        
        group.scale.set(0.2, -0.2, 0.2); // Adjust scale as needed
        scene.add(group);
        group.position.set(40, 30, 1);
        SVGObject = group;
    });
}



function onMouseDown(event) {
    event.preventDefault();
    isDragging = true;
    selectedObject = event.target;

    const shiftX = event.clientX - selectedObject.getBoundingClientRect().left;
    const shiftY = event.clientY - selectedObject.getBoundingClientRect().top;

    clonedButton = selectedObject.cloneNode(true);
    copyButtonStyles(selectedObject, clonedButton);

    clonedButton.style.position = 'absolute';
    clonedButton.style.zIndex = '15';
    document.body.appendChild(clonedButton);

    clonedButton.style.left = event.clientX - shiftX + 'px';
    clonedButton.style.top = event.clientY - shiftY + 'px';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function copyButtonStyles(originalButton, clonedButton) {
    const computedStyles = window.getComputedStyle(originalButton);
    const stylesToCopy = [
        'backgroundColor',
        'color',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'width',
        'padding',
        'marginBottom',
        'borderRadius',
        'cursor',
        'transition'
    ];

    stylesToCopy.forEach(style => {
        clonedButton.style[style] = computedStyles[style];
        clonedButton.style.opacity = '0.5';
    });
}

function onMouseMove(event) {
    if (isDragging) {
        clonedButton.style.left = event.clientX - clonedButton.offsetWidth / 2 + 'px';
        clonedButton.style.top = event.clientY - clonedButton.offsetHeight / 2 + 'px';
    }
}

function onMouseUp(event) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    isDragging = false;

    if (clonedButton) {
        const canvasRect = renderer.domElement.getBoundingClientRect();
        const mouse = {
            x: ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
            y: -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1,
        };
        
        const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
        mouseVector.unproject(camera)

        const direction = mouseVector.sub(camera.position).normalize()
        const distance = (5 - camera.position.z) / direction.z // Ensure objects are added at z = 5
        const dropPosition = camera.position.clone().add(direction.multiplyScalar(distance))

        // Create a raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with the SVG object
        const intersects = raycaster.intersectObject(SVGObject);

        if (intersects.length > 0) {
            // Mouse click intersects with the SVG object
            console.log('Object dropped over the SVG object!');
            createShape(event.target.id, dropPosition);
            // Perform actions specific to the SVG object here
        } else {
            // Mouse click does not intersect with the SVG object
            console.log('Object dropped not over the SVG object.');
        }

        clonedButton.remove();
        clonedButton = null;
    }
}

// function onDragStart(event) {
//     event.object.style.opacity = '0.5';
// }

// function onDragEnd(event) {
//     event.object.style.opacity = '1';
// }

let objectCount=0;
function createShape(type, position) {
    let geometry, material, shapeMesh, textMaterial, textMesh;
    objectCount++;
    if (type === 'circle-tool') {
        geometry = new THREE.CircleGeometry(5, 32);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1});
    } else if (type === 'rectangle-tool') {
        geometry = new THREE.PlaneGeometry(5, 5);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
    } else if (type === 'ellipse-tool') {
        geometry = new THREE.CircleGeometry(5, 32);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1});
    } else if (type === 'text-tool') {
        // Create text geometry
    }

    if(geometry) {
        shapeMesh = new THREE.Mesh(geometry, material);
        // Set object's Z-coordinate to above 5, incrementing Z axis of each component added, by 0.1
        shapeMesh.position.copy(position.setZ(5+objectCount*0.1));
        shapeMesh.renderOrder = 1; // Set a higher render order to make it appear above the SVG
        scene.add(shapeMesh);
    }
    // Load the font
    const loader = new FontLoader();

    //The TypeCase.json Font File was created and added to this project
    loader.load('assets/fonts/Roboto_Regular.json', (font) => {

        // Create text geometry with the loaded font
        const textGeometry = new TextGeometry('Label', {
            font: font,
            size: 1,
            height: 1,
            curveSegments: 12,
            bevelEnabled: false,
        });

        //If a new Mesh(circle,rectangle or ellipse) is created 
        if(shapeMesh) {
            textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            // Position the text inside the geometry
            const boundingBox = new THREE.Box3().setFromObject(shapeMesh);
            textMesh.position.set(boundingBox.min.x+(boundingBox.max.x - boundingBox.min.x)/4, boundingBox.min.y+(boundingBox.max.y - boundingBox.min.y)/2, 5+objectCount*0.1);

            // Link the text size to the circle's scale
            textMesh.scale.set(shapeMesh.scale.x, shapeMesh.scale.y, shapeMesh.scale.z);
        } 
        else { //Else if, Text option(only text Mesh) is needed  
            textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(position.setZ(5+objectCount*0.1));
            textMesh.renderOrder = 1;
        }
        console.log(textMesh);
        scene.add(textMesh);

        // Update text size when circle is scaled
        // const gui = new dat.GUI();
        // gui.add(shapeMesh.scale, 'x', 1, 10).onChange((value) => {
        //     textMesh.scale.set(value, value, value);
        // });
    });

    /*
    
    // Will complete the Support view and backend data soon 

    */

    // dat.GUI setup for components

    const gui = new dat.GUI();
    const objectParams = {
        Transparency: 1,
        Height: 1,
        Width: 1,
        // Will Add other parameters here
    };

    // Add parameters to dat.GUI
    gui.add(objectParams, 'Transparency', 0, 1).onChange(value => {
        shapeMesh.material.opacity = value;
    });

    gui.add(objectParams, 'Height', 1, 10).onChange(value => {
        // Modify object height
        shapeMesh.scale.y = value;
    });

    gui.add(objectParams, 'Width', 1, 10).onChange(value => {
        // Modify object width
        shapeMesh.scale.x = value;
    });

    // Add text field for object
    // gui.add(objectParams, 'Label').onChange(value => {
    //     // Change object label/text
    //     // Modify object text (if applicable)
    // });
    
}

// Initialize Three.js
init();
