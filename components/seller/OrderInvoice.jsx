"use client";

import { useEffect, useRef } from "react";

export default function OrderInvoice({ order, shopDetails, onPrintComplete }) {
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (order && shopDetails && !hasPrinted.current) {
      hasPrinted.current = true;
      // Generate invoice HTML
      const invoiceHTML = generateInvoiceHTML(order, shopDetails);
      
      // Use hidden iframe instead of opening a new tab
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);

      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(invoiceHTML);
      iframe.contentWindow.document.close();

      // Wait for rendering before printing
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error("Print dialog blocked or failed", e);
        }
        
        // Cleanup after print dialog opens
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          if (onPrintComplete) onPrintComplete();
        }, 1000);
      }, 500);
    }
  }, [order, shopDetails, onPrintComplete]);

  return null;
}

function generateInvoiceHTML(order, shopDetails) {
  const isDelivery = order.deliveryMode === "home_delivery";
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = order.deliveryFee || 0;
  const total = order.total || subtotal + deliveryFee;
  const orderDate = new Date(order.createdAt);
  const prepTime = order.estimatedPrepTime || 15;

  const itemsHTML = order.items.map((item, idx) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.name}${item.variant ? `<br/><small style="color: #666;">${item.variant}</small>` : ""}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">x${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs.${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order._id.slice(-6).toUpperCase()}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
          color: #000;
        }
        .invoice-wrapper {
          max-width: 80mm;
          margin: 0 auto;
          padding: 20px;
          color: #000;
        }
        .receipt {
          width: 100%;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .shop-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .shop-contact {
          font-size: 11px;
          line-height: 1.4;
        }
        .section-header {
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 6px;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .row-label {
          flex: 1;
        }
        .row-value {
          text-align: right;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        th {
          text-align: left;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding: 6px 0;
          font-size: 11px;
        }
        td {
          padding: 6px 0;
          font-size: 10px;
          border-bottom: 1px solid #ddd;
        }
        .totals {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px 0;
          margin: 8px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          padding: 4px 0;
        }
        .grand-total {
          font-size: 14px;
          padding: 8px 0;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 10px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
        .notes {
          font-size: 10px;
          margin-top: 8px;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-wrapper {
            padding: 10px;
            max-width: 100%;
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        <div class="receipt">
          <!-- Header -->
          <div class="receipt-header">
            <div class="shop-name">${shopDetails.shopName || "Shop"}</div>
            <div class="shop-contact">
              ${shopDetails.phone ? `<div>${shopDetails.phone}</div>` : ""}
              ${shopDetails.shopAddress ? `<div>${shopDetails.shopAddress}</div>` : ""}
            </div>
          </div>

          <!-- Order Header -->
          <div class="section-header">ORDER RECEIPT</div>
          <div class="row">
            <span class="row-label">Order #</span>
            <span class="row-value">#${order._id.slice(-6).toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="row-label">Date:</span>
            <span class="row-value">${orderDate.toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="row-label">Time:</span>
            <span class="row-value">${orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          <!-- Customer Details -->
          <div class="section-header">CUSTOMER DETAILS</div>
          <div class="row">
            <span class="row-label">Name:</span>
            <span class="row-value" style="font-weight: bold;">${order.userId?.name || order.customerName || "Customer"}</span>
          </div>
          <div class="row">
            <span class="row-label">Phone:</span>
            <span class="row-value">${order.userId?.phone || order.customerPhone || "N/A"}</span>
          </div>
          ${isDelivery && order.deliveryAddress ? `
            <div style="margin-top: 6px; font-size: 10px;">
              <div style="font-weight: bold; margin-bottom: 2px;">Delivery Address:</div>
              <div style="line-height: 1.4;">
                ${order.deliveryAddress.address || ""}<br/>
                ${order.deliveryAddress.city || ""}${order.deliveryAddress.postalCode ? ", " + order.deliveryAddress.postalCode : ""}
              </div>
            </div>
          ` : ""}

          <!-- Order Type & Payment -->
          <div class="section-header">ORDER INFO</div>
          <div class="row">
            <span class="row-label">Mode:</span>
            <span class="row-value">${isDelivery ? "Home Delivery" : "Self Pickup"}</span>
          </div>
          <div class="row">
            <span class="row-label">Payment:</span>
            <span class="row-value">${order.isPaid ? "PAID (Card)" : "COD"}</span>
          </div>
          ${prepTime ? `
            <div class="row">
              <span class="row-label">Est. Ready:</span>
              <span class="row-value">${prepTime} mins</span>
            </div>
          ` : ""}

          <!-- Items -->
          <div class="section-header">ITEMS</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs.${subtotal.toFixed(2)}</span>
            </div>
            ${deliveryFee > 0 ? `
              <div class="total-row">
                <span>Delivery:</span>
                <span>Rs.${deliveryFee.toFixed(2)}</span>
              </div>
            ` : ""}
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>Rs.${total.toFixed(2)}</span>
            </div>
          </div>

          <!-- Notes -->
          ${order.notes ? `
            <div class="notes">
              <div style="font-weight: bold; margin-bottom: 4px;">NOTES:</div>
              <div>${order.notes}</div>
            </div>
          ` : ""}

          <!-- Footer -->
          <div class="footer">
            <div style="margin-bottom: 4px;">Thank you for your order!</div>
            <div>Printed: ${new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
          }