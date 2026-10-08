import { StorageService } from '../../services/storage.service';
import { useBuildStore } from '../../stores/build.store';
import { NormalizedComponent } from '../../types/component';

describe('useBuildStore', () => {
  const sampleCpu: NormalizedComponent = {
    id: 'cpu-7600',
    category: 'CPU',
    name: 'AMD Ryzen 5 7600',
    manufacturer: 'AMD',
    specifications: { socket: 'AM5', tdp: 65 },
  };

  const alternativeCpu: NormalizedComponent = {
    id: 'cpu-7700x',
    category: 'CPU',
    name: 'AMD Ryzen 7 7700X',
    manufacturer: 'AMD',
    specifications: { socket: 'AM5', tdp: 105 },
  };

  const sampleGpu: NormalizedComponent = {
    id: 'gpu-4060',
    category: 'VIDEO_CARD',
    name: 'RTX 4060',
    manufacturer: 'NVIDIA',
    specifications: { lengthMm: 210, tdp: 115 },
  };

  const sampleMb: NormalizedComponent = {
    id: 'mb-b650',
    category: 'MOTHERBOARD',
    name: 'B650 Motherboard',
    manufacturer: 'ASUS',
    specifications: { socket: 'AM5', memorySlots: 4, memoryType: 'DDR5' },
  };

  const sampleRam: NormalizedComponent = {
    id: 'ram-ddr5-16gb',
    category: 'MEMORY',
    name: 'Corsair 16GB DDR5',
    manufacturer: 'Corsair',
    specifications: { memoryType: 'DDR5' },
  };

  const diffRam: NormalizedComponent = {
    id: 'ram-ddr5-kingston',
    category: 'MEMORY',
    name: 'Kingston Fury 16GB DDR5',
    manufacturer: 'Kingston',
    specifications: { memoryType: 'DDR5' },
  };

  beforeEach(async () => {
    useBuildStore.setState({
      builds: [],
      activeBuildId: null,
      isLoading: false,
      isHydrated: false,
      error: null,
    });
    await StorageService.clearAll();
  });

  it('should create a new build and set it as active', async () => {
    const buildId = await useBuildStore.getState().createBuild('My Dream PC');

    const state = useBuildStore.getState();
    expect(state.builds).toHaveLength(1);
    expect(state.activeBuildId).toBe(buildId);
    expect(state.builds[0].name).toBe('My Dream PC');
  });

  it('should rename a build', async () => {
    const buildId = await useBuildStore.getState().createBuild('Initial Name');
    await useBuildStore.getState().renameBuild(buildId, 'Updated Name');

    const build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.name).toBe('Updated Name');
  });

  it('should delete a build and update activeBuildId', async () => {
    const id1 = await useBuildStore.getState().createBuild('Build 1');
    const id2 = await useBuildStore.getState().createBuild('Build 2');

    expect(useBuildStore.getState().builds).toHaveLength(2);
    expect(useBuildStore.getState().activeBuildId).toBe(id2);

    await useBuildStore.getState().deleteBuild(id2);
    expect(useBuildStore.getState().builds).toHaveLength(1);
    expect(useBuildStore.getState().activeBuildId).toBe(id1);
  });

  it('should duplicate a build', async () => {
    const id1 = await useBuildStore.getState().createBuild('Original Build');
    await useBuildStore.getState().addComponent(id1, sampleCpu);

    const dupId = await useBuildStore.getState().duplicateBuild(id1);
    const duplicated = useBuildStore.getState().getBuildById(dupId);

    expect(duplicated).toBeDefined();
    expect(duplicated?.name).toBe('Original Build (Copy)');
    expect(duplicated?.components.CPU).toHaveLength(1);
    expect(duplicated?.components.CPU[0].component.id).toBe(sampleCpu.id);
  });

  it('should replace component in single-slot categories (e.g. CPU)', async () => {
    const buildId = await useBuildStore.getState().createBuild('Single Slot Test');
    await useBuildStore.getState().addComponent(buildId, sampleCpu);

    let build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.CPU).toHaveLength(1);
    expect(build?.components.CPU[0].component.id).toBe(sampleCpu.id);

    // Adding another CPU replaces the first
    await useBuildStore.getState().addComponent(buildId, alternativeCpu);
    build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.CPU).toHaveLength(1);
    expect(build?.components.CPU[0].component.id).toBe(alternativeCpu.id);
  });

  it('should enforce max 2 GPUs limit', async () => {
    const buildId = await useBuildStore.getState().createBuild('GPU Limit Test');
    const res1 = await useBuildStore.getState().addComponent(buildId, sampleGpu, 2);
    expect(res1.success).toBe(true);

    // Adding 3rd GPU should fail
    const res2 = await useBuildStore.getState().addComponent(buildId, sampleGpu, 1);
    expect(res2.success).toBe(false);
  });

  it('should enforce RAM motherboard slot limit and uniform modules', async () => {
    const buildId = await useBuildStore.getState().createBuild('RAM Test');
    await useBuildStore.getState().addComponent(buildId, sampleMb); // 4 slots

    // Add 2 sticks of sampleRam
    const res1 = await useBuildStore.getState().addComponent(buildId, sampleRam, 2);
    expect(res1.success).toBe(true);

    // Adding different RAM replaces existing to enforce uniformity
    const res2 = await useBuildStore.getState().addComponent(buildId, diffRam, 2);
    expect(res2.success).toBe(true);
    expect(res2.message).toContain('replaced');

    let build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.MEMORY[0].component.id).toBe(diffRam.id);

    // Exceeding 4 slots should fail
    const res3 = await useBuildStore.getState().addComponent(buildId, diffRam, 3);
    expect(res3.success).toBe(false);
  });

  it('should remove component from build', async () => {
    const buildId = await useBuildStore.getState().createBuild('Remove Test');
    await useBuildStore.getState().addComponent(buildId, sampleCpu);
    await useBuildStore.getState().removeComponent(buildId, 'CPU', sampleCpu.id);

    const build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.CPU).toHaveLength(0);
  });

  it('should update quantity and remove if quantity is 0', async () => {
    const buildId = await useBuildStore.getState().createBuild('Qty Test');
    await useBuildStore.getState().addComponent(buildId, sampleGpu, 1);

    await useBuildStore.getState().setQuantity(buildId, 'VIDEO_CARD', sampleGpu.id, 2);
    let build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.VIDEO_CARD[0].quantity).toBe(2);

    await useBuildStore.getState().setQuantity(buildId, 'VIDEO_CARD', sampleGpu.id, 0);
    build = useBuildStore.getState().getBuildById(buildId);
    expect(build?.components.VIDEO_CARD).toHaveLength(0);
  });

  it('should provide dynamic compatibility report and power estimate', async () => {
    const buildId = await useBuildStore.getState().createBuild('Live Eval Test');
    await useBuildStore.getState().addComponent(buildId, sampleCpu); // 65W
    await useBuildStore.getState().addComponent(buildId, sampleGpu); // 115W

    const comp = useBuildStore.getState().getCompatibility(buildId);
    expect(comp.isValid).toBe(true);

    const power = useBuildStore.getState().getPowerEstimate(buildId);
    // 50 base + 65 + 115 = 230W -> 230 * 1.30 = 299W -> 450W tier
    expect(power.estimatedWattage).toBe(230);
    expect(power.recommendedWattage).toBe(450);
  });
});
