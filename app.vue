<template>
    <div class="flex min-h-screen bg-green-100">
        <!-- 40% for file upload -->
        <div
            class="w-1/4 p-8 bg-white rounded-lg shadow-xl flex flex-col justify-center"
        >
            <div
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="border-2 border-dashed border-green-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors duration-300 ease-in-out"
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
            <div v-if="file" class="mt-4">
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
        </div>
        <!-- 60% for map -->
        <div class="w-3/4 h-screen relative">
            <div id="map" class="w-full h-full rounded-lg shadow-xl"></div>
            <UploadDataTable
                v-if="showTable"
                ref="uploadDataTableRef"
                @analyze-request="handleAnalyzeRequest"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { geojsonStore } from './stores/geojsonStore';
import UploadDataTable from './components/UploadDataTable.vue';
import axios from 'axios';

const MAPBOX_ACCESS_TOKEN =
    'pk.eyJ1IjoiZGFudWRlbm5qIiwiYSI6ImNsbjRmZWRzYjA0ZGgya3FoOWZyYTFnczIifQ.ZCLrfouIIbufGF-T3tBj9Q';

const file = ref(null);
const uploadProgress = ref(0);
const fileInput = ref(null);
const showTable = ref(false);
const uploadDataTableRef = ref(null);

let map;

const emit = defineEmits(['analyze-request']);

const analyzeData = () => {
    emit('analyze-request');
};

const handleAnalyzeRequest = async () => {
    if (file.value) {
        try {
            const formData = new FormData();
            formData.append('file', file.value);

            const response = await axios.post(
                'https://api.simtaru-belitung.site/data/v1/read_spatial_data?file_type=geojson',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log(response.data);

            nextTick(() => {
                uploadDataTableRef.value.updateAnalysisResults(response.data);
            });
        } catch (error) {
            console.error('Error analyzing data:', error);
            // Handle error (e.g., show error message to user)
        }
    } else {
        // Handle case when no file is uploaded
        console.error('No file uploaded');
    }
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

        map.addLayer({
            id: 'geojson-layer',
            type: 'fill',
            source: 'geojson-source',
            paint: {
                'fill-color': '#228B22',
                'fill-opacity': 0.8,
            },
        });

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
    };
    reader.readAsText(file);
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
</style>
