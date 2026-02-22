import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SimulationPanel } from './components/SimulationPanel';
export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas font-sans antialiased">
        <Toolbar />
        <div className="relative flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="relative flex-1 overflow-hidden">
            <Canvas />
            <SimulationPanel />
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
