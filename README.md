# GIS Mapping Demo (Sprint 3)

This project is a simple GIS web mapping application that displays locations on an interactive interactive map. The program uses a basemap along with custom GIS data layers that include multiple markers, labels, and popups with additional information. Users can explore the map, toggle layers, search for locations, and filter results by category.

The goal of this project is to demonstrate foundational GIS concepts such as map layers, geospatial data, styling features, and building an interactive map interface using web technologies.

## Instructions for Build and Use

### Steps to build and/or run the software

1. Download or clone this repository from GitHub.
2. Open the project folder in Visual Studio Code or another code editor.
3. Run the project using Live Server or another local web server.
4. Open `index.html` in your browser if it does not automatically launch.

Example using Python:

```
python -m http.server 8000
```

Then open a browser and go to:

http://localhost:8000
```

### Instructions for using the software

1. Open the webpage to load the interactive GIS map.
2. View different locations displayed on the map.
3. Click on markers to open popups with more information.
4. Use the search box to find specific locations.
5. Use the category dropdown to filter types of locations.
6. Toggle layers on or off using the map layer controls.

## Development Environment

To recreate the development environment, install or use the following tools:

* Visual Studio Code
* A modern web browser (Google Chrome recommended)
* Leaflet.js mapping library
* HTML, CSS, and JavaScript
* GeoJSON data files

Optional tools:

* VS Code Live Server Extension
* Python (for running a simple local development server)

## Useful Websites to Learn More

These resources were helpful while developing this project:

* https://leafletjs.com/
* https://learn.arcgis.com/en/
* https://gisgeography.com/
* https://docs.qgis.org/

## Future Work

The following improvements may be added in the future:

* [ ] Add more real-world GIS datasets
* [ ] Improve the visual design and layout
* [ ] Add user location detection
* [ ] Add advanced search and filtering tools
* [ ] Deploy the project publicly using GitHub Pages