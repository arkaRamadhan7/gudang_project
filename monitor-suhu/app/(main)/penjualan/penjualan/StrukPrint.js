import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

const StrukPrint = ({ data, onHide }) => {
  const { faktur, items, total, tanggal, username, namaToko, alamatToko } = data;
  const hasDownloaded = useRef(false);

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  const formatDate = (date) => new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  useEffect(() => {
    if (data && !hasDownloaded.current) {
      hasDownloaded.current = true;

      const line_height = 4; 
      const item_row_height = 8; 
      let calculatedHeight = 0;

      calculatedHeight += 10; 
      calculatedHeight += line_height * 3; 
      calculatedHeight += line_height * 2; 
      calculatedHeight += line_height * 3; 
      calculatedHeight += line_height; 
      calculatedHeight += items.length * item_row_height; 
      calculatedHeight += line_height; 
      calculatedHeight += line_height * 2;
      calculatedHeight += line_height * 2; 
      calculatedHeight += line_height; 
      calculatedHeight += 10; 

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, calculatedHeight] 
      });

      pdf.setFont('courier');
      pdf.setFontSize(8);
      
      let y = 10;
      const x_center = 40, x_left = 5, x_right = 75;

      pdf.setFontSize(10);
      pdf.text(namaToko, x_center, y, { align: 'center' }); y += line_height;
      pdf.setFontSize(8);
      pdf.text(alamatToko, x_center, y, { align: 'center' }); y += line_height;
      pdf.text("Telp: 0812-3456-7890", x_center, y, { align: 'center' }); y += line_height * 2;
      
      pdf.text(`No: ${faktur}`, x_left, y); y += line_height;
      pdf.text(`Tanggal: ${formatDate(tanggal)}`, x_left, y); y += line_height;
      pdf.text(`Kasir: ${username}`, x_left, y); y += line_height;

      pdf.line(x_left, y, x_right, y); y += line_height;

      items.forEach(item => {
        pdf.text(item.nama, x_left, y);
        y += line_height;
        pdf.text(`${item.qty} x ${formatCurrency(item.harga)}`, x_left + 2, y);
        pdf.text(formatCurrency(item.qty * item.harga), x_right, y, { align: 'right' });
        y += line_height;
      });

      pdf.line(x_left, y, x_right, y); y += line_height;

      pdf.setFontSize(10);
      pdf.setFont('courier', 'bold');
      pdf.text('TOTAL', x_left, y);
      pdf.text(formatCurrency(total), x_right, y, { align: 'right' }); y += line_height * 2;

      pdf.setFont('courier', 'normal');
      pdf.setFontSize(8);
      pdf.text("Terima Kasih Atas Kunjungan Anda", x_center, y, { align: 'center' });
      
      pdf.save(`struk-${faktur}.pdf`);

      setTimeout(() => { onHide(); }, 500);
    }
  }, [data, onHide, faktur, items, total, username, namaToko, alamatToko]); 
};

export default StrukPrint;