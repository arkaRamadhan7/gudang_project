
import jsPDF from 'jspdf';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
const formatDate = (date) => new Date(date).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const downloadStrukAsPDF = (data) => {
  const { faktur, items, total, tanggal, username, namaToko, alamatToko } = data;

  const line_height = 4;
  const item_row_height = 8;
  let calculatedHeight = 55 + (items.length * item_row_height);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, calculatedHeight]
  });

  pdf.setFont('courier');
  pdf.setFontSize(8);
  
  let y = 10;
  const x_center = 40, x_left = 5, x_right = 75;


  pdf.save(`struk-${faktur}.pdf`);
};