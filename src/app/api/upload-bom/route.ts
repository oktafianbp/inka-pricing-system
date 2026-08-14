import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet('BOM Proyek') || workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet BOM tidak ditemukan di dalam file.' }, { status: 400 });
    }

    const items: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip Header Row

      const system = row.getCell(1).value?.toString().trim() || 'GENERAL';
      const itemCode = row.getCell(2).value?.toString().trim() || '-';
      const descCell = row.getCell(3);
      const description = descCell.value?.toString().trim() || 'Unassigned Material';
      
      const quantity = Number(row.getCell(4).value) || 0;
      const unit = row.getCell(5).value?.toString().trim() || 'Pcs';
      const sapPrice = Number(row.getCell(6).value) || 0;

      // Deteksi Strikethrough (Teks dicoret)
      const isStrikethrough = Boolean(descCell.font?.strike || row.getCell(2).font?.strike);
      const scrapFactor = 1.0;
      const totalPrice = isStrikethrough ? 0 : quantity * sapPrice * scrapFactor;

      items.push({
        id: `item-${rowNumber}`,
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

    const activeItems = items.filter((item) => item.isActive);
    const subtotalA = activeItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return NextResponse.json({
      success: true,
      filename: file.name,
      totalRows: items.length,
      activeRows: activeItems.length,
      inactiveRows: items.length - activeItems.length,
      subtotalA,
      items
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses file Excel' }, { status: 500 });
  }
}