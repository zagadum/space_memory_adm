import * as XLSX from 'xlsx';

type ExcelCell = string | number | boolean | null | undefined;

export interface TableExcelExportOptions {
    fileName: string;
    sheetName: string;
    rows: ExcelCell[][];
    columnWidths?: Array<{ wch: number }>;
}

export interface ExcelRow {
    category: string;
    description: string;
    rateQty: string | number;
    amount: number;
}

export function exportTableToExcel({
    fileName,
    sheetName,
    rows,
    columnWidths
}: TableExcelExportOptions) {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    if (columnWidths?.length) {
        worksheet['!cols'] = columnWidths;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    let safeName = fileName || 'Export';
    safeName = safeName.replace(/\.xlsx$/i, '').replace(/[<>:"/\\|?*]/g, '_');

    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.xlsx`;
    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.addEventListener('click', (e) => e.stopPropagation());
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 200);
}

export function exportSalaryToExcel(
    fileName: string,
    rows: ExcelRow[],
    totalAmount: number,
    t: (key: string) => string
) {
    // 1. Подготовка заголовков с фоллбэком (на случай если JSON не подгрузился)
    const headers = [
        t('salaryCalc.export.category') !== 'salaryCalc.export.category' ? t('salaryCalc.export.category') : 'Category',
        t('salaryCalc.export.description') !== 'salaryCalc.export.description' ? t('salaryCalc.export.description') : 'Description',
        t('salaryCalc.export.rateQty') !== 'salaryCalc.export.rateQty' ? t('salaryCalc.export.rateQty') : 'Rate/Qty',
        t('salaryCalc.export.amount') !== 'salaryCalc.export.amount' ? t('salaryCalc.export.amount') : 'Amount'
    ];

    // 2. Округляем все числа до 2 знаков после запятой
    const formattedRows = rows.map(row => [
        row.category,
        row.description,
        row.rateQty,
        Math.round(row.amount * 100) / 100 // Округление до 2 знаков: 258.88
    ]);

    // 3. Собираем финальную таблицу
    const worksheetData = [
        headers,
        ...formattedRows,
        [], // Пустая строка
        [
            '',
            '',
            t('salaryCalc.export.totalPayout') !== 'salaryCalc.export.totalPayout' ? t('salaryCalc.export.totalPayout') : 'TOTAL:',
            Math.round(totalAmount * 100) / 100
        ]
    ];

    exportTableToExcel({
        fileName,
        sheetName: 'Salary Report',
        rows: worksheetData,
        columnWidths: [
            { wch: 20 },
            { wch: 40 },
            { wch: 15 },
            { wch: 15 }
        ]
    });
}