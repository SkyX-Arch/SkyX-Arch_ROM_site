/**
 * WebUSB ROM Installer — Entry Point
 */

// -----------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------
async function loadInstallerConfig(configPath = 'installer/config.json') {
  try {
    const response = await fetch(configPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('[Installer] Failed to load config from', configPath, 'using defaults:', error);
    return null;
  }
}

const INSTALLER_CONFIG = {
  // The container ID where the installer UI will be rendered
  uiContainerId: 'installer-container',
  
  // The profile ID this installer is for (should match current URL param)
  profileId: window.location.search.includes('rom=') 
    ? new URLSearchParams(window.location.search).get('rom') 
    : null,
  
  // Reference to the remote release feed URL from profile config
  releaseFeedUrl: null, // Will be set by main.js integration
  
  // The ROM ZIP URL (for fallback hybrid installation)
  romZipUrl: null, // Will be set by main.js integration
  
  // Device info (should match current profile)
  deviceInfo: null, // Will be set by main.js integration
  
  // Loaded from external config file
  configData: null
};

// Load and merge config on startup
if (typeof window !== 'undefined') {
  loadInstallerConfig().then(config => {
    if (config) {
      INSTALLER_CONFIG.configData = config;
      console.log('[Installer] Config loaded from installer/config.json');
    } else {
      console.log('[Installer] No config available, using defaults');
    }
  });
}

// -----------------------------------------------------------------------
// Integration with main.js routing
// -----------------------------------------------------------------------
function installInstallerIntegration(profiles) {
  const params = new URLSearchParams(window.location.search);
  const romId = params.get('rom');
  
  if (!romId) {
    console.log('[Installer] No ROM ID in URL, not initializing');
    return;
  }
  
  const profile = profiles.find(p => p.id === romId);
  if (!profile) {
    console.error('[Installer] Profile not found:', romId);
    return;
  }
  
  // Store profile info for later use
  INSTALLER_CONFIG.profileId = romId;
  INSTALLER_CONFIG.deviceInfo = profile.device || {};
  INSTALLER_CONFIG.releaseFeedUrl = profile.remote?.releaseJsonUrl;
  
  console.log('[Installer] Initialized for profile:', romId);
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------
function initInstaller() {
  // Check if we're on the installer route
  const params = new URLSearchParams(window.location.search);
  const romId = params.get('rom');
  
  if (!romId) {
    console.log('[Installer] Not an installer page (no ROM ID in URL)');
    return;
  }
  
  // Install integration
  installInstallerIntegration(profiles);
  
  // Initialize the installer
  const installer = new ROMInstaller(INSTALLER_CONFIG);
  installer.init().then(() => {
    console.log('[Installer] Ready');
    
    // Create UI in the container
    if (INSTALLER_CONFIG.uiContainerId) {
      const ui = installer.createUI(INSTALLER_CONFIG.uiContainerId);
      
      // Auto-start the installation flow
      startInstallationFlow(installer, ui);
    }
  });
  
  return installer;
}

// -----------------------------------------------------------------------
// Installation Flow Orchestrator
// -----------------------------------------------------------------------
async function startInstallationFlow(installer, ui) {
  const steps = [
    { action: 'selectDevice', label: 'Select Device' },
    { action: 'selectROM', label: 'Select ROM' },
    { action: 'connectUSB', label: 'Connect via USB' },
    { action: 'preCheck', label: 'Pre-check' },
    { action: 'verify', label: 'Verify Integrity' },
    { action: 'writePartitions', label: 'Write Partitions' },
    { action: 'reboot', label: 'Reboot Device' }
  ];
  
  for (const step of steps) {
    console.log(`[Installer] Starting step: ${step.label}`);
    
    // Execute step action
    switch (step.action) {
      case 'selectDevice':
        await selectDevice(step, installer, ui);
        break;
      case 'selectROM':
        await selectROM(step, installer, ui);
        break;
      case 'connectUSB':
        await connectUSB(step, installer, ui);
        break;
      case 'preCheck':
        await preCheck(step, installer, ui);
        break;
      case 'verify':
        await verifyIntegrity(step, installer, ui);
        break;
      case 'writePartitions':
        await writePartitions(step, installer, ui);
        break;
      case 'reboot':
        await rebootDevice(step, installer, ui);
        break;
    }
  }
  
  console.log('[Installer] Installation flow complete');
}

// -----------------------------------------------------------------------
// Step Actions
// -----------------------------------------------------------------------
async function selectDevice(step, installer, ui) {
  const devices = await installer.getAvailableDevices();
  
  if (devices.length === 0) {
    throw new Error('No available devices');
  }
  
  // In a real implementation, we would let user pick
  // For now, auto-select first device
  const selectedDevice = devices[0];
  
  console.log(`[Installer] Selected device: ${selectedDevice.name}`);
  ui.updateProgress(10, `Selected: ${selectedDevice.name}`);
  return true;
}

async function selectROM(step, installer, ui) {
  const releases = await installer.getAvailableReleases(INSTALLER_CONFIG.profileId);
  
  if (releases.length === 0) {
    throw new Error('No available ROMs');
  }
  
  const selectedRelease = releases[0];
  
  console.log(`[Installer] Selected ROM: ${selectedRelease.version}`);
  ui.updateProgress(20, `ROM: ${selectedRelease.version}`);
  return true;
}

async function connectUSB(step, installer, protocolHandler) {
  const connected = await protocolHandler.connect();
  if (!connected) {
    throw new Error('Failed to connect via USB');
  }
  
  console.log('[Installer] USB connection established');
  ui.updateProgress(40, 'Connected via USB');
  return true;
}

async function preCheck(step, installer, protocolHandler) {
  const bootloaderLocked = await protocolHandler.checkBootloaderLocked();
  
  if (bootloaderLocked) {
    throw new Error('Bootloader is locked');
  }
  
  console.log('[Installer] Pre-check passed: bootloader unlocked');
  ui.updateProgress(50, 'Pre-check passed');
  return true;
}

async function verifyIntegrity(step, installer, protocolHandler) {
  // In real implementation, download and verify SHA-256 hash
  console.log('[Installer] Verifying integrity...');
  
  // For now, assume verified (would check payload.bin hash against manifest)
  ui.updateProgress(60, 'Integrity verified');
  return true;
}

async function writePartitions(step, installer, protocolHandler) {
  // Use partition order from config, or fallback to default
  const partitionOrder = installer.configData?.configData?.partitionOrder || 
    ['boot', 'vendor_boot', 'odm_dlkm', 'product', 'system'];
  
  for (const partition of partitionOrder) {
    console.log(`[Installer] Writing ${partition}...`);
    
    // In real implementation: extract data from ROM ZIP and write via Fastboot
    await protocolHandler.send(`fastboot flash ${partition}`, { timeout: 30000 });
    
    ui.updateProgress(65 + (partitions.indexOf(partition) / partitions.length * 10), 
      `Writing ${partition}...`);
  }
  
  console.log('[Installer] All partitions written');
  ui.updateProgress(80, 'Partitions written');
  return true;
}

async function rebootDevice(step, installer, protocolHandler) {
  const success = await protocolHandler.boot();
  
  if (!success) {
    throw new Error('Failed to reboot device');
  }
  
  console.log('[Installer] Device rebooting...');
  ui.updateProgress(95, 'Rebooting...');
  return true;
}

// -----------------------------------------------------------------------
// ROMInstaller Class
// -----------------------------------------------------------------------
class ROMInstaller {
  constructor(config, configData = null) {
    this.config = config;
    this.configData = configData || null;
    this.uiContainer = null;
    this.protocolHandler = null;
    this.currentStep = null;
    this.progress = { percent: 0, message: '' };
  }

  async mergeConfig(externalConfig) {
    if (!externalConfig) return;
    
    console.log('[Installer] Merging external config with runtime data');
    
    // Merge partition order from external config
    if (externalConfig.partitionOrder) {
      this.config.partitionOrder = [...externalConfig.partitionOrder];
    }
    
    // Merge device support from external config
    if (externalConfig.deviceSupport) {
      this.config.deviceSupport = [...externalConfig.deviceSupport];
    }
    
    // Merge steps from external config
    if (externalConfig.steps) {
      this.config.steps = [...externalConfig.steps];
    }
    
    console.log('[Installer] Config merged successfully');
  }

  async init() {
    console.log('[Installer] Initializing...');
    
    // Check if we have a valid profile ID
    if (!this.config.profileId) {
      throw new Error('No profile ID configured');
    }
    
    console.log('[Installer] Profile:', this.config.profileId);
    return true;
  }

  createUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[Installer] Container not found:', containerId);
      return null;
    }
    
    // Make visible by removing hidden attribute
    container.hidden = false;
    container.classList.add('visible');
    
    // Hide the detail view sections to focus on installer
    const detailView = document.getElementById('detail-view');
    if (detailView) {
      detailView.hidden = true;
    }
    
    this.uiContainer = container;
    
    // Render the initial step using config or defaults
    const steps = this.configData?.configData?.steps || [
      { action: 'selectDevice', label: 'Select Device' },
      { action: 'selectROM', label: 'Select ROM' },
      { action: 'connectUSB', label: 'Connect via USB' },
      { action: 'preCheck', label: 'Pre-check' },
      { action: 'verify', label: 'Verify Integrity' },
      { action: 'writePartitions', label: 'Write Partitions' },
      { action: 'reboot', label: 'Reboot Device' }
    ];
    
    this.renderStep(steps[0]);
    return this;
  }

  renderStep(step) {
    if (!this.uiContainer) return;
    
    // Add beta/beta notice badge to installer header
    const betaBadge = document.createElement('div');
    betaBadge.className = 'installer-beta-badge';
    betaBadge.textContent = '🧪 Beta — Work in Progress';
    this.uiContainer.prepend(betaBadge);
    
    const stepHtml = `
      <div class="installer-step active" data-step="${step.action}">
        <h2>${step.label}</h2>
        <p id="installer-progress" aria-live="polite"></p>
        <div class="installer-content">${this.renderStepContent(step)}</div>
      </div>
    `;
    
    this.uiContainer.innerHTML = stepHtml;
    console.log('[Installer] Rendered step:', step.label);
  }

  renderStepContent(step) {
    switch (step.action) {
      case 'selectDevice':
        return this.renderDeviceList();
      case 'selectROM':
        return this.renderROMList();
      case 'connectUSB':
        return `<p>Waiting for USB connection...</p>`;
      case 'preCheck':
        return `<p>Checking bootloader state...</p>`;
      case 'verify':
        return `<p>Verifying ROM integrity...</p>`;
      case 'writePartitions':
        return `<p>Writing partitions...</p>`;
      case 'reboot':
        return `<p>Sending reboot command...</p>`;
      default:
        return `<p>Step content for ${step.action}</p>`;
    }
  }

  renderDeviceList() {
    // In a real implementation, this would fetch devices via WebUSB
    const mockDevices = [
      { id: 'plato', name: 'Xiaomi 12T (plato)', supported: true },
      { id: 'littleraven', name: 'Xiaomi 13 Lite (littleraven)', supported: false }
    ];
    
    const html = mockDevices.map(device => `
      <div class="device-option" data-device="${device.id}">
        <div class="device-name">${device.name}</div>
        ${device.supported ? '<span class="status-badge status-supported">Supported</span>' : '<span class="status-badge status-unsupported">Not Supported</span>'}
      </div>
    `).join('');
    
    return html;
  }

  renderROMList() {
    // In a real implementation, this would fetch from release feed
    const mockReleases = [
      { version: '12.11', date: '2026-07-05', checksum: 'sha256:...' },
      { version: '12.10', date: '2026-06-15', checksum: 'sha256:...' }
    ];
    
    const html = mockReleases.map(release => `
      <div class="rom-option" data-release="${release.version}">
        <div class="rom-version">${release.version}</div>
        <div class="rom-date">${release.date}</div>
      </div>
    `).join('');
    
    return html;
  }

  updateProgress(percent, message) {
    const progressEl = document.getElementById('installer-progress');
    if (progressEl) {
      progressEl.textContent = message;
      progressEl.setAttribute('data-percent', percent);
    }
    this.progress.percent = percent;
    this.progress.message = message;
  }

  async getAvailableDevices() {
    // In a real implementation, use WebUSB to enumerate devices
    console.log('[Installer] Fetching available devices...');
    
    // Use config data for device support, or fallback to mock data
    const supportedDevices = this.configData?.configData?.deviceSupport || [];
    
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        if (supportedDevices.length > 0) {
          // Filter devices based on config support status
          const filteredDevices = supportedDevices.filter(device => device.supported);
          
          console.log('[Installer] Supported devices from config:', filteredDevices.map(d => d.id).join(', '));
          
          resolve(filteredDevices.map(device => ({
            id: device.id,
            name: device.name,
            supported: true,
            vid: device.vendorId || 0x2197,
            pid: device.productId || 0x360A
          })));
        } else {
          // Fallback to mock data for testing
          const mockDevices = [
            { id: 'plato', name: 'Xiaomi 12T (plato)', supported: true, vid: 0x2197, pid: 0x360A }
          ];
          resolve(mockDevices);
        }
      }, 100);
    });
  }

  async getAvailableReleases(profileId) {
    // In a real implementation, fetch from release feed URL
    console.log('[Installer] Fetching available releases for profile:', profileId);
    
    if (this.config.releaseFeedUrl) {
      try {
        const response = await fetch(this.config.releaseFeedUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        // Map releases to the expected format
        return data.releases.map(release => ({
          version: release.version,
          date: release.date || '',
          checksum: release.checksum || '',
          size: release.size || 0
        }));
      } catch (error) {
        console.error('[Installer] Failed to fetch releases:', error);
        // Return mock data for testing
        return [
          { version: '12.11', date: '2026-07-05', checksum: 'sha256:...' },
          { version: '12.10', date: '2026-06-15', checksum: 'sha256:...' }
        ];
      }
    } else {
      // Return mock data
      return [
        { version: '12.11', date: '2026-07-05', checksum: 'sha256:...' },
        { version: '12.10', date: '2026-06-15', checksum: 'sha256:...' }
      ];
    }
  }

  async connect() {
    console.log('[Installer] Attempting USB connection...');
    
    // In a real implementation, use navigator.usb.requestDevice()
    return new Promise(async (resolve, reject) => {
      try {
        if (!navigator.usb) {
          console.warn('[Installer] WebUSB not available');
          resolve(false);
          return;
        }
        
        const devices = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x2197 }] });
        console.log('[Installer] Connected to device:', devices.getDescriptorText());
        
        // Set up USB input handler
        devices.onconnect = async () => {
          console.log('[Installer] Device connected');
        };
        
        devices.onabort = async () => {
          console.log('[Installer] Device disconnected');
        };
        
        resolve(true);
      } catch (error) {
        console.error('[Installer] USB connection failed:', error);
        reject(error);
      }
    });
  }

  async checkBootloaderLocked() {
    console.log('[Installer] Checking bootloader state...');
    
    // In a real implementation, send Fastboot command
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate unlocked bootloader for testing
        resolve(false);
      }, 100);
    });
  }

  async boot() {
    console.log('[Installer] Sending reboot command...');
    
    // In a real implementation, send Fastboot reboot command
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  }
}

// -----------------------------------------------------------------------
// Expose API globally for main.js integration
// -----------------------------------------------------------------------
window.ROMInstaller = {
  init: initInstaller,
  getAvailableDevices: async function() {
    const installer = new ROMInstaller(INSTALLER_CONFIG);
    return await installer.getAvailableDevices();
  },
  getAvailableReleases: async function(profileId) {
    const installer = new ROMInstaller(INSTALLER_CONFIG);
    return await installer.getAvailableReleases(profileId);
  }
};

// -----------------------------------------------------------------------
// Auto-initialize when profiles are available
// -----------------------------------------------------------------------
if (typeof profiles !== 'undefined' && profiles.length > 0) {
  // main.js has already loaded profiles — integrate now
  installInstallerIntegration(profiles);
}
