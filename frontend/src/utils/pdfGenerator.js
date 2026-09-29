import { jsPDF } from 'jspdf';

/**
 * Generate and trigger download of a cinema e-ticket PDF
 * @param {Object} booking Populated booking object
 */
export const downloadTicketPDF = (booking) => {
  if (!booking) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Standard cinema ticket handbook size
  });

  const {
    bookingId = 'BMS-TICKET',
    movie,
    theater,
    show,
    seats = [],
    subtotal = 0,
    convenienceFee = 30,
    gst = 5.4,
    totalAmount = 0,
    createdAt,
    paymentMethod = 'UPI / Card',
  } = booking;

  // Parse qrToken if present as an immutable snapshot fallback
  let qrData = null;
  if (booking?.qrToken) {
    try {
      qrData = typeof booking.qrToken === 'string' ? JSON.parse(booking.qrToken) : booking.qrToken;
    } catch {
      qrData = null;
    }
  }

  const movieTitle = movie?.title || booking?.movieTitle || qrData?.movie || 'Cinema Movie';
  const certificate = movie?.certificate || 'U/A';
  const language = movie?.language || 'English';
  const theaterName = theater?.name || booking?.theaterName || qrData?.theater || 'Multiplex Cinema';
  const city = theater?.city || 'Cinema City';
  const screen = show?.screen || booking?.screen || qrData?.screen || 1;

  // Resolve best available show timestamp across model versions and snapshots
  const rawShowTime =
    show?.showTime ||
    show?.startTime ||
    booking?.showTime ||
    qrData?.showTime;

  const dateObj = rawShowTime ? new Date(rawShowTime) : null;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

  const showDate = isValidDate
    ? dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : (booking?.date || qrData?.date || (createdAt && !isNaN(new Date(createdAt).getTime()) ? new Date(createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'Confirmed Date'));

  const showTime = isValidDate
    ? dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : (booking?.time || qrData?.time || 'Scheduled Time');

  // 1. Dark Header Background
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 148, 38, 'F');

  // Red/Cyan Brand Accent Stripe
  doc.setFillColor(248, 68, 100); // BookMyShow Red
  doc.rect(0, 36, 148, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BOOKMYSHOW', 12, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212); // Cyan 400
  doc.text('OFFICIAL CINEMA E-TICKET', 12, 23);

  // Booking Reference (Top Right)
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(8);
  doc.text('BOOKING ID', 136, 15, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(bookingId, 136, 22, { align: 'right' });

  // 2. Movie & Show Details Section
  let y = 48;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(movieTitle, 12, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${language}  •  ${certificate}  •  2D Cinema Experience`, 12, y);

  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, y, 136, y);

  // 3. Venue & Schedule Grid
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('THEATER', 12, y);
  doc.text('DATE & TIME', 82, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${theaterName}, ${city}`, 12, y);
  doc.text(`${showDate}  at  ${showTime}`, 82, y);

  y += 5;
  doc.setTextColor(6, 182, 212);
  doc.setFont('helvetica', 'bold');
  doc.text(`AUDITORIUM SCREEN ${screen}`, 12, y);

  // 4. Seats Section Box
  y += 8;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, 124, 22, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIRMED SEATS', 18, y + 7);
  doc.text('NUMBER OF TICKETS', 90, y + 7);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(seats.join(', '), 18, y + 16);
  doc.text(`${seats.length} ${seats.length === 1 ? 'Ticket' : 'Tickets'}`, 90, y + 16);

  // 5. Payment & Verification Summary
  y += 30;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, y, 136, y);

  y += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Ticket Subtotal:', 12, y);
  doc.text(`INR ${subtotal.toFixed(2)}`, 136, y, { align: 'right' });

  y += 5;
  doc.text('Convenience Fee (Fixed):', 12, y);
  doc.text(`INR ${convenienceFee.toFixed(2)}`, 136, y, { align: 'right' });

  y += 5;
  doc.text('Integrated GST (18%):', 12, y);
  doc.text(`INR ${gst.toFixed(2)}`, 136, y, { align: 'right' });

  y += 6;
  doc.setDrawColor(15, 23, 42);
  doc.line(12, y, 136, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Paid:', 12, y);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`INR ${totalAmount.toFixed(2)}`, 136, y, { align: 'right' });

  // 6. Barcode Simulation & Verification Hash
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(12, y, 124, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, y, 124, 16, 'S');

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`||||  |  |||||  |||  ||||||  ||  |||||  ||||`, 74, y + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`SECURITY TOKEN: ${bookingId}-${Date.now().toString(16).toUpperCase()}`, 74, y + 12, {
    align: 'center',
  });

  // 7. Cinema Entry Guidelines
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('IMPORTANT GUIDELINES FOR ENTRY:', 12, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('1. Please arrive at least 15 minutes before the scheduled showtime.', 12, y);
  y += 3.5;
  doc.text(
    '2. Show this electronic ticket (PDF/QR code) directly on your mobile device at the cinema entrance.',
    12,
    y
  );
  y += 3.5;
  doc.text('3. Outside food and beverages are strictly not allowed inside the auditorium.', 12, y);

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const issuedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-US')
    : new Date().toLocaleString('en-US');
  doc.text(
    `Issued: ${issuedDate}  •  Method: ${paymentMethod}  •  Verified Authenticated`,
    12,
    202
  );

  // Trigger browser download
  doc.save(`BookMyShow_Ticket_${bookingId}.pdf`);
};

export default downloadTicketPDF;
