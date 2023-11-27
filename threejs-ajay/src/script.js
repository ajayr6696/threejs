//All necessary imports

import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let scene, camera, renderer, controls, selectedObject, isDragging, clonedButton, SVGObject;
let createdShapes = []; // List that has all created shapes, excluding the text on the shapes
let createdTexts = []; // List of all text on the shapes
let shapes = []; // List of all shapes, same like the data struture that was mentioned in question

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


    // Create an list of draggable objects (buttons)
    const buttons = document.querySelectorAll('.draggable');
    const draggableObjects = [];

    buttons.forEach(button => {
        draggableObjects.push(button);
        button.addEventListener('mousedown', onMouseDown);
    });

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

    

    // Add a click event listener to the window or the renderer element
    window.addEventListener('click', onDocumentMouseClick, false);

    // Function to handle mouse clicks
    function onDocumentMouseClick(event) {

        const raycaster = new THREE.Raycaster();
        //const mouse = new THREE.Vector3();
        const canvasRect = renderer.domElement.getBoundingClientRect();
        const mouse = {
            x: ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
            y: -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1,
            z: 10
        };

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera); // Assuming 'camera' is Three.js camera variable

        // Perform raycasting on the shapes in the scene
        createdShapes.forEach(object => {
            // Perform raycasting for each created objects
            const raycastIntersects = raycaster.intersectObject(object, true);
        
            // Check the type of the intersected object and filter by geometry type
            const clickedObj = raycastIntersects[0];
        
            if (clickedObj) {
                selectedObject = raycastIntersects[0].object;
                openForm(selectedObject);
            }
        });
    }
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Loading SVG at Z=1 axis
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
        group.position.set(-30, 30, 1);
        SVGObject = group;
    });
}

// If mouse click is done on the shape button,then drag is started.
// Create a cloned button and add Event listners for mousemove and mouseup, to track drag and drop.

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

    // 
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Copying all basic styles of the actual shape button to the cloned shape button, during drag and drop
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

// Mouse on move, when dragging a shape button
// Make sure to set the position of the cloned button, as same as mouse position
function onMouseMove(event) {
    if (isDragging) {
        clonedButton.style.left = event.clientX - clonedButton.offsetWidth / 2 + 'px';
        clonedButton.style.top = event.clientY - clonedButton.offsetHeight / 2 + 'px';
    }
}

// Mouse up event, after dragging a shape button
// ShapeMesh is rendered, only if the shape button is dragged and dropped over the SVG
// Raycaster is used to determine if shape button is dropped on SVG
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
        } else {
            // Mouse click does not intersect with the SVG object
            console.log('Object dropped not over the SVG object.');
        }

        clonedButton.remove();
        clonedButton = null;
    }
}

// The exported data should be shared with back-end through the below structure 
function createShapeDataObject(shapeType, shapeMesh, textMesh) {
    const data = {
      id: `label_${Date.now()}`,
      shape: {
        elementId: `element_id_${Date.now()}`,
        shape: shapeType,
        name: shapeMesh.name,
        view: {
            fill: shapeMesh.material.color.getHexString(), // Extract fill color from shapeMesh material
            width: shapeMesh.scale.x,
            height: shapeMesh.scale.y,
            X: shapeMesh.position.x, // X position of the shape
            y: shapeMesh.position.y, // Y position of the shape
            opacity: shapeMesh.material.opacity,
            transparent : shapeMesh.material.transparent,
            },
      },
      text: {
        elementId: `label_${Date.now() + 1}`,
        name: textMesh.name,
        view: {
          fontSize: 1, // Extract font-size from textMesh geometry
          fill: textMesh.material.color.getHexString(), // Extract text color from textMesh material
          X: textMesh.position.x, // X position of the text
          y: textMesh.position.y, // Y position of the text
          opacity: textMesh.material.opacity,
          transparent : textMesh.material.transparent,
        },
        content: {
          label: "Label", // Default label content
        },
      },
      dynamic: {
        topic: {
          output: "", // Default output
          islinked: false, // Default link status
          action: {
            type: null, // Default action type
          },
        },
        animation: {
          type: null, // Default animation type
        },
        type: "[Hmi] update dynamic label",
      },
    };
  
    // Return the structured data object
    return data;
}

