/**
 * Utility for communicating with the native app layer (iOS/Android).
 */

/**
 * Sends a message to the native app.
 * Detects the environment (iOS WebKit or Android WebView) and sends the message appropriately.
 * 
 * Target Interface: 'native'
 * 
 * @param {string|object} message - The message or command command to send to the native app.
 */
export const sendMessageToNative = (message) => {
    try {
        // iOS (WKWebView)
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
            window.webkit.messageHandlers.native.postMessage(message);
        }
        // Android (WebView)
        else if (window.native && window.native.postMessage) {
            window.native.postMessage(message);
        }
        // Fallback / Dev environment
        else {
            console.warn('Native bridge not detected. Message ignored:', message);
        }
    } catch (err) {
        console.error('Error sending message to native:', err);
    }
};

/**
 * Requests camera permission from the native device.
 * Sends the 'requestCameraPermission' command to the native layer.
 */
export const requestCameraPermission = () => {
    sendMessageToNative('requestCameraPermission');
};
