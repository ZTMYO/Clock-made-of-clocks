const HAND_ANGLE_MAP = {
  " ": [135, 135],
  "┘": [180, 270],
  "└": [0, 270],
  "┐": [90, 180],
  "┌": [0, 90],
  "-": [0, 180],
  "|": [90, 270]
};

const DIGIT_SHAPES = {
  "0": ["┌", "-", "-", "┐", "|", "┌", "┐", "|", "|", "|", "|", "|", "|", "|", "|", "|", "|", "└", "┘", "|", "└", "-", "-", "┘"],
  "1": ["┌", "-", "┐", " ", "└", "┐", "|", " ", " ", "|", "|", " ", " ", "|", "|", " ", "┌", "┘", "└", "┐", "└", "-", "-", "┘"],
  "2": ["┌", "-", "-", "┐", "└", "-", "┐", "|", "┌", "-", "┘", "|", "|", "┌", "-", "┘", "|", "└", "-", "┐", "└", "-", "-", "┘"],
  "3": ["┌", "-", "-", "┐", "└", "-", "┐", "|", " ", "┌", "┘", "|", " ", "└", "┐", "|", "┌", "-", "┘", "|", "└", "-", "-", "┘"],
  "4": ["┌", "┐", "┌", "┐", "|", "|", "|", "|", "|", "└", "┘", "|", "└", "-", "┐", "|", " ", " ", "|", "|", " ", " ", "└", "┘"],
  "5": ["┌", "-", "-", "┐", "|", "┌", "-", "┘", "|", "└", "-", "┐", "└", "-", "┐", "|", "┌", "-", "┘", "|", "└", "-", "-", "┘"],
  "6": ["┌", "-", "-", "┐", "|", "┌", "-", "┘", "|", "└", "-", "┐", "|", "┌", "┐", "|", "|", "└", "┘", "|", "└", "-", "-", "┘"],
  "7": ["┌", "-", "-", "┐", "└", "-", "┐", "|", " ", " ", "|", "|", " ", " ", "|", "|", " ", " ", "|", "|", " ", " ", "└", "┘"],
  "8": ["┌", "-", "-", "┐", "|", "┌", "┐", "|", "|", "└", "┘", "|", "|", "┌", "┐", "|", "|", "└", "┘", "|", "└", "-", "-", "┘"],
  "9": ["┌", "-", "-", "┐", "|", "┌", "┐", "|", "|", "└", "┘", "|", "└", "-", "┐", "|", "┌", "-", "┘", "|", "└", "-", "-", "┘"]
};

const THEME_PRESETS = {
  default: {
    bgColor: '#ffffff',
    handColor: '#000000',
    unitBg: '#FAFAFA',
    unitBorder: '#E8E8E8'
  },
  ocean: {
    bgColor: '#001a33',
    handColor: '#00BFFF',
    unitBg: '#003366',
    unitBorder: '#004d99'
  },
  sunset: {
    bgColor: '#1e0d00',
    handColor: '#FF8C42',
    unitBg: '#361a00',
    unitBorder: '#612e00'
  },
  forest: {
    bgColor: '#0a1a0a',
    handColor: '#32CD32',
    unitBg: '#1a331a',
    unitBorder: '#264d26'
  },
  neon: {
    bgColor: '#0d0015',
    handColor: '#DA70D6',
    unitBg: '#1a0026',
    unitBorder: '#2d0040'
  },
  dream: {
    bgColor: '#fdecf2',
    handColor: '#FFB6C1',
    unitBg: '#ffffff',
    unitBorder: '#ffe4ec'
  }
};

class DOMUtil {
  static createElement(config) {
    const element = document.createElement(config.type);
    if (config.className) element.className = config.className;
    if (config.dataAttributes) {
      Object.entries(config.dataAttributes).forEach(([key, value]) => {
        element.dataset[key] = value.toString();
      });
    }
    if (config.children) {
      config.children.forEach(child => element.appendChild(child));
    }
    return element;
  }

  static appendChild(parent, child) {
    if (typeof parent === "string") {
      document.getElementById(parent).appendChild(child);
    } else if (parent instanceof HTMLElement) {
      parent.appendChild(child);
    }
  }

  static getChildren(element) {
    return Array.from(element.childNodes);
  }

  static findByDataAttribute(attributeKey, attributeValue) {
    return document.querySelector(`[data-${attributeKey}="${attributeValue}"]`);
  }
}

class HandComponent {
  static create() {
    return DOMUtil.createElement({ type: "div", className: "hand" });
  }

  static update(handElement, angle) {
    handElement.style.rotate = `${angle}deg`;
  }
}

class CenterComponent {
  static create() {
    return DOMUtil.createElement({ type: "div", className: "center" });
  }
}

class ClockUnitComponent {
  static create(index) {
    return DOMUtil.createElement({
      type: "div",
      className: "clock-unit",
      dataAttributes: { index },
      children: [HandComponent.create(), HandComponent.create(), CenterComponent.create()]
    });
  }

