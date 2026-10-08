import { createNewBuild } from '../../types/build';
import { NormalizedComponent } from '../../types/component';
import { calculatePowerEstimate, recommendPsuTier } from '../../utils/power';

describe('Power Estimator (calculatePowerEstimate & recommendPsuTier)', () => {
  it('should map margins to correct commercial PSU tiers', () => {
    expect(recommendPsuTier(400)).toBe(450);
    expect(recommendPsuTier(450)).toBe(450);
    expect(recommendPsuTier(451)).toBe(550);
    expect(recommendPsuTier(585)).toBe(650); // 450W * 1.3 = 585W -> 650W tier
    expect(recommendPsuTier(715)).toBe(750); // 550W * 1.3 = 715W -> 750W tier
    expect(recommendPsuTier(800)).toBe(850);
    expect(recommendPsuTier(950)).toBe(1000);
    expect(recommendPsuTier(1150)).toBe(1200);
    expect(recommendPsuTier(1400)).toBe(1500);
  });

  it('should calculate base system TDP for empty build', () => {
    const build = createNewBuild('bld-empty');
    const estimate = calculatePowerEstimate(build);

    expect(estimate.baseSystemTdp).toBe(50);
    expect(estimate.estimatedWattage).toBe(50);
    expect(estimate.recommendedWattage).toBe(450); // 50 * 1.3 = 65W <= 450
    expect(estimate.hasIncompleteData).toBe(false);
  });

  it('should aggregate CPU and GPU TDP with 50W base allowance', () => {
    const build = createNewBuild('bld-power-test');
    const cpu: NormalizedComponent = {
      id: 'cpu-1',
      category: 'CPU',
      name: 'Test CPU',
      manufacturer: 'Intel',
      specifications: { tdp: 125 },
    };
    const gpu: NormalizedComponent = {
      id: 'gpu-1',
      category: 'VIDEO_CARD',
      name: 'Test GPU',
      manufacturer: 'NVIDIA',
      specifications: { tdp: 275 },
    };

    build.components.CPU = [{ component: cpu, quantity: 1 }];
    build.components.VIDEO_CARD = [{ component: gpu, quantity: 1 }];

    // Estimated = 50 + 125 + 275 = 450W
    // Target with 30% margin = 450 * 1.30 = 585W
    // Recommended tier = 650W
    const estimate = calculatePowerEstimate(build);
    expect(estimate.estimatedWattage).toBe(450);
    expect(estimate.recommendedWattage).toBe(650);
    expect(estimate.breakdown.CPU).toBe(125);
    expect(estimate.breakdown.VIDEO_CARD).toBe(275);
    expect(estimate.hasIncompleteData).toBe(false);
  });

  it('should correctly account for component quantity in wattage sum', () => {
    const build = createNewBuild('bld-multi-gpu-power');
    const gpu: NormalizedComponent = {
      id: 'gpu-1',
      category: 'VIDEO_CARD',
      name: 'Dual GPU',
      manufacturer: 'NVIDIA',
      specifications: { tdp: 200 },
    };
    build.components.VIDEO_CARD = [{ component: gpu, quantity: 2 }];

    // 50 + (200 * 2) = 450W -> 585W -> 650W tier
    const estimate = calculatePowerEstimate(build);
    expect(estimate.estimatedWattage).toBe(450);
    expect(estimate.breakdown.VIDEO_CARD).toBe(400);
    expect(estimate.recommendedWattage).toBe(650);
  });

  it('should flag hasIncompleteData when CPU or GPU lacks TDP specification', () => {
    const build = createNewBuild('bld-missing-tdp');
    const cpuNoTdp: NormalizedComponent = {
      id: 'cpu-no-tdp',
      category: 'CPU',
      name: 'Mystery CPU',
      manufacturer: 'Generic',
      specifications: { socket: 'AM5' },
    };
    build.components.CPU = [{ component: cpuNoTdp, quantity: 1 }];

    const estimate = calculatePowerEstimate(build);
    expect(estimate.hasIncompleteData).toBe(true);
  });
});
