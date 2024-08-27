<template>
    <div class="flex min-h-screen bg-green-100 relative">
        <!-- Sidebar -->
        <div
            :class="[
                'transition-all duration-300 ease-in-out',
                isSidebarOpen ? 'w-1/4' : 'w-0',
            ]"
        >
            <div
                :class="[
                    'fixed top-0 left-0 h-full bg-white overflow-x-hidden transition-all duration-300 ease-in-out',
                    isSidebarOpen ? 'w-1/4' : 'w-0',
                ]"
            >
                <!-- File Upload Section -->
                <div
                    @dragover.prevent
                    @drop.prevent="handleDrop"
                    class="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors duration-300 ease-in-out m-4"
                >
                    <div class="space-y-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-16 h-16 mx-auto text-green-400"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                            />
                        </svg>
                        <h3 class="text-lg font-semibold text-green-700">
                            Drag and drop your file here
                        </h3>
                        <p class="text-green-500">or</p>
                        <button
                            @click="$refs.fileInput.click()"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Select a file
                        </button>
                        <input
                            ref="fileInput"
                            type="file"
                            class="hidden"
                            @change="handleFileInput"
                            accept=".geojson,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        />
                    </div>
                </div>
                <div v-if="file" class="mt-4 px-4">
                    <p class="text-sm text-green-600">
                        Selected file: {{ file.name }}
                    </p>
                    <div class="mt-2 relative pt-1">
                        <div class="flex mb-2 items-center justify-between">
                            <div>
                                <span
                                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200"
                                >
                                    Uploading
                                </span>
                            </div>
                            <div class="text-right">
                                <span
                                    class="text-xs font-semibold inline-block text-green-600"
                                >
                                    {{ uploadProgress }}%
                                </span>
                            </div>
                        </div>
                        <div
                            class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200"
                        >
                            <div
                                :style="{ width: `${uploadProgress}%` }"
                                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                        </div>
                    </div>
                </div>
                <hr class="my-4" />
                <!-- Layer Control Section -->
                <div v-if="layers.length > 0" class="px-4">
                    <h3 class="text-lg font-semibold text-green-700 mb-2">
                        Layer Control
                    </h3>
                    <div class="space-y-2">
                        <div
                            v-for="layer in layers"
                            :key="layer.id"
                            class="flex flex-col"
                        >
                            <div class="flex items-center justify-between">
                                <div>
                                    <label
                                        :for="layer.id"
                                        class="text-green-700"
                                        >{{ layer.name }}</label
                                    >
                                    <p class="text-[10px] text-gray-400 italic">
                                        {{ layer.uploadTime }}
                                    </p>
                                </div>
                                <div
                                    class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"
                                >
                                    <input
                                        type="checkbox"
                                        :id="layer.id"
                                        :checked="layer.visible"
                                        @change="toggleLayer(layer.id)"
                                        class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                    />
                                    <label
                                        :for="layer.id"
                                        class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                                    ></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <div
            :class="[
                'flex-grow transition-all duration-300 ease-in-out',
                isSidebarOpen ? 'ml-1/4' : 'ml-0',
            ]"
        >
            <!-- Map container -->
            <div class="h-screen relative">
                <div id="map" class="w-full h-full rounded-lg shadow-xl"></div>
                <UploadDataTable
                    v-if="showTable"
                    ref="uploadDataTableRef"
                    @analyze-request="handleAnalyzeRequest"
                    @show-on-map="handleShowOnMap"
                />
            </div>
        </div>

        <!-- Floating button to toggle sidebar -->
        <button
            @click="toggleSidebar"
            class="fixed top-4 left-4 z-50 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition duration-300 ease-in-out"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, nextTick } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { geojsonStore } from './stores/geojsonStore';
import UploadDataTable from './components/UploadDataTable.vue';
import axios from 'axios';
import * as Wkt from 'wicket';

