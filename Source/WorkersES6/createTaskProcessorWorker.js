import defaultValue from "../Core/defaultValue.js";
import defined from "../Core/defined.js";
import formatError from "../Core/formatError.js";
import when from "../ThirdParty/when.js";

// createXXXGeometry functions may return Geometry or a Promise that resolves to Geometry
// if the function requires access to ApproximateTerrainHeights.
// For fully synchronous functions, just wrapping the function call in a `when` Promise doesn't
// handle errors correctly, hence try-catch
function callAndWrap(workerFunction, parameters, transferableObjects) {
  var resultOrPromise;
  try {
    resultOrPromise = workerFunction(parameters, transferableObjects);
    return resultOrPromise; // errors handled by Promise
  } catch (e) {
    return when.reject(e);
  }
}

/**
 * 创建适配器功能以允许计算功能作为Web Worker进行操作，与TaskProcessor配对使用，以接收任务并返回结果。
 *
 * @function createTaskProcessorWorker
 *
 * @param {createTaskProcessorWorker.WorkerFunction} workerFunction 计算功能，它接受参数并返回结果,
 *        which takes parameters and returns a result.
 * @returns {createTaskProcessorWorker.TaskProcessorWorkerFunction} A function that adapts the
 *          calculation function to work as a Web Worker onmessage listener with TaskProcessor.
 *
 * 
 * @example
 * function doCalculation(parameters, transferableObjects) {
 *   // calculate some result using the inputs in parameters
 *   return result;
 * }
 *
 * return Cesium.createTaskProcessorWorker(doCalculation);
 * // the resulting function is compatible with TaskProcessor
 *
 * @see TaskProcessor
 * @see {@link http://www.w3.org/TR/workers/|Web Workers}
 * @see {@link http://www.w3.org/TR/html5/common-dom-interfaces.html#transferable-objects|Transferable objects}
 */
function createTaskProcessorWorker(workerFunction) {
  var postMessage;

  return function (event) {
    var data = event.data;

    var transferableObjects = [];
    var responseMessage = {
      id: data.id,
      result: undefined,
      error: undefined,
    };

    return when(
      callAndWrap(workerFunction, data.parameters, transferableObjects)
    )
      .then(function (result) {
        responseMessage.result = result;
      })
      .otherwise(function (e) {
        if (e instanceof Error) {
          // Errors can't be posted in a message, copy the properties
          responseMessage.error = {
            name: e.name,
            message: e.message,
            stack: e.stack,
          };
        } else {
          responseMessage.error = e;
        }
      })
      .always(function () {
        if (!defined(postMessage)) {
          postMessage = defaultValue(self.webkitPostMessage, self.postMessage);
        }

        if (!data.canTransferArrayBuffer) {
          transferableObjects.length = 0;
        }

        try {
          postMessage(responseMessage, transferableObjects);
        } catch (e) {
          // something went wrong trying to post the message, post a simpler
          // error that we can be sure will be cloneable
          responseMessage.result = undefined;
          responseMessage.error =
            "postMessage failed with error: " +
            formatError(e) +
            "\n  with responseMessage: " +
            JSON.stringify(responseMessage);
          postMessage(responseMessage);
        }
      });
  };
}

/**
 * A function that performs a calculation in a Web Worker.
 * @callback createTaskProcessorWorker.WorkerFunction
 *
 * @param {Object} parameters Parameters to the calculation.
 * @param {Array} transferableObjects An array that should be filled with references to objects inside
 *        the result that should be transferred back to the main document instead of copied.
 * @returns {Object} The result of the calculation.
 *
 * @example
 * function calculate(parameters, transferableObjects) {
 *   // perform whatever calculation is necessary.
 *   var typedArray = new Float32Array(0);
 *
 *   // typed arrays are transferable
 *   transferableObjects.push(typedArray)
 *
 *   return {
 *      typedArray : typedArray
 *   };
 * }
 */

/**
 * A Web Worker message event handler function that handles the interaction with TaskProcessor,
 * specifically, task ID management and posting a response message containing the result.
 * @callback createTaskProcessorWorker.TaskProcessorWorkerFunction
 *
 * @param {Object} event The onmessage event object.
 */
export default createTaskProcessorWorker;
