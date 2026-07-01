import { useState } from 'react';
import { initialResumeData } from './data/initialData';
import { TEMPLATES } from './data/templates';
import type { ResumeData, ResumeStyle, ResumeTemplate } from './types/resume';
import { TemplateSelector } from './components/TemplateSelector';
import { StyleCustomizer } from './components/StyleCustomizer';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import './styles/App.css';
import { 
  FileText, Palette, Sliders, Printer, RotateCcw, Download, Upload, ZoomIn, ZoomOut, Check, Info, AlertTriangle
} from 'lucide-react';

function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(TEMPLATES[0].id);
  const [currentStyle, setCurrentStyle] = useState<ResumeStyle>(TEMPLATES[0].style);
  
  const [activeTab, setActiveTab] = useState<'form' | 'templates' | 'style'>('form');
  const [zoom, setZoom] = useState<number>(0.9); // zoom level 0.7 - 1.2
  const [showPrintGuide, setShowPrintGuide] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Apply a prebuilt template
  const handleSelectTemplate = (template: ResumeTemplate) => {
    setActiveTemplateId(template.id);
    setCurrentStyle(template.style);
    triggerToast(`Applied template: "${template.name}"`);
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 3000);
  };

  // Trigger browser print dialog
  const handlePrint = () => {
    setShowPrintGuide(false);
    // Short timeout to allow modal animation to clear
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Reset to initial mock data
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the resume back to the default profile? All your edits will be lost.")) {
      setResumeData(initialResumeData);
      setActiveTemplateId(TEMPLATES[0].id);
      setCurrentStyle(TEMPLATES[0].style);
      triggerToast("Reset to default profile data");
    }
  };

  // Back up data to JSON
  const handleExportJSON = () => {
    const exportState = {
      data: resumeData,
      style: currentStyle,
      templateId: activeTemplateId
    };
    const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-backup-${resumeData.personalInfo.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast("Backup JSON file downloaded");
  };

  // Restore data from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.data && parsed.style) {
            setResumeData(parsed.data);
            setCurrentStyle(parsed.style);
            if (parsed.templateId) {
              setActiveTemplateId(parsed.templateId);
            }
            triggerToast("Resume details restored successfully!");
          } else {
            alert("Error: Invalid backup file format. Missing data or style configuration.");
          }
        } catch (err) {
          alert("Failed to parse the backup file: " + err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className="sidebar-panel no-print">
        {/* Navigation / Branding */}
        <div className="nav-header">
          <div className="brand">
            <FileText className="brand-icon" size={20} />
            <h1>Resume Builder Pro</h1>
          </div>
          <div className="nav-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPrintGuide(true)}
              title="Download as PDF / Print"
            >
              <Printer size={15} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Controllers */}
        <nav className="panel-tabs">
          <button 
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <FileText size={15} />
            <span>Content</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Palette size={15} />
            <span>Templates</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            <Sliders size={15} />
            <span>Customize</span>
          </button>
        </nav>

        {/* Tab Content Panel */}
        <div className="panel-content">
          {activeTab === 'form' && (
            <ResumeForm 
              data={resumeData} 
              onChangeData={setResumeData} 
            />
          )}

          {activeTab === 'templates' && (
            <TemplateSelector
              activeTemplateId={activeTemplateId}
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {activeTab === 'style' && (
            <StyleCustomizer 
              style={currentStyle} 
              onChangeStyle={setCurrentStyle} 
            />
          )}
        </div>

        {/* Bottom Control Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--panel-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.15)'
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset} 
            title="Reset default values"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <input 
              type="file" 
              id="json-import-file" 
              accept=".json"
              onChange={handleImportJSON} 
              style={{ display: 'none' }}
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => document.getElementById('json-import-file')?.click()}
              title="Restore from JSON backup file"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <Upload size={13} />
              <span>Import</span>
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportJSON}
              title="Backup details to JSON file"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. RIGHT PREVIEW CANVAS */}
      <main className="preview-canvas-container">
        
        {/* Floating Zoom and Tip Controllers */}
        <div className="no-print" style={{
          position: 'absolute',
          top: '1rem',
          right: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 5,
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--panel-border)',
            padding: '0.3rem 0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <button 
              className="btn-icon" 
              onClick={() => setZoom(Math.max(0.6, zoom - 0.05))} 
              style={{ padding: '0.2rem', background: 'transparent', border: 'none' }}
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '35px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button 
              className="btn-icon" 
              onClick={() => setZoom(Math.min(1.2, zoom + 0.05))}
              style={{ padding: '0.2rem', background: 'transparent', border: 'none' }}
            >
              <ZoomIn size={14} />
            </button>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--panel-border)',
            padding: '0.4rem 0.6rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.7rem'
          }}>
            <Info size={12} className="brand-icon" />
            <span>Click any text directly on the page to edit inline!</span>
          </div>
        </div>

        {/* Scaled paper sheets */}
        <div style={{
          minHeight: `${1123 * zoom}px`,
          width: `${794 * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
          boxSizing: 'border-box'
        }}>
          <ResumePreview 
            data={resumeData}
            style={currentStyle}
            onChangeData={setResumeData}
          />
        </div>

        {/* Success Alert Toast Notification */}
        {showSuccessToast && (
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: '#10b981',
            color: 'white',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            zIndex: 100,
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            <Check size={14} />
            <span>{showSuccessToast}</span>
          </div>
        )}

        {/* PRINT / PDF DOWNLOAD HELP MODAL */}
        {showPrintGuide && (
          <>
            <div className="modal-backdrop" onClick={() => setShowPrintGuide(false)} />
            <div className="print-helper-modal">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#60a5fa' }}>
                <Printer size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>PDF Export Guide</h3>
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <p style={{ margin: 0 }}>To print or download your resume as a clean, pixel-perfect PDF document, verify these settings in the browser print window:</p>
                
                <ol style={{ paddingLeft: '1.25rem', margin: '0.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Set <strong>Destination</strong> to <strong>Save as PDF</strong> (or Microsoft Print to PDF).</li>
                  <li>Click <strong>More settings</strong> to expand configuration options.</li>
                  <li>Ensure <strong>Background graphics</strong> is checked <span style={{ color: '#f59e0b', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><AlertTriangle size={10} />(Required for color themes!)</span></li>
                  <li>Set <strong>Margins</strong> to <strong>None</strong> or <strong>Default</strong>.</li>
                  <li>Set <strong>Paper size</strong> to <strong>A4</strong> (or Letter) to match the template aspect ratio.</li>
                  <li>Untick <strong>Headers and footers</strong> to remove the browser date/URL timestamps from the page edges.</li>
                </ol>

                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderLeft: '2px solid #ef4444' }}>
                  Note: Any editing outlines or control bars will automatically be stripped from the printed page.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowPrintGuide(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePrint}>Open Print Dialog</button>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default App;
