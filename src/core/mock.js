/**
 * Mock mode for testing the web installer without a physical Android device.
 *
 * Provides simulated device connection, model detection, and firmware
 * compatibility checks. Use this in tests to verify the installer logic
 * without requiring a physical device or ADB fastboot connection.
 */

let mockConnected = false;
let mockDeviceModel = null;
let mockDeviceName = null;
let mockProduct = null;
let mockRelease = null;
let mockDownloadProgress = 0;
let mockDownloadProgressCallback = null;

/**
 * Simulate connecting to a device. In mock mode, this returns true
 * without actually connecting.
 */
export function setMockConnection(connected) {
    mockConnected = connected;
}

/**
 * Simulate the device model being detected via ADB/fastboot.
 * In mock mode, this returns a configured model name.
 */
export function setMockModel(model) {
    mockDeviceModel = model;
}

/**
 * Simulate the device being unlocked (OEM unlocking).
 */
export function setMockUnlocked(locked) {
    mockProduct = mockProduct || "unknown";
    mockDeviceName = mockDeviceName || "unknown";
    mockDeviceModel = mockDeviceModel || "unknown";
    mockConnected = true;
}

/**
 * Set the firmware to be installed (for testing).
 * Also sets the product name for compatibility testing.
 */
export function setMockRelease(release) {
    mockRelease = release;
    if (release && release.product) {
        mockProduct = release.product;
    }
}

/**
 * Simulate downloading a release. In mock mode, this sets the progress
 * to 100% without actually downloading.
 */
export function setMockDownloadProgress(progress) {
    mockDownloadProgress = progress;
}

/**
 * Set a callback for download progress updates.
 */
export function setMockDownloadCallback(cb) {
    mockDownloadProgressCallback = cb;
}

/**
 * Get the simulated connected state.
 */
export function isMockConnected() {
    return mockConnected;
}

/**
 * Get the simulated device model.
 */
export function getMockDeviceModel() {
    return mockDeviceModel;
}

/**
 * Get the simulated device name.
 */
export function getMockDeviceName() {
    return mockDeviceName;
}

/**
 * Get the simulated product name.
 */
export function getMockProduct() {
    return mockProduct;
}

/**
 * Get the simulated release.
 */
export function getMockRelease() {
    return mockRelease;
}

/**
 * Get the simulated download progress.
 */
export function getMockDownloadProgress() {
    return mockDownloadProgress;
}

/**
 * Get the simulated download progress callback.
 */
export function getMockDownloadCallback() {
    return mockDownloadProgressCallback;
}

/**
 * Reset the mock state to defaults.
 */
export function resetMock() {
    mockConnected = false;
    mockDeviceModel = null;
    mockDeviceName = null;
    mockProduct = null;
    mockRelease = null;
    mockDownloadProgress = 0;
}