const file = ref(null);
const uploadProgress = ref(0);
const fileInput = ref(null);
const showTable = ref(false);
const uploadDataTableRef = ref(null);
const layers = ref([]);
const isSidebarOpen = ref(true);

let map;

const emit = defineEmits(['analyze-request']);

const analyzeData = () => {
    emit('analyze-request');
};

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const handleAnalyzeRequest = async () => {
    if (file.value) {
        try {
            const formData = new FormData();
            formData.append('file', file.value);

            const response = await axios.post(
                // 'https://api.simtaru-belitung.site/data/v1/read_spatial_data?file_type=geojson',
                'http://localhost/data/v1/read_spatial_data?file_type=geojson',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );
            nextTick(() => {
                uploadDataTableRef.value.updateAnalysisResults(response.data);
                addAnalyzedDataToMap();
            });
        } catch (error) {
            console.error('Error analyzing data:', error);
        }
    } else {
        console.error('No file uploaded');
    }
};

const handleShowOnMap = (item) => {
    const wkt = new Wkt.Wkt();
    wkt.read(item.data.properties.Geometry);
    const geometry = wkt.toJson();

    const bounds = new maplibregl.LngLatBounds();
    if (geometry.type === 'Point') {
        bounds.extend(geometry.coordinates);
    } else if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach((coord) => bounds.extend(coord));
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon) => {
            polygon[0].forEach((coord) => bounds.extend(coord));
        });
    }
    map.fitBounds(bounds, { padding: 50 });

    const highlightLayer = new maplibregl.Layer({
        id: 'highlight-layer',
        type: 'circle',
        source: 'highlight-source',
        paint: {
            'circle-color': 'yellow',
            'circle-radius': 10,
            'circle-opacity': 0.5,
        },
    });
    map.addLayer(highlightLayer);
};

const addAnalyzedDataToMap = async () => {
    const analyzedData = await geojsonStore.getAllGeoJSON();

    if (map.getSource('analyzed-data-source')) {
        map.removeLayer('analyzed-data-layer');
        map.removeSource('analyzed-data-source');
    }

    const wkt = new Wkt.Wkt();

    map.addSource('analyzed-data-source', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: analyzedData.map((item) => {
                wkt.read(item.data.properties.Geometry);
                return {
                    type: 'Feature',
                    properties: item.data.properties,
                    geometry: wkt.toJson(),
                };
            }),
        },
    });

    const analyzedLayerId = 'analyzed-data-layer';
    map.addLayer({
        id: analyzedLayerId,
        type: 'fill',
        source: 'analyzed-data-source',
        paint: {
            'fill-color': [
                'case',
                ['==', ['get', 'validity'], 'Valid'],
                '#00FF00',
                '#FF0000',
            ],
            'fill-opacity': 0.5,
        },
        layout: {
            visibility: 'visible',
        },
    });

    layers.value.push({
        id: analyzedLayerId,
        name: 'Analyzed Data',
        visible: true,
        uploadTime: new Date().toLocaleString(),
    });

    addClickListener(analyzedLayerId);
};

