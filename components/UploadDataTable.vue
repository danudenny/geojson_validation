<template>
    <div>
        <div
            v-show="!isMinimized"
            class="overflow-x-auto bg-green-50 p-4 rounded-md shadow-lg absolute top-4 right-4 z-10 h-[97vh]"
            :class="analysisResults ? 'w-[810px]' : 'w-[500px]'"
        >
            <div class="flex justify-between items-center mb-2">
                <div class="flex gap-2">
                    <h2 class="text-lg font-semibold text-green-800">
                        Data Table
                    </h2>
                    <button
                        v-if="analysisResults"
                        @click="exportToExcel"
                        :disabled="isExporting"
                        class="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="!isExporting">Export to Excel</span>
                        <span v-else class="flex items-center justify-center">
                            <svg
                                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                ></circle>
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Exporting...
                        </span>
                    </button>
                </div>
                <button
                    @click="toggleMinimize"
                    class="text-green-600 hover:text-green-800"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        class="w-6 h-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <div class="mb-4 space-y-2">
                <div class="flex space-x-2">
                    <input
                        v-model="producerNameQuery"
                        @input="handleSearch"
                        type="text"
                        placeholder="Search Producer Name..."
                        class="w-1/2 px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        v-model="locationQuery"
                        @input="handleSearch"
                        type="text"
                        placeholder="Search Country/Province/District..."
                        class="w-1/2 px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div v-if="analysisResults" class="flex space-x-2">
                    <select
                        v-model="isOnLandQuery"
                        @change="handleSearch"
                        class="flex-1 px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">All (Located on Land)</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                    <select
                        v-model="validityQuery"
                        @change="handleSearch"
                        class="flex-1 px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">All (Validity)</option>
                        <option value="valid">Valid</option>
                        <option value="invalid">Invalid</option>
                    </select>
                    <select
                        v-model="isDuplicatedQuery"
                        @change="handleSearch"
                        class="flex-1 px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">All (Is Duplicated)</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div class="flex space-x-2">
                    <button
                        @click="resetFilters"
                        class="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
                    >
                        Reset Filters
                    </button>
                    <button
                        @click="analyzeData"
                        :disabled="isAnalyzing"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="!isAnalyzing">Analyze Data</span>
                        <span v-else class="flex items-center justify-center">
                            <svg
                                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                ></circle>
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Analyzing...
                        </span>
                    </button>
                </div>
            </div>

            <div
                class="overflow-y-auto max-h-[70vh]"
                @scroll="onScroll"
                ref="tableContainer"
            >
                <table
                    class="min-w-full bg-white border border-green-200 text-xs"
                >
                    <thead class="bg-green-100 text-center">
                        <tr>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                <input
                                    type="checkbox"
                                    v-model="selectAll"
                                    @change="toggleSelectAll"
                                />
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                ID
                            </th>
                            <th
                                v-show="!analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Producer Country
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Supplier
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Plot ID
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Farmer ID
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Plot Size (Ha)
                            </th>
                            <th
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Farmer Name
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Country
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Province
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                District
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Located On Land (?)
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Validity
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Is Duplicated
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Duplicated Reason (?)
                            </th>
                            <th
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-200 text-green-800"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, index) in visibleData"
                            :key="item.id"
                            class="hover:bg-green-50"
                        >
                            <td class="py-2 px-4 border-b border-green-100">
                                <input
                                    type="checkbox"
                                    v-model="selectedItems"
                                    :value="item.id"
                                />
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{
                                    !analysisResults
                                        ? index + 1
                                        : item.data.properties.ID
                                }}
                            </td>
                            <td
                                v-show="!analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{
                                    item.data.properties.ProducerCountry ||
                                    item.data.properties.Country
                                }}
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{ item.data.properties.Supplier || '-' }}
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{ item.data.properties.Plot_ID || '-' }}
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{ item.data.properties.Farmer_ID || '-' }}
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{ item.data.properties.Plot_Size || '-' }}
                            </td>
                            <td class="py-2 px-4 border-b border-green-100">
                                {{ item.data.properties.Farmer_Name || '-' }}
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{ item.data.properties.country }}
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{ item.data.properties.province }}
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{ item.data.properties.district }}
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100 text-xs"
                            >
                                <span
                                    :class="
                                        item.data.properties.located_on_land
                                            ? 'bg-green-500 text-white rounded-sm px-2 py-1'
                                            : 'bg-red-500 text-white rounded-sm px-2 py-1'
                                    "
                                >
                                    {{
                                        item.data.properties.located_on_land
                                            ? 'Yes'
                                            : 'No'
                                    }}
                                </span>
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{ item.data.properties.validity }}
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                <span
                                    :class="
                                        item.data.properties.is_duplicated
                                            ? 'bg-green-500 text-white rounded-sm px-2 py-1'
                                            : 'bg-red-500 text-white rounded-sm px-2 py-1'
                                    "
                                >
                                    {{
                                        item.data.properties.is_duplicated
                                            ? 'Yes'
                                            : 'No'
                                    }}
                                </span>
                            </td>
                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                {{
                                    getDuplicateReason(
                                        item.data.properties.duplicate_reason
                                    )
                                }}
                            </td>

                            <td
                                v-show="analysisResults"
                                class="py-2 px-4 border-b border-green-100"
                            >
                                <button
                                    @click="showOnMap(item)"
                                    class="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full transition duration-150 ease-in-out"
                                    title="Show on Map"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                        />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 text-sm text-green-800 font-semibold">
                Total Data: {{ geojsonData.length }} | Filtered Data:
                {{ filteredData.length }}
            </div>
        </div>
        <button
            v-show="isMinimized"
            @click="toggleMinimize"
            class="absolute top-4 right-4 z-10 bg-green-100 p-2 rounded-md shadow-md"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-green-600"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch, defineExpose } from 'vue';
