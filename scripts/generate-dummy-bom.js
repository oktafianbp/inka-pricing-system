const ExcelJS = require('exceljs');

async function generateSampleBom() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('BOM Proyek');

  // 1. Setup Header
  worksheet.columns = [
    { header: 'System / Subsystem', key: 'system', width: 22 },
    { header: 'Kode Material', key: 'code', width: 15 },
    { header: 'Deskripsi Komponen / Material', key: 'desc', width: 40 },
    { header: 'Qty', key: 'qty', width: 10 },
    { header: 'Satuan', key: 'unit', width: 12 },
    { header: 'Estimasi Harga Satuan (Rp)', key: 'price', width: 25 }
  ];

  // Formatting Header (Bold + Grey Fill)
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // 2. Data Normal (Carbody System)
  worksheet.addRow({ system: 'CARBODY', code: 'MAT-001', desc: 'Plat Stainless Steel 304 3mm', qty: 120, unit: 'Meter', price: 350000 });
  worksheet.addRow({ system: 'CARBODY', code: 'MAT-002', desc: 'Rangka Frame Utama Carbody', qty: 1, unit: 'Set', price: 125000000 });

  // 3. Data Edge-Case: Item DICORET / Strikethrough (Material dibatalkan/dihapus)
  const deletedRow = worksheet.addRow({ system: 'CARBODY', code: 'MAT-003', desc: 'Plat Besi Carbon St-37 (DIBATALKAN)', qty: 50, unit: 'Meter', price: 150000 });
  deletedRow.getCell('desc').font = { strike: true };
  deletedRow.getCell('code').font = { strike: true };

  // 4. Data Edge-Case: Beda Satuan
  worksheet.addRow({ system: 'FINISHING', code: 'MAT-004', desc: 'Cat Primer Anti Karat PU', qty: 45, unit: 'Liter', price: 85000 });
  worksheet.addRow({ system: 'INTERIOR', code: 'MAT-005', desc: 'Karpet Anti Slip Vinyl', qty: 80, unit: 'Meter', price: 210000 });

  // 5. Data Bogie & Brake System
  worksheet.addRow({ system: 'BOGIE', code: 'MAT-006', desc: 'Wheelset Train Assembly', qty: 8, unit: 'Set', price: 65000000 });
  worksheet.addRow({ system: 'BRAKE SYSTEM', code: 'MAT-007', desc: 'Air Brake Compressor Unit', qty: 2, unit: 'Unit', price: 42000000 });

  // Simpan File
  const fileName = 'sample_bom_inka.xlsx';
  await workbook.xlsx.writeFile(fileName);
  console.log(`✅ BERHASIL! File dummy "${fileName}" telah dibuat di root folder proyek.`);
}

generateSampleBom();