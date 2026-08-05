import jsPDF from 'jspdf'

export function generatePDF(order) {
  const doc = new jsPDF()

  let y = 10 // Y-axis start

  // Title
  doc.setFontSize(18)
  doc.text('Order Summary', 10, y)
  y += 10

  // Basic Info
  doc.setFontSize(12)
  doc.text(`Order ID: ${order.orderId}`, 10, y)
  y += 7
  doc.text(`Customer Name: ${order.name}`, 10, y)
  y += 7
  doc.text(`Phone: ${order.phoneNo}`, 10, y)
  y += 7
  doc.text(`Email: ${order.email}`, 10, y)
  y += 7
  doc.text(`Status: ${order.status}`, 10, y)
  y += 10

  // Shipping Address
  doc.setFontSize(14)
  doc.text('Shipping Address', 10, y)
  y += 7
  doc.setFontSize(12)
  doc.text(`${order.address}, ${order.city}, ${order.state}, ${order.pincode}`, 10, y)
  y += 10

  // Payment Info
  doc.setFontSize(14)
  doc.text('Payment Info', 10, y)
  y += 7
  doc.setFontSize(12)
  doc.text(`Method: ${order.method}`, 10, y)
  y += 7
  doc.text(`Amount: ₹${order.orderAmount}`, 10, y)
  y += 7
  doc.text(`Delivery Charge: ₹${order.deliveryCharge}`, 10, y)
  y += 7
  doc.text(`Subtotal: ₹${order.subtotal}`, 10, y)
  y += 10

  // Items Table
  doc.setFontSize(14)
  doc.text('Items', 10, y)
  y += 7
  doc.setFontSize(12)

  order.items?.forEach((item, index) => {
    const product = item.productId?.fullName || item.productId?.name || 'Product'
    doc.text(`${index + 1}. ${product}`, 10, y)
    y += 6
    doc.text(`   Variant: ${item.variantName}, Quantity: ${item.quantity}, Price: ₹${item.price}`, 10, y)
    y += 8
  })

  // Scans
  if (order.scans?.length) {
    doc.setFontSize(14)
    doc.text('Shipping Activity (Scans)', 10, y)
    y += 7
    doc.setFontSize(11)

    order.scans.forEach((scan, index) => {
      doc.text(`${index + 1}. ${scan.activity}`, 10, y)
      y += 5
      doc.text(`   Date: ${scan.date}`, 10, y)
      y += 5
      doc.text(`   Location: ${scan.location}`, 10, y)
      y += 5
      doc.text(`   Status: ${scan.status}, SR Status: ${scan['sr-status-label']}`, 10, y)
      y += 8
      if (y > 270) {
        doc.addPage()
        y = 10
      }
    })
  }

  doc.save(`Order-${order.orderId}.pdf`)
}
