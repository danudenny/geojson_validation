import { openDB } from 'idb';

const isIndexedDBAvailable = typeof indexedDB !== 'undefined';

const dbPromise = isIndexedDBAvailable
    ? openDB('geojson-db', 1, {
          upgrade(db) {
              if (!db.objectStoreNames.contains('geojson')) {
                  db.createObjectStore('geojson', {
                      keyPath: 'id',
                      autoIncrement: true,
                  });
              }
          },
      })
    : null;

export const geojsonStore = {
    async addGeoJSONFeatures(features) {
        if (!isIndexedDBAvailable) return;
        const db = await dbPromise;
        const tx = db.transaction('geojson', 'readwrite');
        for (const feature of features) {
            await tx.store.add({ data: feature });
        }
        await tx.done;
    },
    async getAllGeoJSON() {
        if (!isIndexedDBAvailable) return [];
        const db = await dbPromise;
        return await db.getAll('geojson');
    },
    async clearGeoJSON() {
        if (!isIndexedDBAvailable) return;
        const db = await dbPromise;
        await db.clear('geojson');
    },
    async updateGeoJSONWithAnalysis(analysisResults) {
        if (!isIndexedDBAvailable) return;
        const db = await dbPromise;
        const tx = db.transaction('geojson', 'readwrite');
        await tx.store.clear();
        for (const result of analysisResults.results) {
            await tx.store.add({
                data: { type: 'Feature', properties: result },
            });
        }
        for (const result of analysisResults.missing_results) {
            await tx.store.add({
                data: { type: 'Feature', properties: result },
            });
        }
        await tx.done;
    },
};
