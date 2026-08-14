'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Calculator, AlertCircle } from 'lucide-react';

interface BomItem {
  id: string;
  system: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  sapPrice: number;
  totalPrice: number;
  isActive: boolean;
}

interface UploadResponse {
  filename: string;
  totalRows: number;
  activeRows: number;
  inactiveRows: number;
  subtotalA: number;
  items: BomItem[];
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-bom', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat upload');
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Bar */}
      <header className="bg-blue-900 text-white py-4 px-8 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wide">PT INKA (PERSERO)</h1>
          <p className="text-xs text-blue-200">System Pricing & Cost Estimation Trainset</p>
        </div>
        <span className="bg-blue-800 text-blue-100 text-xs px-3 py-1 rounded-full font-mono">
          Sprint 1 - Ingestion Module
        </span>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Section Upload Box */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Upload File Excel BOM Proyek</h2>
              <p className="text-sm text-slate-500">Pilih file <code className="text-blue-600 font-mono">sample_bom_inka.xlsx</code> dari folder proyek kamu.</p>
            </div>

            <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer transition shadow">
              <Upload className="w-4 h-4" />
              {loading ? 'Memproses File...' : 'Pilih File Excel'}
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section Metrics Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Baris Material</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{data.totalRows} Items</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-semibold">Material Aktif</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5" /> {data.activeRows} Items
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-semibold">Material Dibatalkan</p>
              <p className="text-2xl font-bold text-red-500 mt-1 flex items-center gap-1">
                <XCircle className="w-5 h-5" /> {data.inactiveRows} Items
              </p>
            </div>
            <div className="bg-blue-900 text-white p-5 rounded-xl shadow-md">
              <p className="text-xs text-blue-200 uppercase font-semibold flex items-center gap-1">
                <Calculator className="w-4 h-4" /> Subtotal A (HPP Bahan)
              </p>
              <p className="text-2xl font-extrabold mt-1">
                Rp {data.subtotalA.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}

        {/* Section Data Table */}
        {data && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Detail Komponen BOM ({data.filename})</h3>
              <span className="text-xs text-slate-400">Pembersihan Strikethrough Otomatis</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold text-xs uppercase">
                  <tr>
                    <th className="p-4">System</th>
                    <th className="p-4">Kode</th>
                    <th className="p-4">Deskripsi Material</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Satuan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Total Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr key={item.id} className={item.isActive ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                      <td className="p-4 font-mono text-xs font-semibold text-slate-600">{item.system}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">{item.itemCode}</td>
                      <td className={`p-4 font-medium ${!item.isActive ? 'line-through text-red-500' : 'text-slate-800'}`}>
                        {item.description}
                      </td>
                      <td className="p-4 font-mono">{item.quantity}</td>
                      <td className="p-4 text-slate-500">{item.unit}</td>
                      <td className="p-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Dibatalkan
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-800">
                        Rp {item.totalPrice.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}