// Keeping tack of number of objects added, to set Z-axis of the shapes created and naming it in Mesh to set unique name
let objectCount=0;
// This method creates necessary shapes
function createShape(type, position) {
    let geometry, material, shapeMesh, textMaterial, textMesh;
    objectCount++;
    if (type === 'circle') {
        geometry = new THREE.CircleGeometry(5, 32);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1});
    } else if (type === 'rectangle') {
        geometry = new THREE.PlaneGeometry(5, 5);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
    } else if (type === 'ellipse') {
        geometry = new THREE.CircleGeometry(5, 32);
        material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1});
    } else if (type === 'text') {
        // Create text geometry
    }

    if(geometry) {
        shapeMesh = new THREE.Mesh(geometry, material);
        // Set object's Z-coordinate to above 5, incrementing Z axis of each component added, by 0.1
        shapeMesh.position.copy(position.setZ(5+objectCount*0.1));
        shapeMesh.renderOrder = 1; // Set a higher render order to make it appear above the SVG
        scene.add(shapeMesh);
        shapeMesh.name = `shape_${objectCount}`; // Assigning name for shape
        createdShapes.push(shapeMesh);
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
            textMesh.name = `text_${objectCount}`; // Assigning name for text
        } 
        else { //Else if, Text option(only text Mesh) is needed  
            textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(position.setZ(5+objectCount*0.1));
            textMesh.renderOrder = 1;
            textMesh.name = `textShape_${objectCount}`; // Assigning name for text
            createdShapes.push(textMesh);
        }
        console.log('textMesh',textMesh);
        scene.add(textMesh);
        createdTexts.push(textMesh);

        const newShapeData = createShapeDataObject(type, shapeMesh ? shapeMesh: textMesh , textMesh)
        console.log('New shape object: ', newShapeData);
        shapes.push(newShapeData);

    });
    
}

// This method updates the Settings view, whenever its opened.
// Also View -> Shape option is shown by default, whenever Setting view is opened
function updateForm(){
    const contentOptions = document.getElementById('content-options');
    const staticOptions = document.getElementById('static-dynamic-options');
    const textOptions = document.getElementById('text-options');
    const viewOptions = document.getElementById('view-options');
    const shapeOptions = document.getElementById('shape-options');
    contentOptions.classList.add('hide');
    staticOptions.classList.add('hide');
    textOptions.classList.add('hide');
    handleNavSelection('view-option', true);
    handleNavSelection('shape-option', false);
    if (viewOptions.classList.contains('hide')) {
        toggleOptions(viewOptions);
    }
    if (shapeOptions.classList.contains('hide')) {
        toggleOptionsVisibility(shapeOptions);
    }
}

// This is mainly used to apply style for selected options in settings view.
// All the available options are creates using nav-links.
// Unselect parameter is boolean. If this is set, selected class is first removed from all nav-links.
// Finally selected class is applied for the nav-link that is passed tothis object.
function handleNavSelection(navLinkId, unselect) {
    const navLinks = document.querySelectorAll('.nav-link');

    if (unselect) {
        navLinks.forEach(link => {
            link.classList.remove('selected');
        });
    }

    const selectedNavLink = document.getElementById(navLinkId);
    selectedNavLink.classList.add('selected');
}

// Toggles hide class for third level options, shown in Settings view
function toggleOptionsVisibility(element) {
    const staticOptions = document.getElementById('static-dynamic-options');
    const textOptions = document.getElementById('text-options');
    const shapeOptions = document.getElementById('shape-options');
    const options = [shapeOptions, textOptions, staticOptions];
    options.forEach(opt => {
        if (opt !== element) {
            opt.classList.add('hide');
        }
    });
    element.classList.toggle('hide');
}

// Toggles hide class for second level options, shown in Settings view
function toggleOptions(element) {
    const viewOptions = document.getElementById('view-options');
    const contentOptions = document.getElementById('content-options');
    const options = [viewOptions, contentOptions];
    options.forEach(opt => {
        if (opt !== element) {
            opt.classList.add('hide');
        }
    });
    element.classList.toggle('hide');
}