  static update(unitElement, angles) {
    const childrenList = DOMUtil.getChildren(unitElement);
    childrenList.forEach((hand, index) => {
      if (index < 2) {
        HandComponent.update(hand, angles[index]);
      }
    });
  }
}

class DigitDisplayComponent {
  static create(index) {
    const units = Array.from({ length: 24 }, (_, i) => ClockUnitComponent.create(i));
    return DOMUtil.createElement({
      type: "div",
      className: "digit-display",
      dataAttributes: { index },
      children: units
    });
  }

  static update(digitElement, digitValue) {
    const childrenList = DOMUtil.getChildren(digitElement);
    childrenList.forEach((unit, index) => {
      const angles = getCellAngles(digitValue, index);
      ClockUnitComponent.update(unit, angles);
    });
  }
}

class DigitPairComponent {
  static create(fieldName) {
    return DOMUtil.createElement({
      type: "div",
      className: "digit-pair",
      dataAttributes: { field: fieldName },
      children: [DigitDisplayComponent.create(0), DigitDisplayComponent.create(1)]
    });
  }

  static update(fieldName, value) {
    const pairElement = DOMUtil.findByDataAttribute("field", fieldName);
    const childrenList = DOMUtil.getChildren(pairElement);
    childrenList.forEach((digitElement, index) => {
      DigitDisplayComponent.update(digitElement, value[index]);
    });
  }
}

class ClockBodyComponent {
  static create() {
    const children = [
      DigitPairComponent.create("hours"),
      DigitPairComponent.create("minutes"),
      DigitPairComponent.create("seconds")
    ];
    return DOMUtil.createElement({
      type: "div",
      className: "clock-body",
      children
    });
  }

  static update(timeObject) {
    DigitPairComponent.update("hours", timeObject.hours);
    DigitPairComponent.update("minutes", timeObject.minutes);
    DigitPairComponent.update("seconds", timeObject.seconds);
    return timeObject;
  }
}

function getCellAngles(digitValue, cellIndex) {
  const digitShape = DIGIT_SHAPES[digitValue];
  if (digitShape) {
    const symbol = digitShape[cellIndex];
    const anglePair = HAND_ANGLE_MAP[symbol];
    if (anglePair) return anglePair;
  }
  return HAND_ANGLE_MAP[" "];
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return { hours, minutes, seconds };
}

function timeEquals(timeA, timeB) {
  return timeA.hours === timeB.hours &&
         timeA.minutes === timeB.minutes &&
         timeA.seconds === timeB.seconds;
}

class ClockApp {
  constructor() {
    this.currentTime = getCurrentTime();
    this.isPaused = false;
  }

  initialize() {
    DOMUtil.appendChild("clock-container", ClockBodyComponent.create());
    this.startUpdate();
  }

  checkTime() {
    if (this.isPaused) return;
    const newTime = getCurrentTime();
    if (!timeEquals(newTime, this.currentTime)) {
      this.currentTime = ClockBodyComponent.update(newTime);
    }
  }

  startUpdate() {
    ClockBodyComponent.update(this.currentTime);
    setInterval(() => this.checkTime(), 100);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.checkTime();
  }
}

class ConfigManager {
  constructor() {
    this.clockApp = null;
    this.loadConfig();
    this.initEventListeners();
  }

  setClockApp(app) {
    this.clockApp = app;
  }

