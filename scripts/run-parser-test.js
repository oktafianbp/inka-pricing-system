const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--------------------------------------------------');
  console.log('🚀 MEMULAI PROSES PARSING & INGESTION EXCEL BOM');
  console.log('--------------------------------------------------\n');

  const filePath = path.join(process.cwd(), 'sample_bom_inka.xlsx');
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (err) {
    console.error('❌ Gagal membuka file Excel! Pastikan file "sample_bom_inka.xlsx" sudah dibuat.');
    process.exit(1);
  }

  const worksheet = workbook.getWorksheet('BOM Proyek') || workbook.worksheets[0];
  const parsedItems = [];

  // Reading rows (skipping row 1 header)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const system = row.getCell(1).value?.toString().trim() || 'GENERAL';
    const itemCode = row.getCell(2).value?.toString().trim() || '';
    const descCell = row.getCell(3);
    const description = descCell.value?.toString().trim() || 'Unassigned Material';
    
    const quantity = Number(row.getCell(4).value) || 0;
    const unit = row.getCell(5).value?.toString().trim() || 'Pcs';
    const sapPrice = Number(row.getCell(6).value) || 0;

    // Deteksi Strikethrough (garis coret pada teks)
    const isStrikethrough = Boolean(descCell.font?.strike || row.getCell(2).font?.strike);
    const scrapFactor = 1.0;
    const totalPrice = isStrikethrough ? 0 : quantity * sapPrice * scrapFactor;

    parsedItems.push({
      system,
      itemCode,
      description,
      quantity,
      unit,
      sapPrice,
      scrapFactor,
      totalPrice,
      isActive: !isStrikethrough
    });
  });

  // 1. TAMPILKAN HASIL PARSING DI TERMINAL
  console.log(`📊 DITEMUKAN TOTAL: ${parsedItems.length} BARIS MATERIAL\n`);
  
  const displayTable = parsedItems.map((item) => ({
    System: item.system,
    Kode: item.itemCode,
    Deskripsi: item.description,
    Qty: item.quantity,
    Satuan: item.unit,
    Status: item.isActive ? '✅ AKTIF' : '❌ DICORET (DIBATALKAN)',
    'Total Harga': `Rp ${item.totalPrice.toLocaleString('id-ID')}`
  }));

  console.table(displayTable);

  const totalSubtotalA = parsedItems
    .filter(item => item.isActive)
    .reduce((sum, item) => sum + item.totalPrice, 0);

  console.log('\n==================================================');
  console.log(`💰 HASIL AGREGASI SUBTOTAL A (HPP BAHAN): Rp ${totalSubtotalA.toLocaleString('id-ID')}`);
  console.log('==================================================\n');

  // 2. SIMPAN DUMMY DATA KE DATABASE POSTGRESQL VIA PRISMA
  try {
    console.log('💾 Menyiapkan penyimpanan ke Database via Prisma...');

    const project = await prisma.project.upsert({
      where: { code: 'PRJ-2026-LRT-INKA' },
      update: { subtotalA: totalSubtotalA },
      create: {
        code: 'PRJ-2026-LRT-INKA',
        name: 'Proyek Trainset LRT Jabodebek',
        description: 'Estimasi Biaya Penawaran Harga Trainset LRT',
        subtotalA: totalSubtotalA
      }
    });

    await prisma.bomItem.deleteMany({
      where: { projectId: project.id }
    });

    await prisma.bomItem.createMany({
      data: parsedItems.map((item) => ({
        projectId: project.id,
        system: item.system,
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        sapPrice: item.sapPrice,
        scrapFactor: item.scrapFactor,
        totalPrice: item.totalPrice,
        isActive: item.isActive
      }))
    });

    console.log(`✅ DATABASE SUCCESS: Data BOM berhasil disimpan ke Project ID [${project.id}].`);
  } catch (dbError) {
    console.log('⚠️ INFO DATABASE: Data parser berhasil dibaca, namun penyimpanan ke DB di-skip.');
    console.log('   (Sebab server PostgreSQL lokal belum berjalan/terkoneksi).');
  } finally {
    await prisma.$disconnect();
  }
}

main();