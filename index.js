const app = require('express')();
const azure = require('azure-storage');
const bodyParser = require('body-parser');
const blobService = azure.createBlobService('DefaultEndpointsProtocol=https==;EndpointSuffix=core.windows.net');

const getStream = require('into-stream');
const container = 'velostics-container-dev';
var hostName = '';
const task = '1191/yoyo';
const filename = 'test.txt';
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });

// blobService.createContainerIfNotExists(container, error => {
//   if (error) return console.log(error);
// //   blobService.createBlockBlobFromLocalFile(
// //     container,
// //     task,
// //     filename,
// //     (error, result) => {
// //       if (error) return console.log(error);
// //       console.dir(result, { depth: null, colors: true });
// //     }
// //   );
// });

// const getBlobTempPublicUrl = (containerName, blobName) => {
 
//     const startDate = new Date();
//     const expiryDate = new Date(startDate);
//     expiryDate.setMinutes(startDate.getMinutes() + 100);
//     startDate.setMinutes(startDate.getMinutes() - 100);
    
//     const sharedAccessPolicy = {
//         AccessPolicy: {
//             Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
//             Start: startDate,
//             Expiry: expiryDate
//         }
//     };
    
//     const token = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
    
//     return blobService.getUrl(containerName, blobName, token);
// }

// blobService.listBlobsSegmentedWithPrefix(container, 'images', null, {delimiter: "", maxResults : 100}, function(err, result) {
//     if (err) {
//         console.log("Couldn't list blobs for container %s", container);
//         console.error(err);
//     } else {
//         console.log('Successfully listed blobs for container %s', container);
//         console.log(result.entries);
//     }
// });

// const uploadFileToBlob = async (directoryPath, file) => {
 
//     return new Promise((resolve, reject) => {
//         console.log(file);
//         const blobName = getBlobName(file.originalname);
//         const stream = getStream(file.buffer);
//         const streamLength = file.buffer.length;
 
//         blobService.createBlockBlobFromStream(container, `${directoryPath}/${blobName}`, stream, streamLength, err => {
//             console.log(err);
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ filename: blobName, 
//                     originalname: file.originalname, 
//                     size: streamLength, 
//                     path: `${container}/${directoryPath}/${blobName}`,
//                     url: `https://blob.core.windows.net/${container}/${directoryPath}/${blobName}` });
//             }
//         });
 
//     });
// };

// const getBlobName = originalName => {
//     const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
//     return `${identifier}-${originalName}`;
// };

// const imageUpload = async(req, res, next) => {
//     console.log(req.file); 
//     try {
//         uploadFileToBlob('images',req.file).then((res) => {
//             console.log(res);
//         }).catch(err => console.log(err));
//     } catch (error) {
//         next(error);
//     }
    
// }

const uploader = require('./azure_storage');
uploader.gatImagesFromDirectory('12345').then(res => console.log(res));
app.post('/upload/image', singleFileUpload.single('image'), (req, res) => {
    if(req.file) {
        console.log(req.file);
        uploader.uploadFile('12345', req.file).then(res => console.log(res)).catch(err => {
            console.log(err);
        });
    }
});
app.use('/', (err, req, res) => {
    console.log(err);
})
 
 
app.listen(3000, () => console.log(`Example app listening on port3000!`))