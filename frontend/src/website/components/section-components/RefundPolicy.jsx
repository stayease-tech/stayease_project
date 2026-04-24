import { useEffect } from 'react'

const RefundPolicy = () => {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <div className="bg-[#1a1a2e] text-gray-300 min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-3xl md:text-4xl font-bold text-[#eba312] mb-2">
                    Refund & Cancellation Policy
                </h1>
                <p className="text-sm text-gray-400 mb-10">
                    Last updated: April 2026 | Estanzia Ease Private Limited
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">1. Booking Amount</h2>
                    <p>
                        The booking/token amount paid at the time of reservation is <strong className="text-white">non-refundable</strong>.
                        This amount is applied towards your security deposit upon check-in.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">2. Security Deposit Refund</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            The security deposit will be refunded within <strong className="text-white">30 bank working days</strong> from
                            the date of move-out, after deducting any unpaid rent, utility charges, property management fees,
                            and damage costs identified during the move-out audit.
                        </li>
                        <li>
                            Refunds are processed exclusively via <strong className="text-white">online bank transfer</strong> to
                            the registered bank account or through payout links generated via our payment gateway partner.
                        </li>
                        <li>
                            No refunds will be issued in cash or to third-party accounts.
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">3. Rent Payments</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            Monthly rent is due by the <strong className="text-white">5th of each month</strong>. Late payments
                            attract delay charges as per the subscription agreement.
                        </li>
                        <li>
                            Rent payments made via the payment gateway are non-refundable once successfully processed,
                            unless there is a verified duplicate or erroneous transaction.
                        </li>
                        <li>
                            In case of a duplicate payment, please contact our support team within 48 hours.
                            Verified duplicate payments will be refunded to the <strong className="text-white">original payment method</strong> within
                            5-7 business days.
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">4. Auto-Pay (Recurring Payments)</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            Residents may set up automatic monthly rent payments (standing instructions) through our
                            payment gateway. A pre-debit notification will be sent at least <strong className="text-white">24 hours before</strong> each
                            scheduled deduction, as mandated by the Reserve Bank of India.
                        </li>
                        <li>
                            Auto-pay mandates can be <strong className="text-white">cancelled at any time</strong> by the resident
                            through the resident portal. Cancellation takes effect before the next billing cycle.
                        </li>
                        <li>
                            If a recurring charge is disputed, the resident must raise the issue within 48 hours of
                            the deduction. Verified erroneous debits will be refunded within 5-7 business days.
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">5. Early Termination</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong className="text-white">During lock-in period:</strong> One month's rent will be deducted
                            from the security deposit as contract breakage charges.
                        </li>
                        <li>
                            <strong className="text-white">After lock-in without 30-day notice:</strong> One month's rent will
                            be deducted as notice period charges.
                        </li>
                        <li>
                            If the move-out date falls after the 3rd of the month, the full month's rent is payable.
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">6. Failed Transactions</h2>
                    <p>
                        If a payment fails but the amount is debited from your account, the refund will be automatically
                        initiated by the payment gateway. Typically, such refunds reflect within <strong className="text-white">5-7 business days</strong>.
                        If the refund is not received within this period, please contact our support team with the
                        transaction ID.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">7. Grievance Officer</h2>
                    <div className="bg-[#16213e] rounded-xl p-5 border border-gray-700">
                        <p className="mb-2">
                            For any payment-related disputes or refund queries, please contact our Grievance Officer:
                        </p>
                        <ul className="space-y-1">
                            <li><strong className="text-white">Email:</strong> hello@mystayease.com</li>
                            <li><strong className="text-white">Phone:</strong> +91 91 6464 8787</li>
                            <li>
                                <strong className="text-white">Address:</strong> No. 216, 215, 3rd Cross, Off Neeladri Road,
                                Electronic City Phase 1, Bengaluru 560100
                            </li>
                        </ul>
                        <p className="mt-3 text-sm text-gray-400">
                            We aim to acknowledge all complaints within 24 hours and resolve them within 7 working days.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">8. Governing Law</h2>
                    <p>
                        This policy is governed by the laws of India and is subject to the jurisdiction of courts
                        in Bengaluru, Karnataka. All payment processing complies with the Reserve Bank of India's
                        Master Direction on Payment Aggregators and PCI DSS v4.0.1 standards.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default RefundPolicy
