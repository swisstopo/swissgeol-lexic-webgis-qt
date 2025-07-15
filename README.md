# SwissGeolWebMap

A web map application for geologists, designed to visualize geological data layers. It allows users to apply attribute filters based on vocabularies like Chronostratigraphy, Tectonic Units, Lithostratigraphy, and Lithology. The map also features a popup that displays augmented data (such as ID, LitoDE, LitoEN, TectoLexic, etc.) upon clicking a point on the map.

## Getting Started

First, create a `.env.local` file by copying `.env.example` and fill in the required environment variables.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker

To run the application using Docker, you can set the environment variables directly in the `docker-compose.yml` file.

> **Note:** The `NEXT_PUBLIC_GEOSERVER_BASE_URL` variable must be passed as a **build argument** (using `args` in the `build` section). This is because it is required by Next.js during the build process to be embedded in the client-side code. It is not needed as a runtime environment variable. The `docker-compose.yml` files are already configured for this.

Then, run the container:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3050.

## Environment Variables

The application is configured via environment variables. When using Docker, these are set in the `docker-compose.yml` file. For local development, they should be in an `.env.local` file.

| Variable                                    | Description                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GEOSERVER_BASE_URL`            | The base URL for GeoServer, used to load WMS and WMTS layers.               |
| `NEXT_PUBLIC_GRAPHDB_BASE_URL`              | The base URL for the GraphDB instance.                                      |
| `NEXT_PUBLIC_GRAPHDB_USERNAME`              | The username for GraphDB authentication (if required).                      |
| `NEXT_PUBLIC_GRAPHDB_PASSWORD`              | The password for GraphDB authentication (if required).                      |
| `NEXT_PUBLIC_CHRONOSTRATIGRAPHY_REPO_ID`    | The repository ID for the Chronostratigraphy vocabulary in GraphDB.         |
| `NEXT_PUBLIC_TECTONICUNITS_REPO_ID`         | The repository ID for the TectonicUnits vocabulary in GraphDB.              |
| `NEXT_PUBLIC_LITHOSTRATIGRAPHY_REPO_ID`     | The repository ID for the Lithostratigraphy vocabulary in GraphDB.          |
| `NEXT_PUBLIC_LITHOLOGY_REPO_ID`             | The repository ID for the Lithology vocabulary in GraphDB.                  |