  getLuminance(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  updateUITheme(bgColor) {
    const luminance = this.getLuminance(bgColor);
    const isDark = luminance < 0.5;
    
    if (isDark) {
      document.documentElement.style.setProperty('--ui-color', 'rgba(255, 255, 255, 0.9)');
      document.documentElement.style.setProperty('--ui-color-solid', '#ffffff');
      document.documentElement.style.setProperty('--ui-color-rgb', '255, 255, 255');
      document.documentElement.style.setProperty('--ui-bg', 'rgba(255, 255, 255, 0.1)');
      document.documentElement.style.setProperty('--ui-border', 'rgba(255, 255, 255, 0.2)');
    } else {
      document.documentElement.style.setProperty('--ui-color', 'rgba(0, 0, 0, 0.8)');
      document.documentElement.style.setProperty('--ui-color-solid', '#000000');
      document.documentElement.style.setProperty('--ui-color-rgb', '0, 0, 0');
      document.documentElement.style.setProperty('--ui-bg', 'rgba(255, 255, 255, 0.6)');
      document.documentElement.style.setProperty('--ui-border', 'rgba(0, 0, 0, 0.15)');
    }
  }

  loadConfig() {
    const config = JSON.parse(localStorage.getItem('clock-config') || '{}');
    const defaultTheme = THEME_PRESETS.default;
    
    this.setBgColor(config.bgColor || defaultTheme.bgColor);
    this.setHandColor(config.handColor || defaultTheme.handColor);
    this.setUnitBgColor(config.unitBg || defaultTheme.unitBg);
    this.setUnitBorderColor(config.unitBorder || defaultTheme.unitBorder);
    this.setBorderRadius(config.borderRadius || 50);
    this.setBorderWidth(config.borderWidth || 2);
    this.setClockSize(config.size || 100);
    this.setAnimationSpeed(config.speed || 250);
  }

  saveConfig() {
    const config = {
      bgColor: document.getElementById('bg-color').value,
      handColor: document.getElementById('hand-color').value,
      unitBg: document.getElementById('unit-bg-color').value,
      unitBorder: document.getElementById('unit-border-color').value,
      borderRadius: parseInt(document.getElementById('border-radius').value),
      borderWidth: parseFloat(document.getElementById('border-width').value),
      size: parseInt(document.getElementById('clock-size').value),
      speed: parseInt(document.getElementById('animation-speed').value)
    };
    localStorage.setItem('clock-config', JSON.stringify(config));
  }

  setBgColor(color) {
    document.documentElement.style.setProperty('--page-bg-color', color);
    document.getElementById('bg-color').value = color;
    this.updateUITheme(color);
  }

  setHandColor(color) {
    document.documentElement.style.setProperty('--hand-color', color);
    document.getElementById('hand-color').value = color;
  }

  setUnitBgColor(color) {
    document.documentElement.style.setProperty('--unit-bg-color', color);
    document.getElementById('unit-bg-color').value = color;
  }

  setUnitBorderColor(color) {
    document.documentElement.style.setProperty('--unit-border-color', color);
    document.getElementById('unit-border-color').value = color;
  }

  setBorderRadius(value) {
    document.documentElement.style.setProperty('--border-radius', value);
    const input = document.getElementById('border-radius');
    input.value = value;
    const progress = (value / 50) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
    document.getElementById('radius-value').textContent = value + '%';
  }

  setBorderWidth(value) {
    document.documentElement.style.setProperty('--unit-border-size', value + 'px');
    const input = document.getElementById('border-width');
    input.value = value;
    const progress = ((value - 1) / (5 - 1)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
    document.getElementById('width-value').textContent = value + 'px';
  }

  setClockSize(size) {
    document.documentElement.style.setProperty('--clock-scale', size / 100);
    const input = document.getElementById('clock-size');
    input.value = size;
    const progress = ((size - 50) / (150 - 50)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
    document.getElementById('size-value').textContent = size + '%';
  }

  setAnimationSpeed(speed) {
    document.documentElement.style.setProperty('--animation-speed', speed + 'ms');
    const input = document.getElementById('animation-speed');
    input.value = speed;
    const progress = ((speed - 50) / (500 - 50)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
    document.getElementById('speed-value').textContent = speed + 'ms';
  }

  applyPreset(theme) {
    const preset = THEME_PRESETS[theme];
    this.setBgColor(preset.bgColor);
    this.setHandColor(preset.handColor);
    this.setUnitBgColor(preset.unitBg);
    this.setUnitBorderColor(preset.unitBorder);
    this.saveConfig();
  }

  reset() {
    localStorage.removeItem('clock-config');
    this.applyPreset('default');
    this.setBorderRadius(50);
    this.setBorderWidth(2);
    this.setClockSize(100);
    this.setAnimationSpeed(250);
    document.getElementById('theme-default').checked = true;
    this.saveConfig();
  }

  initEventListeners() {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const panel = document.getElementById('config-panel');

    menuBtn.addEventListener('click', () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      
      if (this.clockApp) {
        if (isHidden) {
          this.clockApp.pause();
        } else {
          this.clockApp.resume();
        }
      }
    });

    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
      if (this.clockApp) {
        this.clockApp.resume();
      }
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !menuBtn.contains(e.target)) {
        if (!panel.classList.contains('hidden')) {
          panel.classList.add('hidden');
          if (this.clockApp) {
            this.clockApp.resume();
          }
        }
      }
    });

    document.getElementById('bg-color').addEventListener('input', (e) => {
      this.setBgColor(e.target.value);
      this.saveConfig();
    });

    document.getElementById('hand-color').addEventListener('input', (e) => {
      this.setHandColor(e.target.value);
      this.saveConfig();
    });

    document.getElementById('unit-bg-color').addEventListener('input', (e) => {
      this.setUnitBgColor(e.target.value);
      this.saveConfig();
    });

    document.getElementById('unit-border-color').addEventListener('input', (e) => {
      this.setUnitBorderColor(e.target.value);
      this.saveConfig();
    });

    const radiusInput = document.getElementById('border-radius');
    radiusInput.addEventListener('input', (e) => {
      this.setBorderRadius(e.target.value);
      this.saveConfig();
    });

    const widthInput = document.getElementById('border-width');
    widthInput.addEventListener('input', (e) => {
      this.setBorderWidth(e.target.value);
      this.saveConfig();
    });

    const sizeInput = document.getElementById('clock-size');
    sizeInput.addEventListener('input', (e) => {
      this.setClockSize(e.target.value);
      this.saveConfig();
    });

    const speedInput = document.getElementById('animation-speed');
    speedInput.addEventListener('input', (e) => {
      this.setAnimationSpeed(e.target.value);
      this.saveConfig();
    });

    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const theme = e.target.value;
        this.applyPreset(theme);
      });
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      this.reset();
    });
  }
}

const app = new ClockApp();
app.initialize();

const configManager = new ConfigManager();
configManager.setClockApp(app);
