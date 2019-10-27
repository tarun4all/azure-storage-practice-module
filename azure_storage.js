const azure = require('azure-storage');
const getStream = require('into-stream');
const container = process.env.AZURE_STORAGE_CONTAINER || 'velostics-container-dev';
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
const baseURL = process.env.AZURE_STORAGE_BASE_URL || '';

module.exports = {
    uploadFile: async (directoryPath, file) => {
        return new Promise((resolve, reject) => {
            try {
                const blobName = file.originalname;
                const stream = getStream(file.buffer);
                const streamLength = file.buffer.length;
        
                blobService.createBlockBlobFromStream(container, `${directoryPath}/${blobName}`, stream, streamLength, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ filename: blobName, 
                            originalname: file.originalname, 
                            size: streamLength, 
                            path: `${container}/${directoryPath}/${blobName}`,
                            url: `${baseURL}/${container}/${directoryPath}/${blobName}` });
                    }
                });
            } catch(err) {
                reject(err);
            }
        });
    },
    gatImagesFromDirectory: async (directoryPath) => {
        return new Promise((resolve, reject) => {
            try {
                blobService.listBlobsSegmentedWithPrefix(container, directoryPath, null, {delimiter: "", maxResults : 1000}, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.entries.map(el => `${baseURL}/${container}/${el.name}`));
                    }
                });
            } catch(err) {
                reject(err);
            }
        });
    }
}