// Function to open the pop-up form
function openForm(selectedObject) {
    const popupForm = document.getElementById('popup-form');
    const shapeFillRange = document.getElementById('shape-fill-range');
    const shapeTransparentToggle = document.getElementById('shape-transparent-toggle');
    const shapeHeightInput = document.getElementById('shape-height-input');
    const shapeWidthInput = document.getElementById('shape-width-input');
    const textFontSizeInput = document.getElementById('text-font-size-input');
    const textTransparentToggle = document.getElementById('text-transparent-toggle');
    const textFillRange = document.getElementById('text-fill-range');
    const staticContentInput = document.getElementById('static-content-input');

    updateForm();


    const objectName = selectedObject.name;

    const foundObject = shapes.find(shape => {
        if (shape.shape.name === objectName) {
            return shape;
        }
    });

    // Show all necessary values in Settings view, loading it from shapes list
    textFontSizeInput.value = foundObject.text.view.fontSize;
    textTransparentToggle.checked = foundObject.text.view.transparent;
    textFillRange.value = foundObject.text.view.opacity;
    staticContentInput.value = foundObject.text.content.label;
    shapeFillRange.value = foundObject.shape.view.opacity;
    shapeTransparentToggle.checked = foundObject.shape.view.transparent;
    shapeHeightInput.value = foundObject.shape.view.height;
    shapeWidthInput.value = foundObject.shape.view.width;
    
    popupForm.style.display = 'block';
}

  
// Function to close the pop-up form
function closeForm() {
    const popupForm = document.getElementById('popup-form');
    popupForm.style.display = 'none';
    updateForm();
}
  
// Event listener to trigger the form opening
window.addEventListener('click', function(event) {
const popupForm = document.getElementById('popup-form');
if (event.target !== popupForm && !popupForm.contains(event.target)) {
    closeForm();
}
});

// Apply changes to the shapes based on the values in the form
function applyChanges() {

    const shapeFillRange = document.getElementById('shape-fill-range');
    const shapeTransparentToggle = document.getElementById('shape-transparent-toggle');
    const shapeHeightInput = document.getElementById('shape-height-input');
    const shapeWidthInput = document.getElementById('shape-width-input');
    const textFontSizeInput = document.getElementById('text-font-size-input');
    const textTransparentToggle = document.getElementById('text-transparent-toggle');
    const textFillRange = document.getElementById('text-fill-range');

    const selectedText = createdTexts.find(text => {
        if (text.name === selectedObject.name.replace('shape', 'text')) {
            return text;
        }
    });

    // Get all values from html
    const fillValueText = parseFloat(textFillRange.value);
    const transparencyValueText = textTransparentToggle.checked;
    const fontSizeValueText = parseFloat(textFontSizeInput.value);
    const fillValue = parseFloat(shapeFillRange.value);
    const transparencyValue = shapeTransparentToggle.checked;
    const heightValue = parseFloat(shapeHeightInput.value);
    const widthValue = parseFloat(shapeWidthInput.value);

    const foundTextIndex = shapes.findIndex(shape => shape.shape.name === selectedObject.name);

    // If Text values are changed in Settings view, create new TextGeometry with new values and delete the old TextGeometry
    if(!((selectedText.material.opacity == fillValueText)&&
        (selectedText.material.transparent == transparencyValueText) &&
        (foundTextIndex !== -1 && shapes[foundTextIndex].text.view.fontSize == fontSizeValueText)))
    {
        // Update the fill and transparency of the selectedObject (text)
        selectedText.material.opacity = fillValueText;
        selectedText.material.transparent = transparencyValueText;

        // Load the font
        const loader = new FontLoader();
        // Create a new TextGeometry with updated values
        loader.load('assets/fonts/Roboto_Regular.json', (font) => {
            const newTextGeometry = new TextGeometry('Label', {
                font: font,
                size: fontSizeValueText,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false,
            });

            // Create a new Mesh with the updated TextGeometry
            const newTextMesh = new THREE.Mesh(newTextGeometry, selectedText.material);
            newTextMesh.position.copy(selectedText.position);

            // Remove the old TextMesh from the scene
            scene.remove(selectedText);

            // Add the new TextMesh to the scene
            newTextMesh.name = selectedObject.name.replace('shape', 'text');
            newTextMesh.renderOrder = 1;
            scene.add(newTextMesh);

            // Replace the reference in the createdTexts list
            const index = createdTexts.indexOf(selectedText);
            if (index !== -1 && foundTextIndex) {
                createdTexts[index] = newTextMesh; // Update
                shapes[foundTextIndex].text.view.opacity = fillValueText;
                shapes[foundTextIndex].text.view.fontSize = fontSizeValueText;
                shapes[foundTextIndex].text.view.transparent = transparencyValueText;
            }
        });
    }  
    // If Shape values are changed in Settings view, update the values of the selected object
    if(!((selectedObject.material.opacity == fillValue)&&
        (selectedObject.material.transparent == transparencyValue)&&
        (selectedObject.scale.y == heightValue)&&
        (selectedObject.scale.x == widthValue))) {

        // Update the fill and transparency of the selectedObject
        selectedObject.material.opacity = fillValue;
        selectedObject.material.transparent = transparencyValue;

        // Update the height and width of the selectedObject
        selectedObject.scale.y = heightValue;
        selectedObject.scale.x = widthValue;

        // Update the shapes list
        const shapeName = selectedObject.name;
        const foundShapeIndex = shapes.findIndex(shape => shape.shape.name === shapeName);
        if (foundShapeIndex !== -1) {
            shapes[foundShapeIndex].shape.view.opacity = fillValue;
            shapes[foundShapeIndex].shape.view.width = widthValue;
            shapes[foundShapeIndex].shape.view.height = heightValue;
            shapes[foundShapeIndex].shape.view.transparent = transparencyValue;
        }
    }
}

