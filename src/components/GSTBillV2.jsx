'use client'
import React, { useState } from 'react'
import { Page, Text, View, Document, StyleSheet, Font, pdf, Image } from '@react-pdf/renderer'
import MiniLoaderButton from './custom/MiniLoaderButton';
import { Download } from 'lucide-react';

// Register Inter font (keep your font files in /public/fonts)
Font.register({
    family: 'Inter',
    fonts: [
        { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
        { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    ],
})

const styles = StyleSheet.create({
    page: {
        padding: 12,
        fontSize: 9,
        fontFamily: 'Inter',
        lineHeight: 1.2,
    },
    topTitleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        position: 'relative',
    },
    topTitle: {
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        width: '100%',
    },
    // originalCopy: {
    //     position: 'absolute',
    //     right: 0,
    //     top: -2,
    //     fontSize: 8,
    // },

    headerBox: {
        flexDirection: 'row',
        borderWidth: 1,
        padding: 6,
        marginBottom: 6,
    },
    headerLeft: {
        width: '62%',
        paddingRight: 6,
        borderRightWidth: 1,
        borderStyle: 'solid',
    },
    headerRight: {
        width: '38%',
        paddingLeft: 6,
        justifyContent: 'flex-start',
    },

    sellerName: {
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 4,
    },
    smallText: { fontSize: 9 },
    smallText2: {
        fontSize: 9,
        textTransform: 'uppercase'
    },

    invoiceSmallBox: {
        borderWidth: 1,
        borderStyle: 'solid',
        padding: 6,
        marginBottom: 6,
    },
    invoiceLabel: { fontSize: 8, fontWeight: 600, marginBottom: 2 },

    billBox: {
        borderWidth: 1,
        marginBottom: 6,
        padding: 6,
        flexDirection: 'row',
    },
    billLeft: {
        width: '62%',
        paddingRight: 6,
        borderRightWidth: 1,
        borderStyle: 'solid',
    },
    billRight: {
        width: '38%',
        paddingLeft: 6,
    },
    billHeading: { fontWeight: 700, marginBottom: 4 },

    // Items table
    table: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    tableCell: {
        padding: 4,
        borderRightWidth: 1,
        borderStyle: 'solid',
        textAlign: 'center',
        fontSize: 9,
    },
    tableHeaderCell: {
        backgroundColor: '#eee',
        fontWeight: 700,
    },

    // Summary area (right)
    rightSummaryBox: {
        width: '38%',
        marginLeft: '62%',
        marginTop: 4,
        borderWidth: 1,
        borderStyle: 'solid',
        padding: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalAmountBox: {
        marginTop: 6,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        paddingTop: 6,
    },

    // Lower split: amount in words + total amount
    lowerSplit: {
        flexDirection: 'row',
        marginTop: 4,
    },
    lowerLeft: {
        width: '62%',
        padding: 6,
        borderWidth: 1,
        borderRightWidth: 0,
        borderStyle: 'solid',
    },
    lowerRight: {
        width: '38%',
        padding: 6,
        borderWidth: 1,
        borderStyle: 'solid',
    },

    // Tax breakdown table
    taxTable: {
        borderWidth: 1,
        borderStyle: 'solid',
        marginTop: 6,
    },
    taxRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    taxCell: {
        padding: 6,
        borderRightWidth: 1,
        borderStyle: 'solid',
        fontSize: 9,
        textAlign: 'center',
    },

    // Bottom: terms / QR / signature
    bottomSection: {
        flexDirection: 'row',
        marginTop: 8,
        // height: 110,
    },
    bottomLeft: {
        width: '74%',
        borderWidth: 1,
        // borderRightWidth: 0,
        borderStyle: 'solid',
        padding: 6,
    },
    // bottomMiddle: {
    //     width: '12%',
    //     borderWidth: 1,
    //     padding: 6,
    //     borderLeftWidth: 0,
    //     borderRightWidth: 0,
    //     borderStyle: 'solid',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
    bottomRight: {
        width: '26%',
        borderWidth: 1,
        borderStyle: 'solid',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallNote: { fontSize: 8, marginBottom: 4 },

    footerText: { fontSize: 8, textAlign: 'center', marginTop: 6 },
})


Font.register({
    family: 'Inter',
    fonts: [
        { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
        { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    ],
})

// ... styles remain the same ...

// Improved number to words function
const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero';
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    let words = '';
    const crore = Math.floor(num / 10000000);
    if (crore > 0) {
        words += numberToWords(crore) + ' Crore ';
        num %= 10000000;
    }

    const lakh = Math.floor(num / 100000);
    if (lakh > 0) {
        words += numberToWords(lakh) + ' Lakh ';
        num %= 100000;
    }

    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
        words += numberToWords(thousand) + ' Thousand ';
        num %= 1000;
    }

    const hundred = Math.floor(num / 100);
    if (hundred > 0) {
        words += units[hundred] + ' Hundred ';
        num %= 100;
    }

    if (num > 0) {
        if (words !== '') words += 'and ';
        if (num < 10) words += units[num];
        else if (num < 20) words += teens[num - 10];
        else {
            words += tens[Math.floor(num / 10)];
            if (num % 10 > 0) words += ' ' + units[num % 10];
        }
    }
    return words.trim();
}

const GSTBill = ({ data }) => {
    const invoiceDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Process items
    const processedItems = (data.items || []).map(item => {
        const gstRate = item.productId?.gst ?? item.gst ?? 18;
        const exclusiveRate = item.price / (1 + gstRate / 100);
        const taxableValue = exclusiveRate * item.quantity;
        const taxAmount = taxableValue * (gstRate / 100);
        const cgstTaxAmount = taxableValue * ((gstRate / 2) / 100);
        const sgstTaxAmount = taxableValue * ((gstRate / 2) / 100);

        return {
            ...item,
            gstRate,
            exclusiveRate,
            taxableValue,
            taxAmount,
            cgstTaxAmount,
            sgstTaxAmount,
            hsn: item.productId?.hsn || '85044030'
        };
    });

    // Process delivery charge
    let deliveryItem = null;
    if (data.deliveryCharge && data.deliveryCharge > 0) {
        const deliveryGstRate = 18;
        const deliveryExclusive = data.deliveryCharge / (1 + deliveryGstRate / 100);
        const deliveryTaxAmount = deliveryExclusive * (deliveryGstRate / 100);
        const deliveryCgstTaxAmount = deliveryExclusive * ((deliveryGstRate / 2) / 100);
        const deliverySgstTaxAmount = deliveryExclusive * ((deliveryGstRate / 2) / 100);
        deliveryItem = {
            name: 'Delivery Charges',
            hsn: '9967',
            quantity: 1,
            exclusiveRate: deliveryExclusive,
            taxableValue: deliveryExclusive,
            taxAmount: deliveryTaxAmount,
            gstRate: deliveryGstRate,
            cgstTaxAmount: deliveryCgstTaxAmount,
            sgstTaxAmount: deliverySgstTaxAmount
        };
    }

    // Combine items and delivery
    const allItems = [...processedItems];
    if (deliveryItem) allItems.push(deliveryItem);

    const discountApplied = data.discount || 0;

    const discountRatio = 1;
    let discountItem = null;
    // if (discountApplied && discountApplied > 0) {
    // const discountGstRate = 18;
    // const discountExclusive = discountApplied > 0 ? discountApplied / (1 + discountGstRate / 100) : 0;
    // const discountTaxAmount = discountExclusive * (discountGstRate / 100);
    // discountItem = {
    //     name: 'Discount',
    //     hsn: '',
    //     // quantity: 1,
    //     exclusiveRate: discountExclusive,
    //     taxableValue: discountExclusive,
    //     taxAmount: discountTaxAmount,
    //     gstRate: discountGstRate
    // };
    // }

    // Calculate totals
    const totalTaxableValue = allItems.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalTaxAmount = allItems.reduce((sum, item) => sum + item.taxAmount, 0);

    // const discountedTaxableValue = totalTaxableValue - (discountItem?.taxableValue || 0);
    // const discountedTaxAmount = totalTaxAmount - (discountItem?.taxAmount || 0);

    const discountedTaxableValue = totalTaxableValue;
    const discountedTaxAmount = totalTaxAmount;

    const discountExcludedTotal = discountedTaxableValue + discountedTaxAmount;
    const totalAmount = discountedTaxableValue + discountedTaxAmount - discountApplied;

    // Apply discount proportionally
    // const discountRatio = discountApplied > 0 ?
    //     Math.max(1 - (discountApplied / totalTaxableValue), 0) : 1;


    const amountInWords = numberToWords(Math.floor(totalAmount)) + ' Rupees Only';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Top title */}
                <View style={styles.topTitleRow}>
                    <Text style={styles.topTitle}>TAX INVOICE</Text>
                </View>

                {/* Header box */}
                <View style={styles.headerBox}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.sellerName}>MOBIKING WHOLESALE</Text>
                        <Text style={styles.smallText}>3rd floor B-91 opp.isckon temple east of kailash,</Text>
                        <Text style={styles.smallText}>New Delhi 110065</Text>
                        <Text style={styles.smallText}>Contact : 8587901901</Text>
                        <Text style={styles.smallText}>Email : mobiking507@gmail.com</Text>
                        <Text style={{ ...styles.smallText, marginTop: 6, fontWeight: 600 }}>GSTIN : 07BESPC8834B1ZG</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.invoiceSmallBox}>
                            <Text style={styles.invoiceLabel}>Invoice No.</Text>
                            <Text>GST-{data.orderId}</Text>
                        </View>
                        <View style={styles.invoiceSmallBox}>
                            <Text style={styles.invoiceLabel}>Date</Text>
                            <Text>{invoiceDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Bill To box */}
                <View style={styles.billBox}>
                    <View style={styles.billLeft}>
                        <Text style={styles.billHeading}>Bill To :</Text>
                        <Text style={{ fontWeight: 700 }}>{data.name}</Text>
                        <Text style={styles.smallText}>{data.address}</Text>
                        <Text style={styles.smallText}>Contact: {data.phoneNo}</Text>
                        {data?.gst && data?.gst != "0" &&
                            <Text style={styles.smallText2}>GST: {data.gst}</Text>
                        }

                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            {/* <Text style={{ fontSize: 8, width: '45%' }}>Contact: {data.phoneNo}</Text>  */}
                            {/* <Text style={{ fontSize: 8, width: '30%' }}>PoS: {data.pos || '-'}</Text>
                            <Text style={{ fontSize: 8, width: '25%' }}>GSTIN: {data.gstin || '-'}</Text> */}
                        </View>
                    </View>
                    <View style={styles.billRight}></View>
                </View>

                {/* Items table */}
                <View style={styles.table}>
                    <View style={{ ...styles.tableRow, ...styles.tableHeaderCell }}>
                        <Text style={{ ...styles.tableCell, width: '6%' }}>S.No.</Text>
                        <Text style={{ ...styles.tableCell, width: '46%', textAlign: 'left' }}>PARTICULARS</Text>
                        <Text style={{ ...styles.tableCell, width: '12%' }}>HSN/SAC</Text>
                        <Text style={{ ...styles.tableCell, width: '8%' }}>QTY</Text>
                        <Text style={{ ...styles.tableCell, width: '12%' }}>UNIT PRICE</Text>
                        <Text style={{ ...styles.tableCell, width: '8%' }}>GST</Text>
                        <Text style={{ ...styles.tableCell, width: '8%' }}>AMOUNT</Text>
                    </View>

                    {/* Items */}
                    {allItems.map((item, idx) => (
                        <View style={styles.tableRow} key={idx}>
                            <Text style={{ ...styles.tableCell, width: '6%' }}>{idx + 1}</Text>
                            <Text style={{ ...styles.tableCell, width: '46%', textAlign: 'left' }}>
                                {item.productId?.fullName || item.name}
                            </Text>
                            <Text style={{ ...styles.tableCell, width: '12%' }}>{item.hsn}</Text>
                            <Text style={{ ...styles.tableCell, width: '8%' }}>{item.quantity}</Text>
                            <Text style={{ ...styles.tableCell, width: '12%' }}>
                                {item.exclusiveRate?.toFixed(2)}
                            </Text>
                            <Text style={{ ...styles.tableCell, width: '8%' }}>{item.gstRate}%</Text>
                            <Text style={{ ...styles.tableCell, width: '8%' }}>
                                {item.taxableValue.toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    {/* Discount row if applicable */}
                    {/* {discountApplied > 0 && (
                        <View style={styles.tableRow}>
                            <Text style={{ ...styles.tableCell, width: '6%' }}></Text>
                            <Text style={{ ...styles.tableCell, width: '46%', textAlign: 'left' }}>
                                Discount
                            </Text>
                            <Text style={{ ...styles.tableCell, width: '12%' }}></Text>
                            <Text style={{ ...styles.tableCell, width: '8%' }}></Text>
                            <Text style={{ ...styles.tableCell, width: '12%' }}>{discountItem?.taxableValue?.toFixed(2)}</Text>
                            <Text style={{ ...styles.tableCell, width: '8%' }}>{discountItem?.gstRate}%</Text>
                            <Text style={{ ...styles.tableCell, width: '8%', color: 'red' }}>
                                -{discountItem?.taxableValue?.toFixed(2)}
                            </Text>
                        </View>
                    )} */}

                    {/* TOTAL row */}
                    <View style={{ ...styles.tableRow, borderBottomWidth: 1 }}>
                        <Text style={{ ...styles.tableCell, width: '6%' }}></Text>
                        <Text style={{ ...styles.tableCell, width: '46%', textAlign: 'left', fontWeight: 700 }}>TOTAL</Text>
                        <Text style={{ ...styles.tableCell, width: '12%' }}></Text>
                        <Text style={{ ...styles.tableCell, width: '8%' }}>
                            {processedItems.reduce((s, it) => s + (it.quantity || 0), 0)}
                        </Text>
                        <Text style={{ ...styles.tableCell, width: '12%' }}></Text>
                        <Text style={{ ...styles.tableCell, width: '8%' }}></Text>
                        <Text style={{ ...styles.tableCell, width: '8%', fontWeight: 700 }}>
                            {discountedTaxableValue.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Summary box */}
                <View style={styles.rightSummaryBox}>
                    <View style={styles.summaryRow}>
                        <Text>Sub Total</Text>
                        <Text>₹ {discountedTaxableValue.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>Tax Amount (+)</Text>
                        <Text>₹ {discountedTaxAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Tax breakdown table */}
                <View style={styles.taxTable}>

                    {/* <View style={{ ...styles.taxRow, backgroundColor: '#eee' }}>
                        <Text style={{ ...styles.taxCell, width: '25%', fontWeight: 700 }}>HSN/SAC</Text>
                        <Text style={{ ...styles.taxCell, width: '25%', fontWeight: 700 }}>Taxable Amount</Text>
                        <Text style={{ ...styles.taxCell, width: '15%', fontWeight: 700 }}>Rate</Text>
                        <Text style={{ ...styles.taxCell, width: '15%', fontWeight: 700 }}>Amount</Text>
                        <Text style={{ ...styles.taxCell, width: '20%', fontWeight: 700 }}>Total Tax Amount</Text>
                    </View> */}

                    {/* Tax rows */}
                    {/* {allItems.map((item, i) => {
                        const adjustedTaxableValue = item.taxableValue * discountRatio;
                        const adjustedTaxAmount = item.taxAmount * discountRatio;

                        return (
                            <View style={styles.taxRow} key={i}>
                                <Text style={{ ...styles.taxCell, width: '25%' }}>{item.hsn}</Text>
                                <Text style={{ ...styles.taxCell, width: '25%' }}>
                                    ₹ {adjustedTaxableValue.toFixed(2)}
                                </Text>
                                <Text style={{ ...styles.taxCell, width: '15%' }}>{item.gstRate}%</Text>
                                <Text style={{ ...styles.taxCell, width: '15%' }}>
                                    ₹ {adjustedTaxAmount.toFixed(2)}
                                </Text>
                                <Text style={{ ...styles.taxCell, width: '20%' }}>
                                    ₹ {adjustedTaxAmount.toFixed(2)}
                                </Text>
                            </View>
                        )
                    })} */}

                    {/* {
                        discountApplied > 0 && (
                            <View style={styles.taxRow}>
                                <Text style={{ ...styles.taxCell, width: '25%', color: 'red' }}>{"Discount"}</Text>
                                <Text style={{ ...styles.taxCell, width: '25%', color: 'red' }}>
                                    ₹ {discountItem?.taxableValue?.toFixed(2)}
                                </Text>
                                <Text style={{ ...styles.taxCell, width: '15%', color: 'red' }}>{discountItem?.gstRate}%</Text>
                                <Text style={{ ...styles.taxCell, width: '15%', color: 'red' }}>
                                    ₹ {discountItem?.taxAmount?.toFixed(2)}
                                </Text>
                                <Text style={{ ...styles.taxCell, width: '20%', color: 'red' }}>
                                    ₹ {discountItem?.taxAmount?.toFixed(2)}
                                </Text>
                            </View>
                        )
                    } */}

                    {/* Tax totals */}
                    {/* <View style={{ ...styles.taxRow, borderBottomWidth: 0 }}>
                        <Text style={{ ...styles.taxCell, width: '25%', fontWeight: 700 }}>Total</Text>
                        <Text style={{ ...styles.taxCell, width: '25%', fontWeight: 700 }}>
                            ₹ {discountedTaxableValue.toFixed(2)}
                        </Text>
                        <Text style={{ ...styles.taxCell, width: '15%' }}>-</Text>
                        <Text style={{ ...styles.taxCell, width: '15%' }}>
                            ₹ {discountedTaxAmount.toFixed(2)}
                        </Text>
                        <Text style={{ ...styles.taxCell, width: '20%', fontWeight: 700 }}>
                            ₹ {discountedTaxAmount.toFixed(2)}
                        </Text>
                    </View> */}

                    {/* TAX HEADER */}
                    <View style={{ ...styles.taxRow, backgroundColor: '#eee' }}>
                        <Text style={{ ...styles.taxCell, width: '16%', fontWeight: 700 }}>HSN/SAC</Text>
                        <Text style={{ ...styles.taxCell, width: '20%', fontWeight: 700 }}>Taxable Amount</Text>

                        <Text style={{ ...styles.taxCell, width: '10%', fontWeight: 700 }}>CGST %</Text>
                        <Text style={{ ...styles.taxCell, width: '14%', fontWeight: 700 }}>Amount</Text>

                        <Text style={{ ...styles.taxCell, width: '10%', fontWeight: 700 }}>SGST %</Text>
                        <Text style={{ ...styles.taxCell, width: '14%', fontWeight: 700 }}>Amount</Text>

                        <Text style={{ ...styles.taxCell, width: '16%', fontWeight: 700 }}>Total Tax Amount</Text>
                    </View>

                    {/* TAX ROWS */}
                    {allItems.map((item, i) => {

                        const adjustedTaxableValue = item.taxableValue * discountRatio

                        const adjustedCgst = item.cgstTaxAmount * discountRatio
                        const adjustedSgst = item.sgstTaxAmount * discountRatio

                        return (
                            <View style={styles.taxRow} key={i}>
                                <Text style={{ ...styles.taxCell, width: '16%' }}>{item.hsn}</Text>

                                <Text style={{ ...styles.taxCell, width: '20%' }}>
                                    ₹ {adjustedTaxableValue.toFixed(2)}
                                </Text>

                                <Text style={{ ...styles.taxCell, width: '10%' }}>
                                    {(item.gstRate / 2)}%
                                </Text>

                                <Text style={{ ...styles.taxCell, width: '14%' }}>
                                    ₹ {adjustedCgst.toFixed(2)}
                                </Text>

                                <Text style={{ ...styles.taxCell, width: '10%' }}>
                                    {(item.gstRate / 2)}%
                                </Text>

                                <Text style={{ ...styles.taxCell, width: '14%' }}>
                                    ₹ {adjustedSgst.toFixed(2)}
                                </Text>

                                <Text style={{ ...styles.taxCell, width: '16%' }}>
                                    ₹ {(adjustedCgst + adjustedSgst).toFixed(2)}
                                </Text>
                            </View>
                        )
                    })}

                    {/* TAX TOTALS */}
                    <View style={{ ...styles.taxRow, borderBottomWidth: 0 }}>
                        <Text style={{ ...styles.taxCell, width: '16%', fontWeight: 700 }}>Total</Text>

                        <Text style={{ ...styles.taxCell, width: '20%', fontWeight: 700 }}>
                            ₹ {discountedTaxableValue.toFixed(2)}
                        </Text>

                        <Text style={{ ...styles.taxCell, width: '10%' }}>-</Text>

                        <Text style={{ ...styles.taxCell, width: '14%' }}>
                            ₹ {(discountedTaxAmount / 2).toFixed(2)}
                        </Text>

                        <Text style={{ ...styles.taxCell, width: '10%' }}>-</Text>

                        <Text style={{ ...styles.taxCell, width: '14%' }}>
                            ₹ {(discountedTaxAmount / 2).toFixed(2)}
                        </Text>

                        <Text style={{ ...styles.taxCell, width: '16%', fontWeight: 700 }}>
                            ₹ {discountedTaxAmount.toFixed(2)}
                        </Text>
                    </View>

                </View>

                {/* Lower split */}
                <View style={styles.lowerSplit}>
                    <View style={styles.lowerLeft}>
                        <Text style={{ fontWeight: 700, marginBottom: 4 }}>Amount in Words (To be Paid) :</Text>
                        <Text style={styles.smallText}>{amountInWords}</Text>
                    </View>

                    <View style={styles.lowerRight}>
                        <View style={{ ...styles.summaryRow, fontWeight: 700 }}>
                            <Text>TOTAL AMOUNT</Text>
                            <Text>₹ {discountExcludedTotal.toFixed(2)}</Text>
                        </View>
                        <View style={{ ...styles.summaryRow, color: "red" }}>
                            <Text>Discount (-)</Text>
                            <Text>₹ {discountApplied.toFixed(2)}</Text>
                        </View>
                        <View style={{ ...styles.summaryRow, fontWeight: 700 }}>
                            <Text>AMOUNT (TO BE PAID)</Text>
                            <Text>₹ {totalAmount.toFixed(2)}</Text>
                        </View>
                        <View style={{ ...styles.summaryRow }}>
                            <Text>Amount Paid</Text>
                            <Text>₹ {data.paidAmount ? Number(data.paidAmount).toFixed(2) : '0.00'}</Text>
                        </View>
                        <View style={{ ...styles.summaryRow }}>
                            <Text>Balance</Text>
                            <Text>₹ {(totalAmount - (data.paidAmount || 0)).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom section */}
                <View style={styles.bottomSection}>
                    <View style={styles.bottomLeft}>
                        <Text style={{ fontWeight: 700, marginBottom: 6 }}>Terms / Declaration</Text>
                        <Text style={styles.smallNote}>1. Goods once sold will not be taken back or exchange</Text>
                        <Text style={styles.smallNote}>2. Mobiking will not be responsible for any warranty</Text>
                        <Text style={styles.smallNote}>3. All products are checked before dispatch; any physical damage or missing item must be reported at the time of delivery.</Text>
                        <Text style={styles.smallNote}>4. The buyer is responsible for verifying the product quantity, and condition before accepting the goods.</Text>
                        <Text style={styles.smallNote}>5. Mobiking will not be liable for any loss, damage, or delay caused during transportation by third-party courier or logistics providers.</Text>
                        <Text style={styles.smallNote}>6. Payment must be made as per agreed terms; any delay in payment may attract additional charges or cancellation of future orders.</Text>
                        <Text style={styles.smallNote}>7. All the disputes are subject to delhi jurisdiction only</Text>

                        {/* <Text style={{ marginTop: 8, fontWeight: 700 }}>Bank Details -</Text>
                        <Text style={styles.smallNote}>Bank Name : MOBIKING</Text>
                        <Text style={styles.smallNote}>Account No. : 50200048030390</Text>
                        <Text style={styles.smallNote}>Branch & IFSC : HDFC0000480</Text> */}
                    </View>

                    <View style={styles.bottomRight}>
                        <Text style={{ fontWeight: 700 }}>For, Mobiking</Text>
                        <Text style={{ marginTop: 28 }}> </Text>
                        <Text style={{ marginTop: 8, fontSize: 9 }}>Authorised Signatory</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>This is a computer generated invoice and does not require signature</Text>
            </Page>
        </Document>
    )
}

// Download button component remains the same ...

// Download button component
const GSTBillDownloadV2 = ({ billData, paymentData }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            const combinedData = paymentData ? {
                ...billData,
                paidAmount: paymentData.amount,
                orderId: `${billData.orderId}-${paymentData._id.substring(paymentData._id.length - 4).toUpperCase()}`,
                createdAt: paymentData.paidAt || paymentData.createdAt
            } : billData;

            const blob = await pdf(<GSTBill data={combinedData} />).toBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = paymentData ? `Receipt_${billData.orderId}_${paymentData._id.substring(paymentData._id.length - 4).toUpperCase()}.pdf` : `GST_${billData.orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Error generating PDF:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <MiniLoaderButton onClick={handleDownload} loading={isLoading} variant={'outline'}>
                <Download className="h-3.5 w-3.5" />
            </MiniLoaderButton>
        </div>
    )
}

export default GSTBillDownloadV2
