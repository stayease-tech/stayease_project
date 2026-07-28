import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#D4A017',
  },
  text: {
    fontSize: 12,
    marginTop: 10,
  },
});

const AgreementPdfDocument = () => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AGREEMENT</Text>
        <Text style={styles.text}>This is a test PDF document.</Text>
      </Page>
    </Document>
  );
};

export default AgreementPdfDocument;
