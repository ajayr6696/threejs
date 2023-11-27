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
The project uses a Webpack bundler to efficiently manage dependencies and bundle JavaScript files. Bundlers are essential for combining multiple files into a single file, optimizing code, and managing dependencies. Used Bootstrap.css for styling.

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
- Shapes created only if it is dropped over the SVG.
- Shapes can be scaled and resized using a Graphical User Interface provided by Settings View.
- Text insertion feature allows users to add labels to shapes.

### Settings View:
- **Functionality:** Added a Settings View to manipulate properties of shapes and text displayed in the 3D space.
- **User Interface:** Designed an interface within the Settings View to adjust various properties and it is shown only when a shape is clicked.
- **Properties Modification:** Users can alter properties such as shape opacity, transparency, height, width, text font size, and text transparency using the Settings View.

### Logic Used:
- **Interaction Handling:** Implemented logic to handle drag and drop interactions for shape creation.
- **Property Modification:** Managed the logic to update shape and text properties dynamically based on user input through the Settings View.
- **Event Handling:** Utilized event listeners to capture user actions and update the 3D scene accordingly.

### Additional Details:
- **Bootstrap.css:** Utilized Bootstrap.css for styling and responsiveness of the UI elements.
- **Data Structure:** Implemented a structured data format shared with the back-end for seamless communication and data exchange.
- **Optimization:** Ensured efficient bundling and management of JavaScript files using Webpack for improved performance.
