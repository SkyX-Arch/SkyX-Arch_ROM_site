/**
 * Mock fastboot wrapper for testing the web installer without a physical device.
 *
 * This module implements the same interface as android-fastboot.FastbootDevice
 * but uses mock data. It allows the installer to run in mock mode for testing
 * purposes without requiring a physical Android device.
 */

import { setMockConnection, setMockModel, setMockUnlocked, setMockRelease, setMockDownloadProgress, setMockDownloadCallback, resetMock } from "./mock";

/**
 * Create a mock fastboot device that returns simulated data.
 *
 * @param {Object} [config] - Configuration object
 * @param {boolean} [config.connected=true] - Whether the device is "connected"
 * @param {string} [config.model="unknown"] - Simulated device model
 * @param {string} [config.product="unknown"] - Simulated product name
 * @param {Object} [config.release] - Simulated release info
 * @returns {FastbootMock} - A mock fastboot device instance
 */
export function createMockFastbootDevice(config = {}) {
    const {
        connected = true,
        model = "unknown",
        product = "unknown",
        release = null,
    } = config;

    setMockConnection(connected);
    setMockModel(model);
    setMockProduct(product);
    setMockUnlocked(false);
    if (release) {
        setMockRelease(release);
    }

    return {
        isConnected: () => mockConnected,
        connect: async () => {
            // In mock mode, connection is always successful
            return Promise.resolve();
        },
        disconnect: async () => {
            setMockConnection(false);
            return Promise.resolve();
        },
        getVariable: async (variable) => {
            // Simulate device variables
            if (variable === "product") {
                return mockProduct || "unknown";
            }
            if (variable === "unlocked") {
                return "no";
            }
            return null;
        },
        runCommand: async (command) => {
            // Simulate command execution
            return Promise.resolve();
        },
        flashFactoryZip: async (blob, clean, onReconnect, callback) => {
            // Simulate flashing
            if (onReconnect) {
                onReconnect();
            }
            if (callback) {
                callback("boot", "verify");
                callback("vendor_boot", "verify");
            }
            return Promise.resolve();
        },
        reboot: async (mode, args, callback) => {
            // Simulate reboot
            if (args && args.length > 0 && args[0] === "bootloader") {
                callback();
            }
            return Promise.resolve();
        },
        getVariable: async (variable) => {
            return mockProduct || "unknown";
        },
    };
}
