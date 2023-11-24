# threejs
Three JS Project - i4Twins

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Build for production in the dist/ directory
npm run build

# Run the local server at localhost:8080
serve
```

## Project Details

### Development Environment Setup:
The project uses a Webpack bundler to efficiently manage dependencies and bundle JavaScript files. Bundlers are essential for combining multiple files into a single file, optimizing code, and managing dependencies.

### Scene Configuration:
- **Camera Setup:** Configured the perspective camera within the scene for proper visualization.
- **Lighting:** Implemented PointLight for illuminating the scene.
- **SVG Loader:** Used SVGLoader to load and render SVG images within the scene.
- **Event Listeners:** Incorporated event listeners for mouse interactions, such as drag and drop functionalities.
- **Raycaster:** Utilized Raycaster for detecting intersections with objects in the scene.
- **FontLoader:** Loaded custom fonts for text insertion in the 3D space.

### Shape Creation and Manipulation:
- Created draggable buttons that represent different shapes (circle, rectangle, ellipse, text).
- Implemented functionality to drag and drop these buttons onto the canvas area to create corresponding shapes.
- Shapes can be scaled and resized using a Graphical User Interface provided by dat.gui.
- Text insertion feature allows users to add labels to shapes.

### dat.gui:
The project utilizes the dat.gui library, a lightweight controller library for graphical user interfaces. It provides a simple interface to create GUI controls to manipulate variables in the project easily.

I will use this and complete the settings view and the last task.