const validFileTypes = [
    'application/geo+json',
    'application/json',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

const handleDrop = async (e) => {
    const droppedFile = e.dataTransfer.files[0];
    const fileExtension = droppedFile.name.split('.').pop();
    if (isValidFileType(droppedFile) || fileExtension === 'geojson') {
        file.value = droppedFile;
        simulateUpload(droppedFile);
        showSuccess('File uploaded successfully!');
        await processGeoJSONFile(droppedFile);
    } else {
        showError(
            'Invalid file type. Please upload a GeoJSON, CSV, or Excel file.'
        );
    }
};

const handleFileInput = async (e) => {
    const selectedFile = e.target.files[0];
    const fileExtension = selectedFile.name.split('.').pop();

    if (isValidFileType(selectedFile) || fileExtension === 'geojson') {
        file.value = selectedFile;
        simulateUpload(selectedFile);
        showSuccess('File uploaded successfully!');
        await processGeoJSONFile(selectedFile);
    } else {
        showError(
            'Invalid file type. Please upload a GeoJSON, CSV, or Excel file.'
        );
    }
};

const isValidFileType = (file) => {
    return validFileTypes.includes(file.type);
};

const simulateUpload = (file) => {
    uploadProgress.value = 0;
    const fileSize = file.size;
    const chunkSize = fileSize / 10;
    let uploaded = 0;

    const interval = setInterval(() => {
        uploaded += chunkSize;
        uploadProgress.value = Math.min(
            100,
            Math.round((uploaded / fileSize) * 100)
        );
        if (uploadProgress.value >= 100) {
            clearInterval(interval);
        }
    }, 100);
};

const showError = (message) => {
    toast.error(message);
};

const showSuccess = (message) => {
    toast.success(message);
};

const addClickListener = () => {
    map.on('click', 'geojson-layer', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const coordinates = e.lngLat;

            let popupContent = `
        <div class="bg-green-50 p-4 rounded-lg shadow-lg max-w-sm">
          <h3 class="text-lg font-semibold text-green-800 mb-2">Feature Information</h3>
          <div class="space-y-2">
      `;

            for (const [key, value] of Object.entries(feature.properties)) {
                popupContent += `
          <div class="flex justify-between items-center border-b border-green-200 pb-1">
            <span class="text-sm font-medium text-green-700">${key}:</span>
            <span class="text-sm text-green-600">${value}</span>
          </div>
        `;
            }

            popupContent += `
          </div>
        </div>
      `;

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        }
    });

    map.on('mouseenter', 'geojson-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'geojson-layer', () => {
        map.getCanvas().style.cursor = '';
    });
};

const processGeoJSONFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const geojson = JSON.parse(event.target.result);

        if (map.getSource('geojson-source')) {
            map.removeLayer('geojson-layer');
            map.removeSource('geojson-source');
        }

        map.addSource('geojson-source', {
            type: 'geojson',
            data: geojson,
        });

        const layerId = 'geojson-layer';
        map.addLayer({
            id: 'geojson-layer',
            type: 'fill',
            source: 'geojson-source',
            paint: {
                'fill-color': '#228B22',
                'fill-opacity': 0.8,
            },
            layout: {
                visibility: 'visible',
            },
        });

        addClickListener();

        const bounds = new maplibregl.LngLatBounds();
        const extendBounds = (coord) => {
            if (Array.isArray(coord) && coord.length >= 2) {
                bounds.extend([coord[0], coord[1]]);
            }
        };

        geojson.features.forEach((feature) => {
            if (feature.geometry.type === 'Point') {
                extendBounds(feature.geometry.coordinates);
            } else if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(extendBounds);
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach((polygon) => {
                    polygon[0].forEach(extendBounds);
                });
            }
        });

        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 50 });
        }

        await geojsonStore.clearGeoJSON();
        await geojsonStore.addGeoJSONFeatures(geojson.features);
        showTable.value = true;

        layers.value = [
            {
                id: layerId,
                name: file.name,
                visible: true,
                uploadTime: new Date().toLocaleString(),
            },
        ];

        const layer = layers.value.find((l) => l.id === 'geojson-layer');
        if (layer) {
            layer.visible = true;
            map.setLayoutProperty('geojson-layer', 'visibility', 'visible');
        }
    };
    reader.readAsText(file);
};

const toggleLayer = (layerId) => {
    const layer = layers.value.find((l) => l.id === layerId);
    if (layer && map.getLayer(layerId)) {
        layer.visible = !layer.visible;
        const visibility = layer.visible ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);
    }
};

onMounted(() => {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [0, 0],
        zoom: 2,
    });
});
</script>

<style>
#map {
    height: 100%;
}

.toggle-checkbox:checked {
    right: 0;
    border-color: #68d391;
}
.toggle-checkbox:checked + .toggle-label {
    background-color: #68d391;
}
</style>
