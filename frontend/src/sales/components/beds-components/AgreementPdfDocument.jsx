import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  text: {
    fontSize: 8,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  textSmall: {
    fontSize: 7,
    marginBottom: 2,
    lineHeight: 1.3,
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
  bulletPoint: {
    fontSize: 7,
    marginBottom: 1,
    paddingLeft: 15,
  },
  declarationText: {
    fontSize: 7,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  signatureLine: {
    width: 120,
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
  marginTop: {
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

const AgreementPdfDocument = ({ data, bedsData }) => {
  const resident = data?.resident_data || bedsData?.resident_data || {};
  const property = data || bedsData || {};

  const getMonthsBetweenDates = (date1, date2) => {
    if (!date1 || !date2) return '-';
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth()) +
      1
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date)
      .toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      .replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3');
  };

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <Image
            style={{ width: 60, height: 60 }}
            src="/static/img/stayEase_icon.webp"
          />
        </View>

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
              {resident.checkOut
                ? `${getMonthsBetweenDates(resident.checkIn, resident.checkOut)} Months`
                : '-'}
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
            <Text style={[styles.tableCell, { width: '50%' }]}>12.00 PM</Text>
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
              {resident.kycType === 'Aadhar'
                ? resident.aadharNumber
                : resident.panNumber || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={styles.text}>
          This User Subscription Agreement ("Agreement") is executed between:
        </Text>

        <Text style={styles.text}>
          ESTANZIA EASE Private Limited ("STAYEASE")., a company incorporated
          under the provisions of the Companies Act, 1956 bearing CIN
          U55200KA2024PTC185682, having its registered office at No, represented
          herein by its Community Manager AND the User (as named in Annexure A).
          The User and Stayease are together referred to as "Parties' ' and
          individually as "Party".
        </Text>

        <Text style={[styles.text, styles.bold, styles.marginTop]}>
          WHEREAS
        </Text>

        <Text style={styles.text}>
          A. Stayease is engaged in the business of providing fully furnished
          and operational hospitality services, for use for aimed accommodation
          of a 'residential' nature.
        </Text>

        <Text style={styles.text}>
          B. The User intends to use the Premises on a subscription basis from
          Stayease for residential accommodation purposes and Stayease has
          agreed to provide the same.
        </Text>

        <Text style={[styles.text, styles.bold, styles.marginTop]}>
          NOW, THIS AGREEMENT CONTAINS THE CONDITIONS OF USE GRANTED TO THE USER
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>1. TERM:</Text> As per Annexure A.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>2. PREMISES:</Text> As per Annexure A.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>3. USER CHARGES/ FEE:</Text> As per Annexure
          A. The User Charges for each month for the Premises used for
          residential accommodation shall be paid by User on or before the Due
          Date for every month in advance. Charges for any incidental or
          additional service are not a part of User Fee. The User shall be
          liable to pay such incidental or additional charges as and when they
          become due to a relevant party. The User shall not withhold payment of
          the User Fee for any reason whatsoever, including any disputes.
          Withholding payments shall be deemed to be a breach of this Agreement.
          The User Fee does not include any taxes, cesses, duties, etc., and the
          same shall be charged by Stayease, as applicable by the laws in force,
          if any.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>4. REFUNDABLE SECURITY DEPOSIT:</Text> On
          the date of execution of this Agreement, the User has agreed to
          deposit; with Stayease, in trust, a security deposit of (Thousand
          Rupees Only "Deposit"), as security for the performance of the User's
          obligations under this Agreement. Stayease may at its discretion use
          the Deposit or any part thereof to cure any breach or default by the
          User under this Agreement, or to compensate Stayease for any damage
          that occurs/is caused as a result of the User's act or omission to
          perform any of the User's obligations hereunder. Stayease's right is
          not limited to the Deposit to recoup damage costs, and the User
          remains liable for payment of the balance dues under this Agreement.
          The User shall not apply or deduct any portion of the Deposit from any
          month's User Fee, including the last month of the Term. The User shall
          not use or apply the Deposit in lieu of payment of User Fee. The
          Deposit shall not carry any interest. The Deposit will be refunded to
          the User after 45 working days from the Subscription End Date after
          deducting unpaid charges/damages, if any. The refund will be done only
          through online transfer.
        </Text>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>5. MANNER OF PAYMENT:</Text> The User Fee,
          and all other sums payable by the User to Stayease under this
          Agreement, shall be payable in Indian Rupee and shall be paid to the
          bank account of Stayease bearing bank account No. 8294210000010478,
          IFSC: DBSSOIN0294 with beneficiary name as 'ESTANZIA EASE (Stayease)
          PRIVATE LIMITED' (Online transfer only) for UPI Payments UPI ID -
          mystayease@dbs. Such payment shall be credited to the bank account of
          the Stayease on or before the fifth (5th) of every month in advance
          for the month. For Online Transfer - Credit Date on the bank a/c of
          the Stayease, will be taken as the date and the "Late Payment Fees"
          (Refer Annexure A) will be calculated proportionately. Please note
          Cash is not accepted as a manner of payment. For Cheque - The date of
          cheque deposit will be taken as the date of payment and late payment
          fees, if any will be calculated from the said date proportionately.
          The User will be informed of details via email. Without prejudice to
          Stayease's right to take legal action, the User agrees to pay a charge
          of Rs.500 (Rupees Five Hundred only)
        </Text>
        <Text style={styles.text}>
          a) for each cheque provided by the User under this Agreement that is
          bounced for lack of sufficient funds or incorrect signature.
        </Text>
        <Text style={styles.text}>
          b) for incorrect details of the cheque deposit is submitted. Stayease
          shall intimate the User on the registered email ID about the change of
          mode of payment of all such payments under this agreement acceptable
          by the Stayease.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>6. MOVE OUT AND DEDUCTIONS:</Text> At the
          Subscription End Date, a Move-out Audit would be carried out by a
          representative of Stayease after scheduling and communicating it with
          the User or on before the Subscription End Date, on the basis of which
          the damages, other property maintenance expenses is ascertained.
        </Text>
        <Text style={styles.text}>
          Please note, property maintenance is a fixed charge which includes
          activities like overhead water tank cleaning, underground sump
          cleaning, common area pest control, lift maintenance, generator
          maintenance, waste management and any other maintenance related to the
          common areas of the building. Property maintenance will also be
          applicable on change of property as well as on the completion of the
          stay period of 11 months in the same premise.
        </Text>
        <Text style={styles.text}>
          Property maintenance charge will only be applicable after the stay of
          more than one month in the same property. Further, to ensure the room
          and the property is well maintained Deep Cleaning, Fumigation and
          Painting would be carried out based on the move-out audit.
        </Text>
        <Text style={styles.text}>
          An estimate of the Maintenance Expenses is given in Annexure A, which
          will attract a 10% escalation on a yearly basis for inflation. Please
          note, that in case the actual costs are above the amounts mentioned in
          Annexure A, the higher amount would be deducted.
        </Text>
        <Text style={styles.text}>
          The User shall, on or before the Agreement Commencement Date, hand
          over possession of the Schedule Property complete with facilities /
          amenities and requirements in respect of the Schedule Property as per
          the move-in audit conducted at the time of moving in.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>7. LIMITED USE:</Text> The User agrees and
          understands that he/she is granted a limited use of the Premises for
          residential purpose only, subject to timely payment of the User Fee
          and other charges. The rights granted hereunder are not intended to be
          in the nature of a licence or leave
        </Text>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 4 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={styles.text}>
          and licence, or create any right, title, interest, or tenancy in
          property, shall be only for the purpose of personal use for
          residential use
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>8. BACKGROUND VERIFICATION:</Text> Stayease
          shall be entitled to carry out background verification on the User
          before or at any point of time Subscription Term through any agency
          and the cost for such background verification (Rs.500) shall be borne
          by the User.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>9. USER CHARGES DEFAULT:</Text> If any
          amounts due under this Agreement are not paid within the due date, the
          User agrees to pay a late fee to Stayease as mentioned in Annexure A
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>10. LOCK IN PERIOD:</Text> In the event the
          Subscription Term as mentioned in Annexure A is not more than six (6)
          months, the entire Subscription Term shall be considered as lock-in
          period. In the event the Subscription Term is greater than six (6)
          months, the first six (6) months shall be considered as lock-in
          period.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>11. TERMINATION GENERALLY:</Text> If User
          defaults in fulfilling any of the covenants of this Agreement, the
          User shall be in default or breach of this Agreement. Then, in any one
          or more of such events (or other than default as captured in Clause
          12), and upon Stayease serving a written/email seven (7) days' notice
          upon the User specifying the nature of said default and upon the
          expiration of said seven (7) days, if the User does not cure a default
          of which he has been notified, to the satisfaction of Stayease, or if
          the default cannot be completely cured or remedied in seven (7) days,
          Stayease may at Stayease's option: (i) cure such default and add the
          cost of such cure to the User's financial obligations under this
          Agreement; or (ii) declare that the User is in default and terminate
          the Agreement immediately and other consequences in the Agreement
          shall follow.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>12. SPECIFIC TERMINATION:</Text> In the
          event of default from the User on the payment of the User Charges,
          Utility charges, and other charges under this Agreement, for a period
          more than two (2) weeks, Stayease shall be entitled to terminate the
          Agreement by giving seven (7) days written notice to pay the
          outstanding dues. After expiry of the notice period of seven (7) days,
          if the User fails to rectify default in payment of outstanding dues,
          Stayease shall terminate this Agreement immediately, by deducting the
          outstanding dues and two (2) months User Charges/Fee payable.
        </Text>

        <Text style={styles.text}>
          In case, the Agreement is terminated by the User within the lock-in
          period, Stayease shall be entitled to deduct one month's User Fee
          which shall be deducted from the Deposit at the time of moving out
          ("Contract Termination Charges"). If the User terminates the Agreement
          during the lock-in period/ after the expiry of the lock-in period
          without prior intimation of one month to Stayease, the User Fee of one
          month shall be levied on the User which shall be deducted from the
          Deposit at the time of moving out.
        </Text>

        <Text style={styles.text}>
          Hereinafter referred to as "Notice Period Charges". Such intimation
          should be given through an email on hello@mystayease.com. If this
          Agreement is terminated/ expires prior to the expiry of a calendar
          month, Stayease shall charge User Fee for the remainder of the month
          and the User shall not be allowed to stay beyond the end of that
          month. In case, the User terminates this
        </Text>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 5 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={styles.text}>
          Agreement within the lock in period and without one month's notice to
          Stayease, both the Contract Termination and Notice Period Charges
          shall be levied on the User as penalty and the same shall be recovered
          from the Deposit.
        </Text>

        <Text style={styles.text}>
          The User Subscription agreement shall be terminated on the
          termination/expiry of the agreement with the property owner, with a
          prior 30 days notice. In such an event, the User shall be entitled to
          pay the User fee for the notice period. The deductions shall remain
          same as mentioned in Clause 6. In the following events, Stayease shall
          terminate the Agreement immediately with deduction of two months User
          Fee:
        </Text>

        <Text style={styles.listItem}>
          • Involved in any illegal activity within or outside the Premises
        </Text>
        <Text style={styles.listItem}>• Involved in drug abuse</Text>
        <Text style={styles.listItem}>
          • Misbehaviour with the other occupants of the Premises and Stayease
        </Text>
        <Text style={styles.listItem}>
          • Any other situation at the discretion of Stayease
        </Text>
        <Text style={styles.listItem}>
          • In the event the dues payable by the User exceeds 50% of the
          Deposit.
        </Text>

        <Text style={styles.text}>
          The User shall not be entitled to request the Stayease to adjust the
          User fee from the security deposit at any point of time during the
          License Term.
        </Text>

        <Text style={styles.text}>
          In the event the User stays in the Premises even after the expiry or
          termination of the Agreement, without prejudice to the rights of
          Stayease to take appropriate legal action against the User under this
          Agreement or under law, the User shall be liable to pay twice the
          amount of prorated User Fee per day to Stayease.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>13. PHYSICAL REMEDIES:</Text> In case of
          termination under Clauses 12, the User shall hand over the possession
          of the Premises to Stayease within two (2) days from the date of
          termination. In the event, the User fails to hand over the Premises,
          Stayease shall be entitled to take possession of the Premises upon
          completion of the said timeline.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>14. MAINTENANCE OF PREMISES:</Text> User
          shall use the Premises, common area, furniture and all other amenities
          provided in the Premises carefully and not cause any damage to the
          same.
        </Text>

        <Text style={styles.text}>
          15. In the event of a water scarcity situation arising from the
          depletion of borewells or the unavailability of water sources,
          resulting in the necessity of relying on water tankers for water
          supply, the associated charges shall be distributed equitably among
          all residents. It is hereby agreed that 50% of the charges shall be
          borne by the service provider, while the remaining 50% shall be shared
          equally among all residents residing within the premises. This
          allocation of charges aims to ensure fairness and mutual
          responsibility among all parties involved, fostering cooperation and
          solidarity during challenging circumstances
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>16. RENEWAL:</Text> This Agreement is valid
          for the duration of the Term only. If agreeable to the Parties, an
          additional agreement extending the duration of the Term, for the
          duration as may be agreed between the Parties, may be executed after
          expiry of the Term.
        </Text>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 6 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>17. NOTICES:</Text> All other notices,
          including a notice to arbitrate, may be served through an email at
          hello@mystayease.com or through a physical letter delivered by
          registered post to the registered addresses or to the Premises. For
          delivery through an email, email delivery receipt shall be considered
          as proof.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>18. ENTIRE AGREEMENT:</Text> The terms and
          provisions along with any annexures issued pursuant thereto form the
          entire and final Agreement between the Parties. No modification,
          amendment or waiver of any provisions of this Agreement will be
          effective unless made in writing with mutual consent of the Parties.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>19. SEVERABILITY:</Text> If any term of this
          Agreement is held to be illegal, invalid or unenforceable, in whole or
          in part, other than such terms, the remaining terms shall not be
          affected.
        </Text>

        <Text style={styles.text}>
          20.{' '}
          <Text style={styles.bold}>
            GOVERNING LAW, JURISDICTION & DISPUTE RESOLUTION:
          </Text>{' '}
          This Agreement shall be governed by and enforced as per the Laws in
          India and for the purpose of enforcement; the place of jurisdiction
          will be the city in which the Premises are located.
        </Text>

        <Text style={styles.text}>
          All disputes shall be submitted for arbitration by a sole arbitrator
          under the Arbitration and Conciliation Act, 1996. In the event of any
          dispute arising out of or in connection with the Agreement, the
          Parties shall, at first instance, attempt to amicably resolve the same
          through settlement discussions (recorded by way of email or telephonic
          conversations).
        </Text>

        <Text style={styles.text}>
          If Parties are unable to resolve their disputes within thirty (30)
          days of written intimation, the disputes will be referred to
          arbitration under the Arbitration and Conciliation Act, 1996 and its
          amendments from time to time. The arbitration will be conducted by a
          sole arbitrator appointed by mutual consent within 7 (seven) days of
          the receipt of the notice to arbitrate.
        </Text>

        <Text style={styles.text}>
          If Parties are unable to mutually agree, the Stayease shall have the
          right to appoint a sole arbitrator within three (3) days. The process
          of arbitration shall be decided by the arbitrator in accordance with
          the provisions of the Arbitration Act. The cost of arbitration
          (including all legal costs) will be borne by the losing Party. Till
          the continuation of the proceedings and passing of the award, all the
          Parties will bear their own share of cost and can recover the same,
          once the award is passed, from the losing Party.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>21. ASSIGNING OF RECEIVABLES:</Text>{' '}
          Stayease shall be entitled to assign any receivables under this
          Agreement to any third party without any prior notice of intimation to
          the User.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>22. STAMP DUTY:</Text> Payment of stamp duty
          or any deficiency in stamp duty on this Agreement shall be the
          responsibility of the User.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>23. CONSEQUENTIAL LOSS:</Text> Stayease
          shall not in any event be liable for special, indirect, punitive or
          consequential loss or damage of any kind whatsoever.
        </Text>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 7 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <Text style={[styles.text, styles.bold]}>
          24. Other terms and conditions:
        </Text>

        <View style={styles.borderBox}>
          <Text style={[styles.text, styles.bold]}>Late Payment Fee</Text>
          <Text style={styles.text}>
            If any amounts due under this Agreement are not paid within the due
            date, the User agrees to pay a late fee to the Stayease as mentioned
            below:
          </Text>
          <Text style={styles.listItem}>
            • SLAB-I: Between 6th to 10th day of the month - Rs 100/- per day
          </Text>
          <Text style={styles.listItem}>
            • SLAB-II: Between 11th to 20th day of the month - Rs 250/- per day
          </Text>
          <Text style={styles.listItem}>
            • SLAB-III: From the 21st day of the month onwards - Rs 500/- per
            day
          </Text>
        </View>

        <View style={styles.borderBox}>
          <Text style={[styles.text, styles.bold]}>Move-out charges</Text>
          <Text style={styles.text}>
            An estimate of the Maintenance Expenses is given below, which will
            attract a 10% escalation on a yearly basis for inflation.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, { width: '50%', fontWeight: 'bold' }]}
              >
                Room Type
              </Text>
              <Text
                style={[styles.tableCell, { width: '50%', fontWeight: 'bold' }]}
              >
                Price
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>
                Double Private Rooms
              </Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>
                Double Sharing Rooms
              </Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>
                Single Private Rooms
              </Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>1 BHK</Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>2 BHK</Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>3 BHK</Text>
              <Text style={[styles.tableCell, { width: '50%' }]}>-</Text>
            </View>
          </View>
          <Text style={styles.text}>
            Please note, that in case the actual costs are above the amounts
            mentioned, the higher amount would be deducted
          </Text>
        </View>

        <View style={styles.borderBox}>
          <Text style={[styles.text, styles.bold]}>
            Incidental Charges borne by Stayease
          </Text>
          <Text style={styles.listItem}>
            • The above comprises electricity with power back-up including
            proportionate common area charges. Utility charges for the room are
            calculated as per the bills generated by the state utility board(s)
            for the building. The unit rates for the said bills shall be at the
            discretion of the corresponding state utility board(s).
          </Text>
          <Text style={styles.listItem}>
            • Internet Services will be provided except for temporary downtimes
            incurred due to third parties & technical difficulties. The scope of
            Internet services are:
          </Text>
          <Text style={styles.bulletPoint}>- The Speed up to 10Mbps/user</Text>
          <Text style={styles.bulletPoint}>
            - No. of Devices supported is 3 per user
          </Text>
          <Text style={styles.bulletPoint}>
            - FUP will be 100GB/Month per user
          </Text>
          <Text style={styles.listItem}>
            • The User Subscription agreement will be sent for E-signature on
            the registered email. The agreement will expire after 72 hours or on
            contract start date whichever is earlier. In case of contract
            extensions, property shifts and room shifts, if the contract request
            date is less than a month from contract start date, the agreement
            will expire after 24 hours. If an agreement is expired, Rs. 100
            inclusive of GST will be applicable as an Agreement charge for every
            resend.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 8 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <View style={styles.borderBox}>
          <Text style={[styles.text, styles.bold]}>House Rules</Text>
          <Text style={styles.listItem}>
            1. Premises can be used only for dwelling purpose.
          </Text>
          <Text style={styles.listItem}>
            2. No damage to the Building or any part of it (including the
            Premises).
          </Text>
          <Text style={styles.listItem}>
            3. No rubbish or waste should be stored or burnt/destroyed in any
            part of the Building.
          </Text>
          <Text style={styles.listItem}>
            4. Not to litter or cause any kind of annoyance to the
            neighbourhood.
          </Text>
          <Text style={styles.listItem}>
            5. Noise - Keep the noise level within the tolerance of others in
            the Premises and reduce if requested to do so. No noise shall be
            caused between 10PM and 6AM which would affect the sleeping by any
            third parties in the Premises/building or nearby building.
          </Text>
          <Text style={styles.listItem}>6. Avoid the following:</Text>
          <Text style={styles.bulletPoint}>- Abusive or foul language</Text>
          <Text style={styles.bulletPoint}>
            - Harassment in any form to anybody present within the Premises
          </Text>
          <Text style={styles.bulletPoint}>
            - Fight/quarrel with the other occupants of the building/instigating
            the other occupants to fight
          </Text>
          <Text style={styles.bulletPoint}>
            - Smoking & use of alcohol except in designated areas.
          </Text>
          <Text style={styles.bulletPoint}>
            - Drugs, Explosives & weapons in the whole Premises
          </Text>
          <Text style={styles.bulletPoint}>
            - Conducting/carry out any kind of business.
          </Text>
          <Text style={styles.bulletPoint}>
            - Alterations to the Premises, any electrical or furnishings of the
            Premises.
          </Text>
          <Text style={styles.listItem}>
            7. The User shall not cause any damage to the Premises or Building.
            In case of any such damages caused by the User to the Premises or
            Building, the User shall be liable to pay the cost of
            repairs/replacement due to such damage. If the User fails to pay the
            cost, Stayease shall deduct such cost from the Deposit and claim for
            the balance cost of the repairs from the User. Stayease shall carry
            out the repairs of the below items and shall be entitled for
            reimbursement of the repairs/replacement cost from the User in the
            Premises/Building, for the items including but not limited to the
            following:
          </Text>
          <Text style={styles.bulletPoint}>
            - Any damages/failure to the electrical items;
          </Text>
          <Text style={styles.bulletPoint}>
            - Physical damages to the electronics items;
          </Text>
          <Text style={styles.bulletPoint}>
            - Physical damages caused to any of the furniture or furnishings;
          </Text>
          <Text style={styles.bulletPoint}>- Damages to bath fittings;</Text>
          <Text style={styles.bulletPoint}>
            - Damages to any of the kitchen appliances;
          </Text>
          <Text style={styles.bulletPoint}>
            - Repairs/Replacement of any part for any of the above-mentioned
            appliances;
          </Text>
          <Text style={styles.bulletPoint}>
            - Damages to any of the Items (Sports/Gym Equipment, Games,
            Electronics;
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 9 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <View style={styles.borderBox}>
          <Text style={styles.listItem}>
            8. Cleanliness: Kindly keep the Premises clean and tidy and ensure
            your belongings are kept within your designated area. Keep the
            common area clean after you for others to enjoy the common
            facilities of the Premises.
          </Text>
          <Text style={styles.listItem}>
            9. Housekeeping: Housekeeping would be provided to the Sub-Lessee by
            the Sub-lessor. Further on request from the User, Stayease may
            provide a Housekeeping facility subject to availability. The User
            shall pay an amount of Rs. 250/- per request. The Housekeeping
            services will be provided on Monday to Saturday (a week) except on
            public holidays. The scope of Housekeeping shall be as follows:
          </Text>
          <Text style={styles.bulletPoint}>- Dishwashing (6 days a week)</Text>
          <Text style={styles.bulletPoint}>
            - Cleaning the bathroom (3 times a week)
          </Text>
          <Text style={styles.bulletPoint}>
            - Sweeping and mopping the floor in the hall,
          </Text>
          <Text style={styles.bulletPoint}>
            - Bedroom, kitchenette and balconies (6 days a week)
          </Text>
          <Text style={styles.bulletPoint}>
            - Clearing the trash (6 days a week)
          </Text>
          <Text style={styles.bulletPoint}>
            - Windows and Window panes (twice a month)
          </Text>
          <Text style={styles.bulletPoint}>
            - Dusting the furniture (3 times a week)
          </Text>
          <Text style={styles.bulletPoint}>
            - Cleaning the fridge (on request)
          </Text>
          <Text style={styles.text}>
            It is clarified that Pet's cleanliness is not part of the House
            Keeping. Further on any additional request from the User, Stayease
            may provide Housekeeping facility subject to availability. The User
            shall pay an amount of Rs. 250/- per request.
          </Text>
          <Text style={styles.listItem}>
            10. Pet Policy: If the User occupies the whole Premises, the User
            shall be entitled to keep pets in the Premises (not applicable if
            the Premises is shared with other occupants).
          </Text>
          <Text style={styles.text}>
            The User shall keep the pets in the Premises under the condition
            that the pets shall not be allowed in the common areas of the
            Building or other premises of the Building and no littering on the
            common areas of the Building, hallways, corridors or any other
            premises in the Building.
          </Text>
          <Text style={styles.text}>
            In the event of breach of any of the condition of Pet Policy, the
            User shall pay an amount of Rs.1,000/- as penalty per breach and if
            the User continues to breach the Pet Policy for more than three (3)
            times, Stayease shall be entitled to terminate the Agreement by
            giving 7 (seven) days prior written notice.
          </Text>
          <Text style={styles.text}>
            The User shall be responsible for all the acts of the pets and the
            User shall indemnify Stayease for any loss or damage that may occur
            due to the act of the Pets.
          </Text>
          <Text style={styles.text}>
            In the event, the User wishes to have his/her pet/s in the Premises,
            the User shall ensure to provide a copy of the pet's medical
            records.
          </Text>
          <Text style={styles.text}>
            Cleaning of the pet inside or outside the Premises is the
            responsibility of the User provided the same shall not cause any
            disturbance to any other occupants.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 10 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <View style={styles.borderBox}>
          <Text style={styles.listItem}>
            11. All gatherings, parties or discussions shall be held in the
            common area with prior permission from the manager.
          </Text>
          <Text style={styles.listItem}>
            12. DTH service is in compliance with TRAI regulations and all
            channels which are included in the Network Capacity Fee shall be
            provided.
          </Text>
          <Text style={styles.listItem}>
            13. Pest control services will be conducted once every three months
            of the stay and the amount charged for the same is Rs. 300 per room
            inclusive of GST
          </Text>
          <Text style={styles.listItem}>
            14. The User shall raise any concerns/issues/complaints pertaining
            to the scheduled property on the mobile application of the User. If
            the same is not addressed within a reasonable time, the same shall
            be escalated to the community manager.
          </Text>
          <Text style={styles.listItem}>
            15. In the event of a water scarcity situation arising from the
            depletion of borewells or the unavailability of water sources,
            resulting in the necessity of relying on water tankers for water
            supply, the associated charges shall be distributed equitably among
            all residents. It is hereby agreed that 50% of the charges shall be
            borne by the service provider, while the remaining 50% shall be
            shared equally among all residents residing within the premises.
            This allocation of charges aims to ensure fairness and mutual
            responsibility among all parties involved, fostering cooperation and
            solidarity during challenging circumstances
          </Text>
          <Text style={styles.listItem}>
            16. If Users who are of opposite genders and not married stay in the
            Premises the same shall be at User's own risk and the Users shall
            indemnify Stayease for all the consequences including but not
            limited to any action taken by any third party. In this regard, it
            is specifically agreed by the User that in the event any action is
            taken by the local authorities/police against the User or the
            co-occupants, the User shall be solely liable for the same to the
            total exclusion of Stayease
          </Text>
          <Text style={styles.listItem}>
            17. <Text style={styles.bold}>Shared Room Belongings Policy:</Text>{' '}
            Personal Belongings Placement: In shared rooms, users must keep
            their personal belongings in the dedicated space provided by the
            management. If belongings are misplaced or missing, the management
            will not be held responsible.
          </Text>
          <Text style={styles.listItem}>
            18. <Text style={styles.bold}>Belongings in Common Areas:</Text>{' '}
            Users are permitted to leave their belongings in the common areas,
            but they do so at their own risk. The management will not be
            responsible for any loss or damage to items left in these areas.
          </Text>
          <Text style={styles.listItem}>
            19. <Text style={styles.bold}>Room Cleaning Procedure:</Text>{' '}
            Presence of Users: Room cleaning will be conducted in the presence
            of the users to ensure transparency and security of personal
            belongings.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 11 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <View style={styles.borderBox}>
          <Text style={styles.listItem}>
            20. <Text style={styles.bold}>Cleaning Timing:</Text> Cleaning
            sessions will be scheduled during the following times:
          </Text>
          <Text style={styles.text}>9:00 am to 6 PM MON - SAT</Text>
          <Text style={styles.text}>
            Users are expected to make necessary arrangements to accommodate
            these timings. The management will not be responsible for any
            inconvenience caused during these sessions.
          </Text>

          <Text style={styles.listItem}>
            21. <Text style={styles.bold}>Room Upgradation Policy</Text>
          </Text>
          <Text style={styles.text}>
            Advance Notification: Users interested in upgrading to a larger room
            must notify the management in advance. This advance notice is
            necessary to arrange the room and ensure its availability.
          </Text>
          <Text style={styles.text}>
            Calculation of Rent: The higher rent for the upgraded room will be
            initiated and calculated from the day the user moves into the
            upgraded room.
          </Text>
          <Text style={styles.text}>
            Upfront Payment: An upgraded deposit, along with the revised prepaid
            rent, will be required to be paid upfront before moving into the
            upgraded room.
          </Text>
          <Text style={styles.text}>
            Subject to Availability: Upgradation to a bigger room is subject to
            availability. In the event that a larger room is not available at
            the desired time, the resident may need to wait until one becomes
            available.
          </Text>

          <Text style={styles.listItem}>
            22. <Text style={styles.bold}>Timing of Requests:</Text> Upgradation
            or downgradiation requests must be made at the beginning of the
            month and cannot be facilitated in the middle of the month.
          </Text>

          <Text style={styles.listItem}>
            23. <Text style={styles.bold}>Notice Period Policy:</Text>
          </Text>
          <Text style={styles.text}>
            Timing of Notice Period: Users are required to serve their notice
            period at the beginning of the month. Notice served in the middle of
            the month will not be accepted.
          </Text>
          <Text style={styles.text}>
            Penalty for Mid-Month Notice: If a user requests to serve the notice
            period in the middle of the month, they will be required to pay the
            differential amount for the remaining days of the month.
          </Text>
          <Text style={styles.text}>
            Advance Notice Requirement: Users must provide advance notice as per
            the terms of the rental agreement before moving out. Failure to do
            so may result in penalties or forfeiture of deposit.
          </Text>

          <Text style={styles.text}>
            Compliance with Terms: It is the responsibility of the user to
            comply with the notice period terms outlined in the rental
            agreement. Any deviations may result in financial consequences.
          </Text>
          <Text style={styles.text}>
            Please ensure to adhere to the notice period policy to facilitate a
            smooth transition and avoid any unnecessary financial liabilities.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 12 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>USER SUBSCRIPTION AGREEMENT</Text>

        <View style={styles.borderBox}>
          <Text style={styles.listItem}>
            24. <Text style={styles.bold}>Guests Policy:</Text>
          </Text>
          <Text style={styles.text}>
            The User may accommodate guests for a maximum of 2 days in a month
            at no additional charge. If the guest stay exceeds 2 days in a
            month, an amount of Rs. 500 (Rupees Five Hundred Only) per day per
            guest shall be charged as a Guest Fee, irrespective of whether such
            guest accommodation is continuous or at intervals in a month.
          </Text>
          <Text style={styles.text}>
            Guest accommodation is permitted only for users staying in Double
            Private rooms. For Single Sharing and Double Sharing rooms, guest
            accommodation is strictly not permitted under any circumstances.
          </Text>
          <Text style={styles.text}>
            The number of guests allowed to stay in the Premises is limited to 2
            persons per day. Such admission of the guest(s) shall be subject to
            permission from other occupants of the same Premises in which the
            User is staying.
          </Text>
          <Text style={styles.text}>
            Further, the admission of guest/s by Stayease is subject to
            availability of rooms. The Guest Fee and other conditions mentioned
            above shall be applicable for a single occupant who is sharing the
            room/taking a portion of the room.
          </Text>
          <Text style={styles.text}>
            The User shall ensure that the guests of such User do not disturb
            other residents of the accommodation at any time of their visit/stay
            and are polite and courteous in their behaviour to the residents.
          </Text>
          <Text style={styles.text}>
            The Guest Fee is only for accommodation of the guests and excludes
            meals and beverages provided at Stayease which shall be payable on
            actual consumption basis. It shall be the responsibility of the User
            to keep the management informed about any guests who are staying at
            Stayease.
          </Text>
          <Text style={styles.text}>
            An additional charge of Rs. 2000 (Rupees Two Thousand Only) per
            night per guest shall be levied on the User for admitting a guest
            without receiving prior approval from the management. If the User
            invites guest/s to the Premises, the User shall indemnify Stayease
            for any of the consequences of such stay in the Premises.
          </Text>
          <Text style={styles.text}>
            Day visits are restricted only till 8 PM for all guests. Overnight
            stay must be informed to the manager by 8 PM via email to
            hello@mystayease.com.
          </Text>
          <Text style={styles.text}>
            The User is fully responsible for the actions of their guests. The
            guest should not disturb other residents during their stay in the
            premises.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>For User</Text>
          <Text>For Stayease</Text>
        </View>
      </Page>

      {/* PAGE 13 - Declaration */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>DECLARATION</Text>

        <Text style={[styles.declarationText, styles.marginTop]}>
          We, the undersigned, hereby acknowledge that we have carefully read
          and understood all the terms and conditions outlined in the rental
          agreement provided by ESTANZIA EASE Private Limited (StayEase)
        </Text>

        <Text style={styles.declarationText}>
          As the resident, I agree to abide by these terms throughout the
          duration of my tenancy. I understand that failure to comply with these
          terms may result in penalties or forfeiture of deposit. By signing
          below, I confirm my acceptance of the terms and conditions and agree
          to adhere to them accordingly.
        </Text>

        <Text style={styles.declarationText}>
          As the service provider, we "Stayease", confirm that we have provided
          the resident, [resident's Full Name], with a copy of the rental
          agreement containing all terms and conditions applicable to their
          tenancy. We declare that we have explained the terms to the resident
          to the best of our ability and ensured that they understand their
          obligations as outlined in the agreement. By signing below, we affirm
          our commitment to uphold the terms of the rental agreement and provide
          the necessary support to the resident throughout their tenancy period.
        </Text>

        <Text style={[styles.text, styles.bold, { marginTop: 12 }]}>
          Signatures:
        </Text>

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
