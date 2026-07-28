import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#D4A017',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    text: {
        fontSize: 8,
        marginBottom: 3,
    },
    textSmall: {
        fontSize: 7,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    label: {
        width: '35%',
        fontWeight: 'bold',
        fontSize: 8,
    },
    value: {
        width: '65%',
        fontSize: 8,
    },
    table: {
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    tableCell: {
        padding: 3,
        fontSize: 7,
        borderRightWidth: 1,
        borderRightColor: '#000000',
        flex: 1,
        textAlign: 'center',
    },
    tableCellLeft: {
        padding: 3,
        fontSize: 7,
        borderRightWidth: 1,
        borderRightColor: '#000000',
        flex: 1,
        textAlign: 'left',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        fontSize: 8,
    },
    annexureTitle: {
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 6,
        fontWeight: 'bold',
    },
    listItem: {
        fontSize: 7,
        marginBottom: 1,
        paddingLeft: 8,
    },
    declarationText: {
        fontSize: 7,
        marginBottom: 3,
    },
    signatureLine: {
        width: 150,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 3,
        marginTop: 5,
    },
    signatureSection: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureText: {
        fontSize: 7,
        marginTop: 3,
        fontWeight: 'bold',
    },
    borderBox: {
        borderWidth: 1,
        borderColor: '#000000',
        padding: 4,
        marginVertical: 3,
    },
    bulletPoint: {
        fontSize: 7,
        marginBottom: 1,
        paddingLeft: 12,
    },
    marginTop: {
        marginTop: 4,
    },
});

const AgreementPdfDocument = ({ data, bedsData }) => {
    const resident = data?.resident_data || bedsData?.resident_data || {};
    const property = data || bedsData || {};

    const monthDiff = (date1, date2) => {
        if (!date1 || !date2) return '-';
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + 1;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3');
    };

    return (
        <Document>
            {/* Page 1 */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>AGREEMENT</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Community Manager</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.propertyManager || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Room No.</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {property.roomNo || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Type of Accommodation</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {`${property.roomType || ''} Room`}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Monthly User Fee</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            ₹{resident.rentPerMonth || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Duration of Stay</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.checkOut ? `${monthDiff(resident.checkIn, resident.checkOut)} Months` : '-'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Agreement Start Date</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {formatDate(resident.checkIn)}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Agreement End Date</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {formatDate(resident.checkOut)}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Move Out Time</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            12.00 PM
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Security Deposit</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            ₹{resident.totalDepositPaid || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>User Fee Due Date</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            1st of every month
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Property Address</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%', fontSize: 6 }]}>
                            {`${property.propertyName || ''} - ${property.doorBuilding || ''}, ${property.streetAddress || ''}, ${property.area || ''}, ${property.city || ''}, ${property.state || ''} - ${property.pincode || ''}`}
                        </Text>
                    </View>
                </View>

                <Text style={styles.annexureTitle}>ANNEXURE A</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Name of User</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.residentsName || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Permanent Address</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.permanentAddress || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Phone Number</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.phoneNumber || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Email</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.email || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Resident Identity Type</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {`${resident.kycType || ''} Card`}
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCellLeft, { width: '50%' }]}>
                            <Text style={styles.bold}>Resident Identity Number</Text>
                        </Text>
                        <Text style={[styles.tableCell, { width: '50%' }]}>
                            {resident.kycType === 'Aadhar' ? resident.aadharNumber : resident.panNumber || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>For User</Text>
                    <Text>For Stayease</Text>
                </View>
            </Page>

            {/* Page 2 - Agreement Text */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>USER SUBSCRIPTION AGREEMENT</Text>

                <Text style={styles.text}>
                    This User Subscription Agreement ("Agreement") is executed between:
                </Text>

                <Text style={styles.text}>
                    ESTANZIA EASE Private Limited ("STAYEASE"), a company incorporated under the provisions of the Companies Act, 1956 bearing CIN U55200KA2024PTC185682, having its registered office at No, represented herein by its Community Manager AND the User (as named in Annexure A).
                </Text>

                <Text style={[styles.text, styles.bold, styles.marginTop]}>WHEREAS</Text>

                <Text style={styles.text}>
                    A. Stayease is engaged in the business of providing fully furnished and operational hospitality services.
                </Text>

                <Text style={styles.text}>
                    B. The User intends to use the Premises on a subscription basis from Stayease for residential accommodation purposes.
                </Text>

                <Text style={[styles.text, styles.bold, styles.marginTop]}>NOW, THIS AGREEMENT CONTAINS THE CONDITIONS OF USE GRANTED TO THE USER</Text>

                <Text style={styles.text}><Text style={styles.bold}>1. TERM:</Text> As per Annexure A.</Text>
                <Text style={styles.text}><Text style={styles.bold}>2. PREMISES:</Text> As per Annexure A.</Text>
                <Text style={styles.text}>
                    <Text style={styles.bold}>3. USER CHARGES/ FEE:</Text> As per Annexure A. The User Charges for each month shall be paid by User on or before the Due Date in advance.
                </Text>
                <Text style={styles.text}>
                    <Text style={styles.bold}>4. REFUNDABLE SECURITY DEPOSIT:</Text> The User has agreed to deposit a security deposit as security for the performance of the User's obligations.
                </Text>

                <View style={styles.footer}>
                    <Text>For User</Text>
                    <Text>For Stayease</Text>
                </View>
            </Page>

            {/* Add more pages with simplified content */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>USER SUBSCRIPTION AGREEMENT</Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>5. MANNER OF PAYMENT:</Text> The User Fee shall be payable in Indian Rupee to the bank account of Stayease.
                </Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>6. MOVE OUT AND DEDUCTIONS:</Text> A Move-out Audit would be carried out at the Subscription End Date.
                </Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>7. LIMITED USE:</Text> The User is granted a limited use of the Premises for residential purpose only.
                </Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>8. BACKGROUND VERIFICATION:</Text> Stayease may carry out background verification on the User.
                </Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>9. USER CHARGES DEFAULT:</Text> If any amounts are not paid within the due date, a late fee shall apply.
                </Text>

                <Text style={styles.text}>
                    <Text style={styles.bold}>10. LOCK IN PERIOD:</Text> The first six months shall be considered as lock-in period.
                </Text>

                <View style={styles.footer}>
                    <Text>For User</Text>
                    <Text>For Stayease</Text>
                </View>
            </Page>

            {/* Declaration Page */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>DECLARATION</Text>

                <Text style={styles.declarationText}>
                    We, the undersigned, hereby acknowledge that we have carefully read and understood all the terms and conditions outlined in the rental agreement.
                </Text>

                <Text style={styles.declarationText}>
                    As the resident, I agree to abide by these terms throughout the duration of my tenancy.
                </Text>

                <Text style={styles.declarationText}>
                    As the service provider, we "Stayease", confirm that we have provided the resident with a copy of the rental agreement.
                </Text>

                <Text style={[styles.text, styles.bold, { marginTop: 12 }]}>Signatures:</Text>

                <View style={styles.signatureSection}>
                    <View>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>For User</Text>
                    </View>
                    <View>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>For Stayease</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>For User</Text>
                    <Text>For Stayease</Text>
                </View>
            </Page>
        </Document>
    );
};

export default AgreementPdfDocument;