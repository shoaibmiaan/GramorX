/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/sw.js":
/*!**********************!*\
  !*** ./public/sw.js ***!
  \**********************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval(__webpack_require__.ts("/* eslint-disable no-undef */ importScripts(\"https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js\");\n// Precache Next.js assets and additional static files used in drills\nworkbox.precaching.precacheAndRoute([] || []);\nworkbox.precaching.precacheAndRoute([\n    {\n        url: \"/brand/logo.png\",\n        revision: null\n    },\n    {\n        url: \"/locales/en/common.json\",\n        revision: null\n    },\n    {\n        url: \"/locales/ur/common.json\",\n        revision: null\n    },\n    {\n        url: \"/premium.css\",\n        revision: null\n    }\n]);\n// Cache practice, vocabulary, and drafts pages\nworkbox.routing.registerRoute((param)=>{\n    let { url } = param;\n    return url.pathname.startsWith(\"/practice\") || url.pathname.startsWith(\"/vocab\") || url.pathname.startsWith(\"/drafts\");\n}, new workbox.strategies.NetworkFirst({\n    cacheName: \"pages-cache\"\n}));\n// Background sync to flush queued requests when online\nself.addEventListener(\"sync\", (event)=>{\n    if (event.tag === \"offline-queue\") {\n        event.waitUntil(flushQueue());\n    }\n});\nasync function flushQueue() {\n    const db = await openDB();\n    const tx = db.transaction(\"requests\", \"readwrite\");\n    const store = tx.objectStore(\"requests\");\n    const all = store.getAll();\n    return new Promise((resolve, reject)=>{\n        all.onsuccess = async ()=>{\n            const items = all.result;\n            for (const entry of items){\n                try {\n                    await fetch(entry.url, {\n                        method: entry.method || \"POST\",\n                        headers: {\n                            \"Content-Type\": \"application/json\"\n                        },\n                        body: JSON.stringify(entry.body)\n                    });\n                } catch (err) {\n                    console.error(\"Sync failed\", err);\n                    reject(err);\n                    return;\n                }\n            }\n            store.clear();\n            tx.oncomplete = resolve;\n            tx.onerror = ()=>reject(tx.error);\n        };\n        all.onerror = ()=>reject(all.error);\n    });\n}\nfunction openDB() {\n    return new Promise((resolve, reject)=>{\n        const request = indexedDB.open(\"offline-sync\", 1);\n        request.onupgradeneeded = ()=>{\n            request.result.createObjectStore(\"requests\", {\n                autoIncrement: true\n            });\n        };\n        request.onsuccess = ()=>resolve(request.result);\n        request.onerror = ()=>reject(request.error);\n    });\n}\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wdWJsaWMvc3cuanMiLCJtYXBwaW5ncyI6IkFBQUEsMkJBQTJCLEdBQzNCQSxjQUFjO0FBRWQscUVBQXFFO0FBQ3JFQyxRQUFRQyxVQUFVLENBQUNDLGdCQUFnQixDQUFDQyxLQUFLQyxhQUFhLElBQUksRUFBRTtBQUM1REosUUFBUUMsVUFBVSxDQUFDQyxnQkFBZ0IsQ0FBQztJQUNsQztRQUFFRyxLQUFLO1FBQW1CQyxVQUFVO0lBQUs7SUFDekM7UUFBRUQsS0FBSztRQUEyQkMsVUFBVTtJQUFLO0lBQ2pEO1FBQUVELEtBQUs7UUFBMkJDLFVBQVU7SUFBSztJQUNqRDtRQUFFRCxLQUFLO1FBQWdCQyxVQUFVO0lBQUs7Q0FDdkM7QUFFRCwrQ0FBK0M7QUFDL0NOLFFBQVFPLE9BQU8sQ0FBQ0MsYUFBYSxDQUMzQjtRQUFDLEVBQUVILEdBQUcsRUFBRTtXQUNOQSxJQUFJSSxRQUFRLENBQUNDLFVBQVUsQ0FBQyxnQkFDeEJMLElBQUlJLFFBQVEsQ0FBQ0MsVUFBVSxDQUFDLGFBQ3hCTCxJQUFJSSxRQUFRLENBQUNDLFVBQVUsQ0FBQztHQUMxQixJQUFJVixRQUFRVyxVQUFVLENBQUNDLFlBQVksQ0FBQztJQUFFQyxXQUFXO0FBQWM7QUFHakUsdURBQXVEO0FBQ3ZEVixLQUFLVyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUNDO0lBQzdCLElBQUlBLE1BQU1DLEdBQUcsS0FBSyxpQkFBaUI7UUFDakNELE1BQU1FLFNBQVMsQ0FBQ0M7SUFDbEI7QUFDRjtBQUVBLGVBQWVBO0lBQ2IsTUFBTUMsS0FBSyxNQUFNQztJQUNqQixNQUFNQyxLQUFLRixHQUFHRyxXQUFXLENBQUMsWUFBWTtJQUN0QyxNQUFNQyxRQUFRRixHQUFHRyxXQUFXLENBQUM7SUFDN0IsTUFBTUMsTUFBTUYsTUFBTUcsTUFBTTtJQUN4QixPQUFPLElBQUlDLFFBQVEsQ0FBQ0MsU0FBU0M7UUFDM0JKLElBQUlLLFNBQVMsR0FBRztZQUNkLE1BQU1DLFFBQVFOLElBQUlPLE1BQU07WUFDeEIsS0FBSyxNQUFNQyxTQUFTRixNQUFPO2dCQUN6QixJQUFJO29CQUNGLE1BQU1HLE1BQU1ELE1BQU01QixHQUFHLEVBQUU7d0JBQ3JCOEIsUUFBUUYsTUFBTUUsTUFBTSxJQUFJO3dCQUN4QkMsU0FBUzs0QkFBRSxnQkFBZ0I7d0JBQW1CO3dCQUM5Q0MsTUFBTUMsS0FBS0MsU0FBUyxDQUFDTixNQUFNSSxJQUFJO29CQUNqQztnQkFDRixFQUFFLE9BQU9HLEtBQUs7b0JBQ1pDLFFBQVFDLEtBQUssQ0FBQyxlQUFlRjtvQkFDN0JYLE9BQU9XO29CQUNQO2dCQUNGO1lBQ0Y7WUFDQWpCLE1BQU1vQixLQUFLO1lBQ1h0QixHQUFHdUIsVUFBVSxHQUFHaEI7WUFDaEJQLEdBQUd3QixPQUFPLEdBQUcsSUFBTWhCLE9BQU9SLEdBQUdxQixLQUFLO1FBQ3BDO1FBQ0FqQixJQUFJb0IsT0FBTyxHQUFHLElBQU1oQixPQUFPSixJQUFJaUIsS0FBSztJQUN0QztBQUNGO0FBRUEsU0FBU3RCO0lBQ1AsT0FBTyxJQUFJTyxRQUFRLENBQUNDLFNBQVNDO1FBQzNCLE1BQU1pQixVQUFVQyxVQUFVQyxJQUFJLENBQUMsZ0JBQWdCO1FBQy9DRixRQUFRRyxlQUFlLEdBQUc7WUFDeEJILFFBQVFkLE1BQU0sQ0FBQ2tCLGlCQUFpQixDQUFDLFlBQVk7Z0JBQUVDLGVBQWU7WUFBSztRQUNyRTtRQUNBTCxRQUFRaEIsU0FBUyxHQUFHLElBQU1GLFFBQVFrQixRQUFRZCxNQUFNO1FBQ2hEYyxRQUFRRCxPQUFPLEdBQUcsSUFBTWhCLE9BQU9pQixRQUFRSixLQUFLO0lBQzlDO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcHVibGljL3N3LmpzPzRiODgiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmltcG9ydFNjcmlwdHMoJ2h0dHBzOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS93b3JrYm94LWNkbi9yZWxlYXNlcy82LjUuNC93b3JrYm94LXN3LmpzJyk7XG5cbi8vIFByZWNhY2hlIE5leHQuanMgYXNzZXRzIGFuZCBhZGRpdGlvbmFsIHN0YXRpYyBmaWxlcyB1c2VkIGluIGRyaWxsc1xud29ya2JveC5wcmVjYWNoaW5nLnByZWNhY2hlQW5kUm91dGUoc2VsZi5fX1dCX01BTklGRVNUIHx8IFtdKTtcbndvcmtib3gucHJlY2FjaGluZy5wcmVjYWNoZUFuZFJvdXRlKFtcbiAgeyB1cmw6ICcvYnJhbmQvbG9nby5wbmcnLCByZXZpc2lvbjogbnVsbCB9LFxuICB7IHVybDogJy9sb2NhbGVzL2VuL2NvbW1vbi5qc29uJywgcmV2aXNpb246IG51bGwgfSxcbiAgeyB1cmw6ICcvbG9jYWxlcy91ci9jb21tb24uanNvbicsIHJldmlzaW9uOiBudWxsIH0sXG4gIHsgdXJsOiAnL3ByZW1pdW0uY3NzJywgcmV2aXNpb246IG51bGwgfSxcbl0pO1xuXG4vLyBDYWNoZSBwcmFjdGljZSwgdm9jYWJ1bGFyeSwgYW5kIGRyYWZ0cyBwYWdlc1xud29ya2JveC5yb3V0aW5nLnJlZ2lzdGVyUm91dGUoXG4gICh7IHVybCB9KSA9PlxuICAgIHVybC5wYXRobmFtZS5zdGFydHNXaXRoKCcvcHJhY3RpY2UnKSB8fFxuICAgIHVybC5wYXRobmFtZS5zdGFydHNXaXRoKCcvdm9jYWInKSB8fFxuICAgIHVybC5wYXRobmFtZS5zdGFydHNXaXRoKCcvZHJhZnRzJyksXG4gIG5ldyB3b3JrYm94LnN0cmF0ZWdpZXMuTmV0d29ya0ZpcnN0KHsgY2FjaGVOYW1lOiAncGFnZXMtY2FjaGUnIH0pXG4pO1xuXG4vLyBCYWNrZ3JvdW5kIHN5bmMgdG8gZmx1c2ggcXVldWVkIHJlcXVlc3RzIHdoZW4gb25saW5lXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3N5bmMnLCAoZXZlbnQpID0+IHtcbiAgaWYgKGV2ZW50LnRhZyA9PT0gJ29mZmxpbmUtcXVldWUnKSB7XG4gICAgZXZlbnQud2FpdFVudGlsKGZsdXNoUXVldWUoKSk7XG4gIH1cbn0pO1xuXG5hc3luYyBmdW5jdGlvbiBmbHVzaFF1ZXVlKCkge1xuICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EQigpO1xuICBjb25zdCB0eCA9IGRiLnRyYW5zYWN0aW9uKCdyZXF1ZXN0cycsICdyZWFkd3JpdGUnKTtcbiAgY29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZSgncmVxdWVzdHMnKTtcbiAgY29uc3QgYWxsID0gc3RvcmUuZ2V0QWxsKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgYWxsLm9uc3VjY2VzcyA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gYWxsLnJlc3VsdDtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgaXRlbXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBmZXRjaChlbnRyeS51cmwsIHtcbiAgICAgICAgICAgIG1ldGhvZDogZW50cnkubWV0aG9kIHx8ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZW50cnkuYm9keSksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N5bmMgZmFpbGVkJywgZXJyKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0b3JlLmNsZWFyKCk7XG4gICAgICB0eC5vbmNvbXBsZXRlID0gcmVzb2x2ZTtcbiAgICAgIHR4Lm9uZXJyb3IgPSAoKSA9PiByZWplY3QodHguZXJyb3IpO1xuICAgIH07XG4gICAgYWxsLm9uZXJyb3IgPSAoKSA9PiByZWplY3QoYWxsLmVycm9yKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9wZW5EQigpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4oJ29mZmxpbmUtc3luYycsIDEpO1xuICAgIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKCkgPT4ge1xuICAgICAgcmVxdWVzdC5yZXN1bHQuY3JlYXRlT2JqZWN0U3RvcmUoJ3JlcXVlc3RzJywgeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pO1xuICAgIH07XG4gICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoKSA9PiByZXNvbHZlKHJlcXVlc3QucmVzdWx0KTtcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbImltcG9ydFNjcmlwdHMiLCJ3b3JrYm94IiwicHJlY2FjaGluZyIsInByZWNhY2hlQW5kUm91dGUiLCJzZWxmIiwiX19XQl9NQU5JRkVTVCIsInVybCIsInJldmlzaW9uIiwicm91dGluZyIsInJlZ2lzdGVyUm91dGUiLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJzdHJhdGVnaWVzIiwiTmV0d29ya0ZpcnN0IiwiY2FjaGVOYW1lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidGFnIiwid2FpdFVudGlsIiwiZmx1c2hRdWV1ZSIsImRiIiwib3BlbkRCIiwidHgiLCJ0cmFuc2FjdGlvbiIsInN0b3JlIiwib2JqZWN0U3RvcmUiLCJhbGwiLCJnZXRBbGwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uc3VjY2VzcyIsIml0ZW1zIiwicmVzdWx0IiwiZW50cnkiLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImNsZWFyIiwib25jb21wbGV0ZSIsIm9uZXJyb3IiLCJyZXF1ZXN0IiwiaW5kZXhlZERCIiwib3BlbiIsIm9udXBncmFkZW5lZWRlZCIsImNyZWF0ZU9iamVjdFN0b3JlIiwiYXV0b0luY3JlbWVudCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./public/sw.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	!function() {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = function() {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: function(script) { return script; }
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	!function() {
/******/ 		__webpack_require__.ts = function(script) { return __webpack_require__.tt().createScript(script); };
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	!function() {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push(function(options) {
/******/ 			var originalFactory = options.factory;
/******/ 			options.factory = function(moduleObject, moduleExports, webpackRequire) {
/******/ 				var hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				var cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : function() {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/sw.js");
/******/ 	
/******/ })()
;