import * as XLSX from 'xlsx';

import { geojsonStore } from '../stores/geojsonStore';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const geojsonData = ref([]);
const visibleData = ref([]);
const isMinimized = ref(false);
const itemsPerPage = 20;
let currentPage = 0;
const tableContainer = ref(null);
const producerNameQuery = ref('');
const analysisResults = ref(null);
const isAnalyzing = ref(false);
const isExporting = ref(false);

const showAnalysisResults = ref(false);

const locationQuery = ref('');
const isOnLandQuery = ref('');
const validityQuery = ref('');
const isDuplicatedQuery = ref('');

const selectedItems = ref([]);
const selectAll = ref(false);

const showOnMap = (item) => {
    emit('show-on-map', item);
};

const emit = defineEmits(['analyze-request', 'show-on-map']);

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedItems.value = visibleData.value.map((item) => item.id);
    } else {
        selectedItems.value = [];
    }
};

watch(selectedItems, (newValue) => {
    selectAll.value = newValue.length === visibleData.value.length;
});

const filteredData = computed(() => {
    return geojsonData.value.filter((item) => {
        const producerName = item.data.properties.ProducerName.toLowerCase();
        const nameMatch = producerName.includes(
            producerNameQuery.value.toLowerCase()
        );

        let locationMatch = true;
        let onLandMatch = true;
        let validityMatch = true;
        let duplicatedMatch = true;

        if (analysisResults.value) {
            const location = `${item.data.properties.country || ''} ${
                item.data.properties.province || ''
            } ${item.data.properties.district || ''}`.toLowerCase();
            locationMatch = location.includes(
                locationQuery.value.toLowerCase()
            );

            if (isOnLandQuery.value !== '') {
                onLandMatch =
                    item.data.properties.located_on_land ===
                    (isOnLandQuery.value === 'true');
            }

            if (validityQuery.value !== '') {
                validityMatch =
                    item.data.properties.validity === validityQuery.value;
            }

            if (isDuplicatedQuery.value !== '') {
                duplicatedMatch =
                    item.data.properties.is_duplicated ===
                    (isDuplicatedQuery.value === 'true');
            }
        }

        return (
            nameMatch &&
            locationMatch &&
            onLandMatch &&
            validityMatch &&
            duplicatedMatch
        );
    });
});

const handleSearch = () => {
    currentPage = 0;
    visibleData.value = [];
    loadMoreData();
};

const resetFilters = () => {
    producerNameQuery.value = '';
    locationQuery.value = '';
    isOnLandQuery.value = '';
    validityQuery.value = '';
    isDuplicatedQuery.value = '';
    handleSearch();
};

const loadMoreData = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const newItems = filteredData.value.slice(start, end);
    if (newItems.length > 0) {
        visibleData.value = [...visibleData.value, ...newItems];
        currentPage++;
    }
};

const getDuplicateReason = (reason) => {
    switch (reason) {
        case 'polygon_duplicate':
            return 'Polygon Duplicate';
        case 'internal_duplicate_points':
            return 'Internal Duplicate Points';
        default:
            return '-';
    }
};

const onScroll = () => {
    if (tableContainer.value) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainer.value;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            loadMoreData();
        }
    }
};

const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value;
};

watch(filteredData, () => {
    handleSearch();
});

const updateAnalysisResults = async (results) => {
    analysisResults.value = results;
    await geojsonStore.updateGeoJSONWithAnalysis(results);
    geojsonData.value = await geojsonStore.getAllGeoJSON();
    handleSearch();
    isAnalyzing.value = false;
    toast.success('Analysis completed successfully!');
};

const analyzeData = () => {
    toast.info('Analyzing data...');
    isAnalyzing.value = true;
    emit('analyze-request');
};

const exportToExcel = async () => {
    if (isExporting.value) return;

    isExporting.value = true;
    try {
        const allData = await geojsonStore.getAllGeoJSON();

        let dataToExport;
        if (selectedItems.value.length > 0) {
            dataToExport = allData.filter((item) =>
                selectedItems.value.includes(item.id)
            );
        } else {
            dataToExport = allData;
        }

        const excelData = dataToExport.map((item) => ({
            ID: item.data.properties.ID,
            Supplier: item.data.properties.Supplier,
            Plot_ID: item.data.properties.Plot_ID,
            Farmer_ID: item.data.properties.Farmer_ID,
            Plot_Size: item.data.properties.Plot_Size,
            Farmer_Name: item.data.properties.Farmer_Name,
            Country: item.data.properties.country,
            Province: item.data.properties.province,
            District: item.data.properties.district,
            Located_On_Land: item.data.properties.located_on_land
                ? 'Yes'
                : 'No',
            Validity: item.data.properties.validity,
            Is_Duplicated: item.data.properties.is_duplicated ? 'Yes' : 'No',
            Duplicated_With: item.data.properties.duplicated_with,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'GeoJSON Data');

        XLSX.writeFile(wb, 'geojson_data_export.xlsx');

        toast.success('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        toast.error('Failed to export data. Please try again.');
    } finally {
        isExporting.value = false;
    }
};

defineExpose({
    updateAnalysisResults,
});

onMounted(async () => {
    if (typeof window !== 'undefined') {
        geojsonData.value = await geojsonStore.getAllGeoJSON();
        loadMoreData();
    }
});
</script>

<style scoped>
table {
    border-collapse: collapse;
}

th,
td {
    text-align: left;
}
</style>
