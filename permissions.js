/**
* Updates the container's ACL.
*
* @this {BlobService}
* @param {string}                         container                           The container name.
* @param {Object.<string, AccessPolicy>}  signedIdentifiers                   The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
* @param {object}                         [options]                           The request options.
* @param {AccessConditions}               [options.accessConditions]          The access conditions.
* @param {string}                         [options.publicAccessLevel]         Specifies whether data in the container may be accessed publicly and the level of access.
* @param {string}                         [options.leaseId]                   The container lease identifier.
* @param {int}                            [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                            [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                            [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                             execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}                         [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}                           [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                             The default value is false.
* @param {errorOrResult}                  callback                            `error` will contain information
*                                                                             if an error occurs; otherwise `[result]{@link ContainerAclResult}` will contain
*                                                                             information for the container.
*                                                                             `response` will contain information related to this operation.
*/
BlobService.prototype.setContainerAcl = function (container, signedIdentifiers, optionsOrCallback, callback) {
    var userOptions;
    azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
    validate.validateArgs('setContainerAcl', function (v) {
      v.string(container, 'container');
      v.containerNameIsValid(container);
      v.callback(callback);
    });
  
    var options = extend(true, {}, userOptions);
  
    var policies = null;
    if (signedIdentifiers) {
      if (_.isArray(signedIdentifiers)) {
        throw new TypeError(SR.INVALID_SIGNED_IDENTIFIERS);
      }
      policies = AclResult.serialize(signedIdentifiers);
    }
  
    var webResource = WebResource.put(container)
      .withQueryOption(QueryStringConstants.RESTYPE, 'container')
      .withQueryOption(QueryStringConstants.COMP, 'acl')
      .withHeader(HeaderConstants.CONTENT_LENGTH, !azureutil.objectIsNull(policies) ? Buffer.byteLength(policies) : 0)
      .withHeader(HeaderConstants.BLOB_PUBLIC_ACCESS, options.publicAccessLevel)
      .withHeader(HeaderConstants.LEASE_ID, options.leaseId)
      .withBody(policies);
  
    var processResponseCallback = function (responseObject, next) {
      responseObject.containerResult = null;
      if (!responseObject.error) {
        responseObject.containerResult = new ContainerResult(container, options.publicAccessLevel);
        responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
        if (signedIdentifiers) {
          responseObject.containerResult.signedIdentifiers = signedIdentifiers;
        }
      }
  
      var finalCallback = function (returnObject) {
        callback(returnObject.error, returnObject.containerResult, returnObject.response);
      };
  
      next(responseObject, finalCallback);
    };
  
    this.performRequest(webResource, webResource.body, options, processResponseCallback);
};