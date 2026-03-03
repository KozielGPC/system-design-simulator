import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SimulationPanel } from './components/SimulationPanel';
import { EnvelopeCalculator } from './components/EnvelopeCalculator';
import { useStore } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { DEMO_STATES, type DemoScene } from './data/demoStates';

function AppContent() {
  const loadDemoState = useStore((s) => s.loadDemoState);
  useKeyboardShortcuts();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scene = params.get('scene') as DemoScene | null;
    if (params.get('demo') === '1' && scene && DEMO_STATES[scene]) {
      const state = DEMO_STATES[scene];
      loadDemoState(state.nodes, state.edges, state.targetRps, {
        simulationResult: state.simulationResult ?? null,
        showSimulationPanel: state.showSimulationPanel ?? false,
      });
    }
  }, [loadDemoState]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas font-sans antialiased">
      <Toolbar />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="relative flex-1 overflow-hidden">
          <Canvas />
          <SimulationPanel />
          <EnvelopeCalculator />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
