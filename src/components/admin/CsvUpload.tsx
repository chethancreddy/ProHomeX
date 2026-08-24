'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Download, AlertCircle, CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';

interface TemplateField {
  key: string;
  label: string;
  required: boolean;
  example: string;
  description?: string;
}

interface FailedRow {
  row: number;
  data: Record<string, string>;
  error: string;
}

interface ImportResult {
  created: number;
  updated: number;
  failed: FailedRow[];
}

interface Props {
  entityName: string;
  templateFields: TemplateField[];
  onImport: (rows: Record<string, string>[]) => Promise<ImportResult>;
  backHref: string;
}

type Step = 'upload' | 'preview' | 'importing' | 'done';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export function CsvUpload({ entityName, templateFields, onImport, backHref }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; errors: string[] }[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = templateFields.map(f => f.key).join(',');
    const example = templateFields.map(f => `"${f.example}"`).join(',');
    const blob = new Blob([`${headers}\n${example}\n`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadFailedRows() {
    if (!importResult?.failed?.length) return;
    const headers = [...Object.keys(importResult.failed[0].data), '_row', '_error'].join(',');
    const rows = importResult.failed.map(f =>
      [...Object.values(f.data).map(v => `"${v}"`), f.row, `"${f.error}"`].join(',')
    );
    const blob = new Blob([`${headers}\n${rows.join('\n')}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/\s+/g, '_')}_failed_rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) { alert('Please upload a .csv file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (!parsed.length) { alert('CSV is empty or has no data rows'); return; }
      
      // Validate required fields
      const requiredFields = templateFields.filter(f => f.required).map(f => f.key);
      const errors: typeof validationErrors = [];
      parsed.forEach((row, i) => {
        const missing = requiredFields.filter(f => !row[f]?.trim());
        if (missing.length) errors.push({ row: i + 2, errors: missing.map(f => `"${f}" is required`) });
      });

      setRows(parsed);
      setValidationErrors(errors);
      setStep('preview');
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    const validRows = rows.filter((_, i) => !validationErrors.find(e => e.row === i + 2));
    setStep('importing');
    try {
      const result = await onImport(validRows);
      setImportResult(result);
      setStep('done');
    } catch (err: any) {
      setImportResult({ created: 0, updated: 0, failed: [{ row: 0, data: {}, error: err.message }] });
      setStep('done');
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload — {entityName}</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV file to create or update {entityName.toLowerCase()} in bulk.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'preview', 'done'] as const).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-blue-600 text-white' : 
              (step === 'preview' && i === 0) || (step === 'done' && i < 2) || (step === 'importing' && i < 2)
                ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i + 1}</span>
            <span className={step === s ? 'font-semibold text-blue-700' : 'text-gray-400'}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
            {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </span>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-800">Download Sample Template</p>
              <p className="text-xs text-blue-600 mt-0.5">Use this CSV as a starting point. Required fields are marked with *.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {templateFields.map(f => (
                  <span key={f.key} className={`text-xs px-2 py-0.5 rounded-full ${f.required ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-blue-100 text-blue-700'}`}>
                    {f.key}{f.required ? '*' : ''}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={downloadTemplate} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={15} /> Template
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          >
            <UploadCloud size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Drop your CSV file here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{rows.length} rows detected</p>
              {validationErrors.length > 0 && (
                <p className="text-xs text-orange-600 mt-0.5">{validationErrors.length} rows have errors and will be skipped</p>
              )}
            </div>
            <button onClick={() => setStep('upload')} className="text-sm text-gray-500 hover:text-gray-700">← Change file</button>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-xs font-bold text-orange-800 mb-2">Validation Errors (rows will be skipped):</p>
              {validationErrors.map(e => (
                <p key={e.row} className="text-xs text-orange-700">Row {e.row}: {e.errors.join(', ')}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500">Preview (first 10 rows)</div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="px-3 py-2 text-slate-500 font-semibold">#</th>
                    {Object.keys(rows[0] || {}).map(h => <th key={h} className="px-3 py-2 text-slate-500 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, i) => {
                    const hasError = validationErrors.some(e => e.row === i + 2);
                    return (
                      <tr key={i} className={`border-b ${hasError ? 'bg-red-50' : ''}`}>
                        <td className={`px-3 py-2 font-mono ${hasError ? 'text-red-600' : 'text-slate-400'}`}>{i + 2}</td>
                        {Object.values(row).map((val, j) => <td key={j} className="px-3 py-2 text-slate-700 truncate max-w-[150px]">{val || '—'}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleImport}
              disabled={rows.length - validationErrors.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
              <CheckCircle2 size={15} /> Import {rows.length - validationErrors.length} Valid Rows
            </button>
            <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2.5: Importing */}
      {step === 'importing' && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-700">Importing records…</p>
          <p className="text-xs text-gray-400 mt-1">This may take a moment for large files.</p>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && importResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{importResult.created}</p>
              <p className="text-xs text-green-600 mt-1">Created</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{importResult.updated}</p>
              <p className="text-xs text-blue-600 mt-1">Updated</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{importResult.failed.length}</p>
              <p className="text-xs text-red-600 mt-1">Failed</p>
            </div>
          </div>

          {importResult.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-red-800">Failed Rows</p>
                <button onClick={downloadFailedRows} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                  <Download size={12} /> Download failed.csv
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {importResult.failed.map((f, i) => (
                  <p key={i} className="text-xs text-red-700">Row {f.row}: {f.error}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <a href={backHref} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Back to {entityName}
            </a>
            <button onClick={() => { setStep('upload'); setRows([]); setValidationErrors([]); setImportResult(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
