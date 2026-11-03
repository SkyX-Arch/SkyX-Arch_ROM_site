import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import Config from "./config";
import * as common from "./core/common";
import * as errors from "./core/errors";
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";
import { createMockFastbootDevice } from "./core/mock-fastboot";
import { BlobStore } from "./core/download";

Vue.config.productionTip = false;

Vue.mixin({
    methods: {
        saEvent: common.logEvent,

        $bubble(event, ...args) {
            let component = this;
            do {
                component.$emit(event, ...args);
                component = component.$parent;
            } while (component);
        },

        bubbleError(err, retryCallback = undefined) {
            let errEvent = null;
            let errMessage = err.message;
            if (errors.isConnectSelectError(err)) {
                errEvent = "ConnectSelect";
                errMessage = "No device selected";
            } else if (errors.isConnectUdevError(err)) {
                errEvent = "ConnectUdev";
                errMessage = "Access denied";
            } else if (errors.isClaimError(err)) {
                errEvent = "Claim";
                errMessage = "Can't control device";
            } else if (errors.isDisconnectError(err)) {
                errEvent = "Disconnect";
                errMessage = "Device disconnected";
            } else if (errors.isStorageError(err)) {
                errEvent = "Storage";
                errMessage = "Out of storage";
            } else if (errors.isMemoryError(err)) {
                errEvent = "Memory";
                errMessage = "Out of memory";
            } else if (errors.isTimeoutError(err)) {
                errEvent = "Timeout";
                errMessage = "Device is stuck";
            }

            if (errEvent !== null) {
                if ("handleSelfError" in this) {
                    this.handleSelfError(
                        `error${errEvent}`,
                        retryCallback || this.errorRetry
                    );
                }

                this.$bubble(
                    `error${errEvent}`,
                    retryCallback || this.errorRetry
                );
            }

            return [errEvent !== null, errMessage];
        },
    },
});

// Check for mock mode (enables testing without a physical device)
const mockMode = process.env.MOCK_MODE === "true" || process.env.VUE_APP_MOCK_MODE === "true";

if (
    process.env.VUE_APP_SENTRY_DSN !== undefined &&
    process.env.NODE_ENV === "production"
) {
    Sentry.init({
        Vue,
        dsn: process.env.VUE_APP_SENTRY_DSN,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 1.0,
        attachProps: true,
        logErrors: true,
    });
}

let device;
if (mockMode) {
    // In mock mode, use a mock fastboot device for testing
    device = createMockFastbootDevice({
        connected: true,
        model: "mock_model",
        product: "mock_product",
        release: null,
    });
} else {
    // Use the real fastboot device
    device = new fastboot.FastbootDevice();
}

let blobStore = new BlobStore();

export default {
    name: "Installer",

    components: {
        PrepareStep,
        InstallTypeStep,
        ConnectStep,
        UnlockStep,
        DownloadStep,
        InstallStep,
        FinishStep,
        ConnectBanner,
    },

    data: () => ({
        device,
        blobStore,
        curStep: -1,
        userAgent: navigator.userAgent,

        connectSelectDialog: false,
        connectUdevDialog: false,
        claimDialog: false,
        storageDialog: false,
        memoryDialog: false,
        timeoutDialog: false,
        retryCallbacks: [],

        disconnectDialog: false,
        disconnectReconnecting: false,
        disconnectReconnectError: null,

        reconnectDialog: false,
        reconnectError: null,
    }),

    methods: {
        handleSelfError(error, retryCallback) {
            this.$refs.stepper.$emit(error, retryCallback);
        },

        errorConnectSelect(retry) {
            this.connectSelectDialog = true;
            this.retryCallbacks.push(retry);
        },
        retryConnectSelect() {
            this.connectSelectDialog = false;
            this.retryCallbacks.pop()();
        },

        errorConnectUdev(retry) {
            this.connectUdevDialog = true;
            this.retryCallbacks.push(retry);
        },
        retryConnectUdev() {
            this.connectUdevDialog = false;
            this.retryCallbacks.pop()();
        },

        errorClaim(retry) {
            this.claimDialog = true;
            this.retryCallbacks.push(retry);
        },
        retryClaim() {
            this.claimDialog = false;
            this.retryCallbacks.pop()();
        },

        errorDisconnect(retry) {
            this.$root.$data.product = null;

            this.disconnectReconnecting = false;
            this.disconnectReconnectError = null;
            this.disconnectDialog = true;
            this.retryCallbacks.push(retry);
        },
        async retryDisconnect() {
            this.disconnectReconnecting = true;
            this.$root.$data.product = await this.device.getVariable("product");
            this.disconnectReconnectError = null;
        },

        errorStorage(retry) {
            this.storageDialog = true;
            this.retryCallbacks.push(retry);
        },
        retryStorage() {
            this.storageDialog = false;
            this.retryCallbacks.pop()();
        },

        errorMemory(retry) {
            this.memoryDialog = true;
            this.retryCallbacks.push(retry);

            this.saEvent("error__out_of_memory");
        },
        retryMemory() {
            this.memoryDialog = false;
            this.retryCallbacks.pop()();
        },

        reconnectCallback() {
            this.reconnectError = null;
            this.reconnectDialog = true;
        },
        async requestReconnect() {
            try {
                await this.device.connect();
                this.reconnectDialog = false;
                this.reconnectError = null;
            } catch (e) {
                this.reconnectError = e.message;
            }
        },

        errorTimeout(retry) {
            this.timeoutDialog = true;
            this.retryCallbacks.push(retry);
        },
        retryTimeout() {
            this.timeoutDialog = false;
            this.retryCallbacks.pop()();
        },
    },
};
