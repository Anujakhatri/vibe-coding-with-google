import React from 'react';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';
import { SchemaDesigner } from './components/tools/SchemaDesigner';
import { QueryGenerator } from './components/tools/QueryGenerator';
import { SQLDebugger } from './components/tools/SQLDebugger';
import { DummyDataGenerator } from './components/tools/DummyDataGenerator';

function App() {
  const { activeTool } = useStore();

  const renderTool = () => {
    switch (activeTool) {
      case 'schema':
        return <SchemaDesigner />;
      case 'query':
        return <QueryGenerator />;
      case 'debugger':
        return <SQLDebugger />;
      case 'dummy':
        return <DummyDataGenerator />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {renderTool()}
      </div>
    </Layout>
  );
}

export default App;