// Event Listners for all necessary elements are added when the page is initially loaded
// Handles all cicks in Settings View
document.addEventListener('DOMContentLoaded', function() {
    const viewOption = document.getElementById('view-option');
    const contentOption = document.getElementById('content-option');
    const shapeOption = document.getElementById('shape-option');
    const textOption = document.getElementById('text-option');
    const staticOption = document.getElementById('static-option');
    const viewOptions = document.getElementById('view-options');
    const textOptions = document.getElementById('text-options');
    const shapeOptions = document.getElementById('shape-options');
    const contentOptions = document.getElementById('content-options');
    const staticDynamicOptions = document.getElementById('static-dynamic-options');
    const saveButton = document.getElementById('save-button');

    viewOption.addEventListener('click', function() {
        if (viewOptions.classList.contains('hide')) {
            toggleOptionsVisibility(textOptions);
            toggleOptions(viewOptions);
            handleNavSelection('view-option', true);
            handleNavSelection('text-option', false);
        }
    });

    shapeOption.addEventListener('click', function() {
        if (shapeOptions.classList.contains('hide')) {
            toggleOptionsVisibility(shapeOptions);
            handleNavSelection('view-option', true);
            handleNavSelection('shape-option', false);
        }
    });

    textOption.addEventListener('click', function() {
        if (textOptions.classList.contains('hide')) {
            handleNavSelection('view-option', true);
            handleNavSelection('text-option', false);
            toggleOptionsVisibility(textOptions);
        }
    });

    contentOption.addEventListener('click', function() {
        if (contentOptions.classList.contains('hide')) {
            toggleOptionsVisibility(staticDynamicOptions);
            toggleOptions(contentOptions);
            handleNavSelection('content-option', true);
            handleNavSelection('static-option', false);
        }
    });

    staticOption.addEventListener('click', function() {
        if (staticDynamicOptions.classList.contains('hide')) {
            handleNavSelection('content-option', true);
            handleNavSelection('static-option', false);
            toggleOptionsVisibility(staticDynamicOptions);
        }
    });
  
  // Event listener for the save button
    saveButton.addEventListener('click', function() {
        // Logic to save changes
        applyChanges();
        closeForm();
    });

});


// Initialize Three.js
init();
