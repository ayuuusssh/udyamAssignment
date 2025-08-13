import React from 'react';
import FormRenderer from './components/FormRenderer.jsx';

export default function App() {
  return (
    <div className="container">
      <h1>Udyam — Mock Registration (Steps 1 & 2)</h1>
      <div className="card">
        <FormRenderer />
      </div>
    </div>
  );
}
