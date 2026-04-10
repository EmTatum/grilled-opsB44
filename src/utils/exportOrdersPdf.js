import { jsPDF } from "jspdf";
import moment from "moment";

export function exportOrdersPdf(orders) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  let y = 54;

  const drawHeader = () => {
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(1);
    doc.line(margin, 36, pageWidth - margin, 36);

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(201, 168, 76);
    doc.text("GRILLED OPS", margin, 72);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(232, 208, 138);
    doc.text("INTERNAL OPERATIONS", margin, 88);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(201, 168, 76);
    doc.text("SELECTED ORDERS EXPORT", pageWidth - margin, 72, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(245, 240, 232);
    doc.text(`Generated ${moment().format("D MMM YYYY · h:mm A")}`, pageWidth - margin, 88, { align: "right" });

    y = 118;
  };

  const drawTableHeader = () => {
    doc.setFillColor(17, 17, 17);
    doc.rect(margin, y, pageWidth - margin * 2, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(201, 168, 76);
    doc.text("CLIENT", margin + 10, y + 16);
    doc.text("DATE", margin + 180, y + 16);
    doc.text("STATUS", margin + 300, y + 16);
    doc.text("VALUE", margin + 390, y + 16);
    doc.text("PAYMENT", margin + 455, y + 16);
    y += 32;
  };

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      drawHeader();
      drawTableHeader();
    }
  };

  drawHeader();
  drawTableHeader();

  orders.forEach((order) => {
    const detailsLines = doc.splitTextToSize(order.order_details || "—", pageWidth - margin * 2 - 20);
    const rowHeight = 44 + detailsLines.length * 12;
    ensureSpace(rowHeight);

    doc.setDrawColor(255, 255, 255, 0.06);
    doc.line(margin, y - 8, pageWidth - margin, y - 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 240, 232);
    doc.text(order.client_name || "—", margin + 10, y + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(245, 240, 232);
    doc.text(moment(order.order_date).format("D MMM YYYY"), margin + 180, y + 2);
    doc.text(order.status || "—", margin + 300, y + 2);
    doc.text(order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "—", margin + 390, y + 2);
    doc.text(order.payment_method || "—", margin + 455, y + 2);

    doc.setFontSize(8);
    doc.setTextColor(201, 168, 76);
    doc.text(order.time_slot || moment(order.order_date).format("h:mm A"), margin + 10, y + 18);

    doc.setFontSize(9);
    doc.setTextColor(245, 240, 232);
    doc.text(detailsLines, margin + 10, y + 36);

    y += rowHeight;
  });

  doc.save(`grilled-orders-${moment().format("YYYY-MM-DD-HHmm")}.pdf`);
}