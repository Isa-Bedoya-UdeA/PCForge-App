import { createNewBuild } from '../../types/build';
import { NormalizedComponent } from '../../types/component';
import { evaluateCompatibility } from '../../utils/compatibility';

describe('Compatibility Engine (evaluateCompatibility)', () => {
  const mockCpuAM5: NormalizedComponent = {
    id: 'cpu-7800x3d',
    category: 'CPU',
    name: 'AMD Ryzen 7 7800X3D',
    manufacturer: 'AMD',
    specifications: {
      socket: 'AM5',
      tdp: 120,
    },
  };

  const mockCpuLGA1700: NormalizedComponent = {
    id: 'cpu-13600k',
    category: 'CPU',
    name: 'Intel Core i5-13600K',
    manufacturer: 'Intel',
    specifications: {
      socket: 'LGA1700',
      tdp: 125,
    },
  };

  const mockMbAM5DDR5: NormalizedComponent = {
    id: 'mb-b650',
    category: 'MOTHERBOARD',
    name: 'MSI B650 Tomahawk WiFi',
    manufacturer: 'MSI',
    specifications: {
      socket: 'AM5',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
    },
  };

  const mockMbAM5DDR4: NormalizedComponent = {
    id: 'mb-am5-ddr4',
    category: 'MOTHERBOARD',
    name: 'Fictional AM5 DDR4 Board',
    manufacturer: 'ASUS',
    specifications: {
      socket: 'AM5',
      formFactor: 'ATX',
      memoryType: 'DDR4',
      memorySlots: 4,
    },
  };

  const mockRamDDR5: NormalizedComponent = {
    id: 'ram-ddr5-32gb',
    category: 'MEMORY',
    name: 'Corsair Vengeance 32GB DDR5-6000',
    manufacturer: 'Corsair',
    specifications: {
      memoryType: 'DDR5',
      speedMhz: 6000,
    },
  };

  const mockRamDDR4: NormalizedComponent = {
    id: 'ram-ddr4-16gb',
    category: 'MEMORY',
    name: 'G.Skill Ripjaws V 16GB DDR4-3600',
    manufacturer: 'G.Skill',
    specifications: {
      memoryType: 'DDR4',
      speedMhz: 3600,
    },
  };

  const mockCaseATX: NormalizedComponent = {
    id: 'case-atx',
    category: 'CASE',
    name: 'NZXT H5 Flow',
    manufacturer: 'NZXT',
    specifications: {
      supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
      maxGpuLengthMm: 365,
    },
  };

  const mockCaseITX: NormalizedComponent = {
    id: 'case-itx',
    category: 'CASE',
    name: 'Cooler Master NR200P',
    manufacturer: 'Cooler Master',
    specifications: {
      supportedFormFactors: ['Mini-ITX'],
      maxGpuLengthMm: 330,
    },
  };

  const mockGpuStandard: NormalizedComponent = {
    id: 'gpu-rtx4070',
    category: 'VIDEO_CARD',
    name: 'NVIDIA GeForce RTX 4070',
    manufacturer: 'NVIDIA',
    specifications: {
      lengthMm: 242,
      tdp: 200,
    },
  };

  const mockGpuGiant: NormalizedComponent = {
    id: 'gpu-rtx4090',
    category: 'VIDEO_CARD',
    name: 'Gigabyte AORUS RTX 4090 Master',
    manufacturer: 'Gigabyte',
    specifications: {
      lengthMm: 358,
      tdp: 450,
    },
  };

  const mockCoolerAM5: NormalizedComponent = {
    id: 'cooler-am5',
    category: 'CPU_COOLER',
    name: 'Thermalright Peerless Assassin 120 SE',
    manufacturer: 'Thermalright',
    specifications: {
      supportedSockets: ['AM4', 'AM5', 'LGA1700'],
    },
  };

  const mockCoolerLegacyIntel: NormalizedComponent = {
    id: 'cooler-old-intel',
    category: 'CPU_COOLER',
    name: 'Legacy Cooler',
    manufacturer: 'OldTech',
    specifications: {
      supportedSockets: ['LGA1151', 'LGA1200'],
    },
  };

  const mockPsu750W: NormalizedComponent = {
    id: 'psu-750w',
    category: 'POWER_SUPPLY',
    name: 'Corsair RM750x',
    manufacturer: 'Corsair',
    specifications: {
      wattage: 750,
    },
  };

  const mockPsu250W: NormalizedComponent = {
    id: 'psu-250w',
    category: 'POWER_SUPPLY',
    name: 'Generic 250W',
    manufacturer: 'Generic',
    specifications: {
      wattage: 250,
    },
  };

  it('should mark an empty build as COMPATIBLE with no issues', () => {
    const build = createNewBuild('bld-1');
    const report = evaluateCompatibility(build);

    expect(report.status).toBe('COMPATIBLE');
    expect(report.isValid).toBe(true);
    expect(report.issues).toHaveLength(0);
  });

  it('should mark a fully compatible build as COMPATIBLE', () => {
    const build = createNewBuild('bld-valid');
    build.components.CPU = [{ component: mockCpuAM5, quantity: 1 }];
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }];
    build.components.MEMORY = [{ component: mockRamDDR5, quantity: 2 }];
    build.components.CASE = [{ component: mockCaseATX, quantity: 1 }];
    build.components.VIDEO_CARD = [{ component: mockGpuStandard, quantity: 1 }];
    build.components.CPU_COOLER = [{ component: mockCoolerAM5, quantity: 1 }];
    build.components.POWER_SUPPLY = [{ component: mockPsu750W, quantity: 1 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('COMPATIBLE');
    expect(report.isValid).toBe(true);
    expect(report.issues.filter((i) => i.severity === 'ERROR')).toHaveLength(0);
  });

  it('should detect CPU & Motherboard socket mismatch', () => {
    const build = createNewBuild('bld-socket-err');
    build.components.CPU = [{ component: mockCpuLGA1700, quantity: 1 }];
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.code === 'SOCKET_MISMATCH')).toBe(true);
  });

  it('should warn when socket data is missing and flag hasIncompleteData', () => {
    const build = createNewBuild('bld-socket-warn');
    const cpuNoSocket: NormalizedComponent = {
      ...mockCpuAM5,
      specifications: {},
    };
    build.components.CPU = [{ component: cpuNoSocket, quantity: 1 }];
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }];

    const report = evaluateCompatibility(build);
    expect(report.hasIncompleteData).toBe(true);
    expect(report.issues.some((i) => i.code === 'MISSING_SOCKET_DATA')).toBe(true);
  });

  it('should detect RAM & Motherboard memory type mismatch (DDR4 vs DDR5)', () => {
    const build = createNewBuild('bld-ram-err');
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }];
    build.components.MEMORY = [{ component: mockRamDDR4, quantity: 1 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'MEMORY_TYPE_MISMATCH')).toBe(true);
  });

  it('should detect Case & Motherboard form factor incompatibility', () => {
    const build = createNewBuild('bld-formfactor-err');
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }]; // ATX
    build.components.CASE = [{ component: mockCaseITX, quantity: 1 }]; // Mini-ITX only

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'FORM_FACTOR_INCOMPATIBLE')).toBe(true);
  });

  it('should detect GPU length exceeding Case clearance', () => {
    const build = createNewBuild('bld-gpu-clearance');
    build.components.CASE = [{ component: mockCaseITX, quantity: 1 }]; // max 330mm
    build.components.VIDEO_CARD = [{ component: mockGpuGiant, quantity: 1 }]; // 358mm

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'GPU_LENGTH_EXCEEDS_CASE')).toBe(true);
  });

  it('should detect CPU cooler incompatible with CPU socket', () => {
    const build = createNewBuild('bld-cooler-err');
    build.components.CPU = [{ component: mockCpuAM5, quantity: 1 }];
    build.components.CPU_COOLER = [{ component: mockCoolerLegacyIntel, quantity: 1 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'COOLER_SOCKET_INCOMPATIBLE')).toBe(true);
  });

  it('should detect multiple CPUs selected', () => {
    const build = createNewBuild('bld-multi-cpu');
    build.components.CPU = [{ component: mockCpuAM5, quantity: 2 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'MAX_CPU_EXCEEDED')).toBe(true);
  });

  it('should detect exceeding 2 GPUs limit', () => {
    const build = createNewBuild('bld-multi-gpu');
    build.components.VIDEO_CARD = [{ component: mockGpuStandard, quantity: 3 }];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'MAX_VIDEO_CARD_EXCEEDED')).toBe(true);
  });

  it('should detect exceeding motherboard RAM slots', () => {
    const build = createNewBuild('bld-ram-slots');
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR5, quantity: 1 }]; // 4 slots
    build.components.MEMORY = [{ component: mockRamDDR5, quantity: 6 }]; // 6 sticks

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'RAM_SLOTS_EXCEEDED')).toBe(true);
  });

  it('should detect non-identical mixed RAM kits', () => {
    const build = createNewBuild('bld-mixed-ram');
    build.components.MOTHERBOARD = [{ component: mockMbAM5DDR4, quantity: 1 }];
    build.components.MEMORY = [
      { component: mockRamDDR4, quantity: 1 },
      {
        component: {
          ...mockRamDDR4,
          id: 'ram-ddr4-another-brand',
          name: 'Crucial Ballistix 16GB DDR4',
        },
        quantity: 1,
      },
    ];

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'RAM_NON_IDENTICAL_MODULES')).toBe(true);
  });

  it('should flag underpowered PSU as ERROR when below system draw', () => {
    const build = createNewBuild('bld-underpowered-psu');
    build.components.CPU = [{ component: mockCpuAM5, quantity: 1 }]; // 120W
    build.components.VIDEO_CARD = [{ component: mockGpuGiant, quantity: 1 }]; // 450W
    // Total estimated = 50 + 120 + 450 = 620W
    build.components.POWER_SUPPLY = [{ component: mockPsu250W, quantity: 1 }]; // 250W

    const report = evaluateCompatibility(build);
    expect(report.status).toBe('INCOMPATIBLE');
    expect(report.issues.some((i) => i.code === 'PSU_WATTAGE_INSUFFICIENT')).toBe(true);
  });
});
