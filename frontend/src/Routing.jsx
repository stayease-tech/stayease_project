// Copyright Aravind Adari
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import PublicLayout from './shared/PublicLayout';
import Dashboard from './shared/Dashboard';
import { SidebarProvider } from './shared/SidebarContext';

/**
 * Loading — full-screen spinner shown while lazy-loaded chunks are fetching.
 *
 * @returns {React.ReactElement}
 */
// === Loading spinner ===
const Loading = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="spinner"></div>
  </div>
);

// === WEBSITE (public) - lazy loaded ===
const WebHome = lazy(() => import('./website/components/pages/Home'));
const WebMainAbout = lazy(() => import('./website/components/pages/MainAbout'));
const WebProperties = lazy(
  () => import('./website/components/pages/Properties')
);
const WebBlog = lazy(() => import('./website/components/pages/Blog'));
const WebContact = lazy(() => import('./website/components/pages/Contact'));
const WebResidentLogin = lazy(
  () => import('./website/components/pages/ResidentLogin')
);
const WebPrivacyPolicy = lazy(
  () => import('./website/components/pages/PrivacyPolicyPage')
);
const WebTermsConditions = lazy(
  () => import('./website/components/pages/TermsConditionsPage')
);
const WebRefundPolicy = lazy(
  () => import('./website/components/pages/RefundPolicyPage')
);
const WebNotFound = lazy(() => import('./website/components/pages/NotFound'));
const Blog1 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog1')
);
const Blog2 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog2')
);
const Blog3 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog3')
);
const Blog4 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog4')
);
const Blog5 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog5')
);
const Blog6 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog6')
);
const Blog7 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog7')
);
const Blog8 = lazy(
  () => import('./website/components/blog-components/blog-pages/Blog8')
);
const WebPropertyDetails = lazy(
  () => import('./website/components/property-components/PropertyDetails')
);

// === ACCOUNTS - lazy loaded ===
const AccActivityStats = lazy(
  () => import('./accounts/components/activity-components/ActivityStats')
);
const AccLoginData = lazy(
  () => import('./accounts/components/activity-components/LoginData')
);
const AccVendorForm = lazy(
  () => import('./accounts/components/vendor-components/VendorForm')
);
const AccVendorTable = lazy(
  () => import('./accounts/components/vendor-components/VendorTable')
);
const AccVendorData = lazy(
  () => import('./accounts/components/vendor-components/VendorData')
);
const AccExpenseForm = lazy(
  () => import('./accounts/components/expense-components/ExpenseForm')
);
const AccExpenseTable = lazy(
  () => import('./accounts/components/expense-components/ExpenseTable')
);
const AccCategoryData = lazy(
  () => import('./accounts/components/expense-components/CategoryData')
);
const AccRawdataFileUpload = lazy(
  () => import('./accounts/components/rawdata-components/RawdataFileUpload')
);
const AccRawdataFileTable = lazy(
  () => import('./accounts/components/rawdata-components/RawdataFileTable')
);
const AccRawdataTable = lazy(
  () => import('./accounts/components/rawdata-components/RawdataTable')
);
const AccRawdataForm = lazy(
  () => import('./accounts/components/rawdata-components/RawdataForm')
);
const AccRawdataDetails = lazy(
  () => import('./accounts/components/rawdata-components/RawdataDetails')
);
const AccLiabilityTable = lazy(
  () => import('./accounts/components/liability_components/LiabilityTable')
);
const AccLiabilityForm = lazy(
  () => import('./accounts/components/liability_components/LiabilityForm')
);
const AccLiabilityData = lazy(
  () => import('./accounts/components/liability_components/LiabilityData')
);
const AccOtherFilesForm = lazy(
  () => import('./accounts/components/other-files-components/OtherFilesForm')
);
const AccOtherFilesTable = lazy(
  () => import('./accounts/components/other-files-components/OtherFilesTable')
);
const AccBedsTable = lazy(
  () => import('./accounts/components/beds_components/BedsTable')
);
const AccBedsDetails = lazy(
  () => import('./accounts/components/beds_components/BedsDetails')
);
const AccAgreementPdf = lazy(
  () => import('./accounts/components/beds_components/AgreementPdf')
);
const AccEmployeeForm = lazy(
  () => import('./accounts/components/employee-components/EmployeeForm')
);

// === OPERATIONS - lazy loaded ===
const OpsActivityStats = lazy(
  () => import('./operations/components/activity-components/ActivityStats')
);
const OpsLoginData = lazy(
  () => import('./operations/components/activity-components/LoginData')
);
const OpsBedsTable = lazy(
  () => import('./operations/components/beds-components/BedsTable')
);
const OpsAgreementPdf = lazy(
  () => import('./operations/components/beds-components/AgreementPdf')
);
const OpsChecklistFeedbackTable = lazy(
  () =>
    import(
      './operations/components/checklist-feedback-components/ChecklistFeedbackTable'
    )
);
const OpsMoveInChecklistForm = lazy(
  () =>
    import(
      './operations/components/movein-checklist-components/MoveInChecklistForm'
    )
);
const OpsMoveInChecklistData = lazy(
  () =>
    import(
      './operations/components/movein-checklist-components/MoveInChecklistData'
    )
);
const OpsMoveInFeedbackForm = lazy(
  () =>
    import(
      './operations/components/movein-feedback-components/MoveInFeedbackForm'
    )
);
const OpsMoveInFeedbackData = lazy(
  () =>
    import(
      './operations/components/movein-feedback-components/MoveInFeedbackData'
    )
);
const OpsMoveOutChecklistForm = lazy(
  () =>
    import(
      './operations/components/moveout-checklist-components/MoveOutChecklistForm'
    )
);
const OpsMoveOutChecklistData = lazy(
  () =>
    import(
      './operations/components/moveout-checklist-components/MoveOutChecklistData'
    )
);
const OpsMoveOutFeedbackForm = lazy(
  () =>
    import(
      './operations/components/moveout-feedback-components/MoveOutFeedbackForm'
    )
);
const OpsMoveOutFeedbackData = lazy(
  () =>
    import(
      './operations/components/moveout-feedback-components/MoveOutFeedbackData'
    )
);
const OpsCommonPropertyComplaintForm = lazy(
  () =>
    import(
      './operations/components/property-complaint-service-request-components/CommonPropertyComplaintForm'
    )
);
const OpsPropertyComplaintForm = lazy(
  () =>
    import(
      './operations/components/property-complaint-service-request-components/PropertyComplaintForm'
    )
);
const OpsPropertyComplaintTable = lazy(
  () =>
    import(
      './operations/components/property-complaint-service-request-components/PropertyComplaintTable'
    )
);
const OpsPropertyComplaintData = lazy(
  () =>
    import(
      './operations/components/property-complaint-service-request-components/PropertyComplaintData'
    )
);
const OpsFeedbackForm = lazy(
  () =>
    import(
      './operations/components/property-complaint-service-request-components/FeedbackForm'
    )
);
const OpsExpenseForm = lazy(
  () => import('./operations/components/expense-components/ExpenseForm')
);
const OpsExpenseTable = lazy(
  () => import('./operations/components/expense-components/ExpenseTable')
);
const OpsVendorForm = lazy(
  () => import('./operations/components/expense-components/VendorForm')
);

// === SALES - lazy loaded ===
const SalesActivityStats = lazy(
  () => import('./sales/components/activity-components/ActivityStats')
);
const SalesLoginData = lazy(
  () => import('./sales/components/activity-components/LoginData')
);
const SalesBedsTable = lazy(
  () => import('./sales/components/beds-components/BedsTable')
);
const SalesResidentsList = lazy(
  () => import('./sales/components/beds-components/ResidentsList')
);
const SalesResidentsTable = lazy(
  () => import('./sales/components/beds-components/ResidentsTable')
);
const SalesResidentForm = lazy(
  () => import('./sales/components/beds-components/ResidentForm')
);
const SalesResidentDetails = lazy(
  () => import('./sales/components/beds-components/ResidentDetails')
);
const SalesAgreementPdf = lazy(
  () => import('./sales/components/beds-components/AgreementPdf')
);
const SalesLeadForm = lazy(
  () => import('./sales/components/lead-components/LeadForm')
);
const SalesLeadTable = lazy(
  () => import('./sales/components/lead-components/LeadTable')
);
const SalesLeadDetails = lazy(
  () => import('./sales/components/lead-components/LeadDetails')
);
const SalesExpenseForm = lazy(
  () => import('./sales/components/expense-components/ExpenseForm')
);
const SalesExpenseTable = lazy(
  () => import('./sales/components/expense-components/ExpenseTable')
);
const SalesVendorForm = lazy(
  () => import('./sales/components/expense-components/VendorForm')
);
const SalesKycManagement = lazy(
  () => import('./sales/components/kyc-components/KycManagement')
);
const SalesKycDetail = lazy(
  () => import('./sales/components/kyc-components/KycDetail')
);

// === SUPPLY - lazy loaded ===
const SupActivityStats = lazy(
  () => import('./supply/components/activity-components/ActivityStats')
);
const SupLoginData = lazy(
  () => import('./supply/components/activity-components/LoginData')
);
const SupOwnerForm = lazy(
  () => import('./supply/components/owner-components/OwnerForm')
);
const SupOwnerTable = lazy(
  () => import('./supply/components/owner-components/OwnerTable')
);
const SupOwnerDetails = lazy(
  () => import('./supply/components/owner-components/OwnerDetails')
);
const SupPropertyForm = lazy(
  () => import('./supply/components/property-components/PropertyForm')
);
const SupPropertyTable = lazy(
  () => import('./supply/components/property-components/PropertyTable')
);
const SupPropertyDetails = lazy(
  () => import('./supply/components/property-components/PropertyDetails')
);
const SupRoomTable = lazy(
  () => import('./supply/components/supply-room-components/RoomTable')
);
const SupRoomForm = lazy(
  () => import('./supply/components/supply-room-components/RoomForm')
);
const SupRoomDetails = lazy(
  () => import('./supply/components/supply-room-components/RoomDetails')
);
const SupExpenseForm = lazy(
  () => import('./supply/components/expense-components/ExpenseForm')
);
const SupExpenseTable = lazy(
  () => import('./supply/components/expense-components/ExpenseTable')
);
const SupVendorForm = lazy(
  () => import('./supply/components/expense-components/VendorForm')
);

// === PARTNERS - lazy loaded ===
const PartnersHome = lazy(() => import('./partners/pages/Home'));
const PartnersProperties = lazy(() => import('./partners/pages/Properties'));
const PartnersPropertyDetails = lazy(
  () => import('./partners/pages/PropertyDetails')
);
const PartnersExpenses = lazy(() => import('./partners/pages/Expenses'));
const PartnersKycDetails = lazy(() => import('./partners/pages/KycDetails'));
const PartnersBankDetails = lazy(() => import('./partners/pages/BankDetails'));
const PartnersOwnerDetails = lazy(
  () => import('./partners/pages/OwnerDetails')
);

// === resident - lazy loaded ===
const ResidentDashboard = lazy(
  () => import('./resident/components/ResidentDashboard')
);
const ResidentProfile = lazy(
  () => import('./resident/components/ResidentProfile')
);
const ResidentKyc = lazy(() => import('./resident/components/ResidentKyc'));
const ResidentRentHistory = lazy(
  () => import('./resident/components/ResidentRentHistory')
);
const ResidentInvoice = lazy(
  () => import('./resident/components/ResidentInvoice')
);
const ResidentComplaints = lazy(
  () => import('./resident/components/ResidentComplaints')
);
const ResidentComplaintDetail = lazy(
  () => import('./resident/components/ResidentComplaintDetail')
);
const ResidentLease = lazy(() => import('./resident/components/ResidentLease'));
const ResidentPayments = lazy(
  () => import('./resident/components/ResidentPayments')
);
const ResidentPaymentResult = lazy(
  () => import('./resident/components/ResidentPaymentResult')
);
const ResidentChangePassword = lazy(
  () => import('./resident/components/ResidentChangePassword')
);

// === OPERATIONS KYC - lazy loaded ===
const OpsKycManagement = lazy(
  () => import('./operations/components/kyc-components/KycManagement')
);
const OpsKycDetail = lazy(
  () => import('./operations/components/kyc-components/KycDetail')
);

/**
 * Protected — thin wrapper around ProtectedRoute for cleaner JSX in the route table.
 *
 * @param {object} props
 * @param {string} props.type - The user role required to access the wrapped route.
 * @param {React.ReactNode} props.children - The page component to protect.
 * @returns {React.ReactElement}
 */
// === Helper: wrap dashboard routes with ProtectedRoute ===
function Protected({ type, children }) {
  return <ProtectedRoute allowedType={type}>{children}</ProtectedRoute>;
}

/**
 * Routing — defines the full client-side route tree for the application.
 * Wraps all portal routes in SidebarProvider so sidebar state is shared via context.
 *
 * @returns {React.ReactElement}
 */
function Routing() {
  return (
    <SidebarProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ========== LOGIN ========== */}
          <Route path="/login" element={<Login />} />

          {/* ========== DASHBOARDS (PROTECTED) ========== */}
          <Route
            path="/admin/dashboard"
            element={
              <Protected type="admin">
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/accounts/dashboard"
            element={
              <Protected type="accounts">
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/operations/dashboard"
            element={
              <Protected type="operations">
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/sales/dashboard"
            element={
              <Protected type="sales">
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/supply/dashboard"
            element={
              <Protected type="supply">
                <Dashboard />
              </Protected>
            }
          />

          {/* ========== WEBSITE (PUBLIC) ========== */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <WebHome />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <WebMainAbout />
              </PublicLayout>
            }
          />
          <Route
            path="/properties"
            element={
              <PublicLayout>
                <WebProperties />
              </PublicLayout>
            }
          />
          <Route
            path="/properties/:slug"
            element={
              <PublicLayout>
                <WebPropertyDetails />
              </PublicLayout>
            }
          />
          <Route
            path="/blog"
            element={
              <PublicLayout>
                <WebBlog />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore"
            element={
              <PublicLayout>
                <Blog1 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/red-flags-to-watch-out-for-before-shifting-to-a-coliving-space-in-bangalore"
            element={
              <PublicLayout>
                <Blog2 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/pet-friendly-coliving-spaces"
            element={
              <PublicLayout>
                <Blog3 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/coliving-vs-pgs-and-rented-flats"
            element={
              <PublicLayout>
                <Blog4 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/women-friendly-coliving-spaces"
            element={
              <PublicLayout>
                <Blog5 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/rent-right-or-regret-later"
            element={
              <PublicLayout>
                <Blog6 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/new-city-new-digs"
            element={
              <PublicLayout>
                <Blog7 />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/roomies-real-life-growth"
            element={
              <PublicLayout>
                <Blog8 />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <WebContact />
              </PublicLayout>
            }
          />
          <Route path="/resident-login" element={<WebResidentLogin />} />
          <Route
            path="/privacy-policy"
            element={
              <PublicLayout>
                <WebPrivacyPolicy />
              </PublicLayout>
            }
          />
          <Route
            path="/Terms-conditions"
            element={
              <PublicLayout>
                <WebTermsConditions />
              </PublicLayout>
            }
          />
          <Route
            path="/refund-policy"
            element={
              <PublicLayout>
                <WebRefundPolicy />
              </PublicLayout>
            }
          />

          {/* ========== ACCOUNTS (PROTECTED) ========== */}
          <Route
            path="/accounts/accounts-user-activity-data"
            element={
              <Protected type="accounts">
                <AccActivityStats />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-login-data/:id"
            element={
              <Protected type="accounts">
                <AccLoginData />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-vendor-form"
            element={
              <Protected type="accounts">
                <AccVendorForm />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-vendor-table"
            element={
              <Protected type="accounts">
                <AccVendorTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-vendor-data/:id"
            element={
              <Protected type="accounts">
                <AccVendorData />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-expense-form"
            element={
              <Protected type="accounts">
                <AccExpenseForm />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-expense-table"
            element={
              <Protected type="accounts">
                <AccExpenseTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-expense-table/:id"
            element={
              <Protected type="accounts">
                <AccExpenseTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-category-data/:id"
            element={
              <Protected type="accounts">
                <AccCategoryData />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-rawdatafile-upload"
            element={
              <Protected type="accounts">
                <AccRawdataFileUpload />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-rawdatafile-table"
            element={
              <Protected type="accounts">
                <AccRawdataFileTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-rawdata-table/:id"
            element={
              <Protected type="accounts">
                <AccRawdataTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-rawdata-form/:id"
            element={
              <Protected type="accounts">
                <AccRawdataForm />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-rawdata-data/:id"
            element={
              <Protected type="accounts">
                <AccRawdataDetails />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-liability-table"
            element={
              <Protected type="accounts">
                <AccLiabilityTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-liability-form/:id"
            element={
              <Protected type="accounts">
                <AccLiabilityForm />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-liability-data/:id"
            element={
              <Protected type="accounts">
                <AccLiabilityData />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-otherfiles-upload"
            element={
              <Protected type="accounts">
                <AccOtherFilesForm />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-otherfiles-table"
            element={
              <Protected type="accounts">
                <AccOtherFilesTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-beds-table"
            element={
              <Protected type="accounts">
                <AccBedsTable />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-beds-details/:id"
            element={
              <Protected type="accounts">
                <AccBedsDetails />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-agreement-pdf/:id"
            element={
              <Protected type="accounts">
                <AccAgreementPdf />
              </Protected>
            }
          />
          <Route
            path="/accounts/accounts-employee-form"
            element={
              <Protected type="accounts">
                <AccEmployeeForm />
              </Protected>
            }
          />

          {/* ========== OPERATIONS (PROTECTED + some public) ========== */}
          <Route
            path="/operations/operations-user-activity-data"
            element={
              <Protected type="operations">
                <OpsActivityStats />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-login-data/:id"
            element={
              <Protected type="operations">
                <OpsLoginData />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-beds-table"
            element={
              <Protected type="operations">
                <OpsBedsTable />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-agreement-pdf/:id"
            element={
              <Protected type="operations">
                <OpsAgreementPdf />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-checklistfeedback-table"
            element={
              <Protected type="operations">
                <OpsChecklistFeedbackTable />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveinchecklist-form/:id"
            element={
              <Protected type="operations">
                <OpsMoveInChecklistForm />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveinchecklist-data/:id"
            element={
              <Protected type="operations">
                <OpsMoveInChecklistData />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveinfeedback-form/:id"
            element={<OpsMoveInFeedbackForm />}
          />
          <Route
            path="/operations/operations-moveinfeedback-data/:id"
            element={
              <Protected type="operations">
                <OpsMoveInFeedbackData />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveoutchecklist-form/:id"
            element={
              <Protected type="operations">
                <OpsMoveOutChecklistForm />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveoutchecklist-data/:id"
            element={
              <Protected type="operations">
                <OpsMoveOutChecklistData />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-moveoutfeedback-form/:id"
            element={<OpsMoveOutFeedbackForm />}
          />
          <Route
            path="/operations/operations-moveoutfeedback-data/:id"
            element={
              <Protected type="operations">
                <OpsMoveOutFeedbackData />
              </Protected>
            }
          />
          {/* Public operations routes (complaint/feedback forms accessible without auth) */}
          <Route
            path="/operations/operations-propertycomplaint-form"
            element={<OpsCommonPropertyComplaintForm />}
          />
          <Route
            path="/operations/operations-propertycomplaint-form/:id"
            element={<OpsPropertyComplaintForm />}
          />
          <Route
            path="/operations/operations-propertycomplaint-table"
            element={
              <Protected type="operations">
                <OpsPropertyComplaintTable />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-propertycomplaint-data/:id"
            element={
              <Protected type="operations">
                <OpsPropertyComplaintData />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-feedback-form/:id"
            element={<OpsFeedbackForm />}
          />
          <Route
            path="/operations/operations-expense-form"
            element={
              <Protected type="operations">
                <OpsExpenseForm />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-expense-table"
            element={
              <Protected type="operations">
                <OpsExpenseTable />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-vendor-form"
            element={
              <Protected type="operations">
                <OpsVendorForm />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-kyc-management"
            element={
              <Protected type="operations">
                <OpsKycManagement />
              </Protected>
            }
          />
          <Route
            path="/operations/operations-kyc-management/:id"
            element={
              <Protected type="operations">
                <OpsKycDetail />
              </Protected>
            }
          />

          {/* ========== SALES (PROTECTED) ========== */}
          <Route
            path="/sales/sales-user-activity-data"
            element={
              <Protected type="sales">
                <SalesActivityStats />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-login-data/:id"
            element={
              <Protected type="sales">
                <SalesLoginData />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-beds-table"
            element={
              <Protected type="sales">
                <SalesBedsTable />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-residents-list"
            element={
              <Protected type="sales">
                <SalesResidentsList />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-residents-table/:id"
            element={
              <Protected type="sales">
                <SalesResidentsTable />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-resident-form/:id"
            element={
              <Protected type="sales">
                <SalesResidentForm />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-resident-details/:id"
            element={
              <Protected type="sales">
                <SalesResidentDetails />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-agreement-pdf/:id"
            element={
              <Protected type="sales">
                <SalesAgreementPdf />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-leads-form"
            element={
              <Protected type="sales">
                <SalesLeadForm />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-leads-table"
            element={
              <Protected type="sales">
                <SalesLeadTable />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-leads-details/:id"
            element={
              <Protected type="sales">
                <SalesLeadDetails />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-expense-form"
            element={
              <Protected type="sales">
                <SalesExpenseForm />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-expense-table"
            element={
              <Protected type="sales">
                <SalesExpenseTable />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-vendor-form"
            element={
              <Protected type="sales">
                <SalesVendorForm />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-kyc-management"
            element={
              <Protected type="sales">
                <SalesKycManagement />
              </Protected>
            }
          />
          <Route
            path="/sales/sales-kyc-management/:id"
            element={
              <Protected type="sales">
                <SalesKycDetail />
              </Protected>
            }
          />

          {/* ========== SUPPLY (PROTECTED) ========== */}
          <Route
            path="/supply/supply-user-activity-data"
            element={
              <Protected type="supply">
                <SupActivityStats />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-login-data/:id"
            element={
              <Protected type="supply">
                <SupLoginData />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-owner-form"
            element={
              <Protected type="supply">
                <SupOwnerForm />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-owner-table"
            element={
              <Protected type="supply">
                <SupOwnerTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-owner-details/:id"
            element={
              <Protected type="supply">
                <SupOwnerDetails />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-property-form/:id"
            element={
              <Protected type="supply">
                <SupPropertyForm />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-property-table"
            element={
              <Protected type="supply">
                <SupPropertyTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-property-table/:id"
            element={
              <Protected type="supply">
                <SupPropertyTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-property-details/:id"
            element={
              <Protected type="supply">
                <SupPropertyDetails />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-room-form/:id"
            element={
              <Protected type="supply">
                <SupRoomForm />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-room-table"
            element={
              <Protected type="supply">
                <SupRoomTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-room-table/:id"
            element={
              <Protected type="supply">
                <SupRoomTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-room-details/:id"
            element={
              <Protected type="supply">
                <SupRoomDetails />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-expense-form"
            element={
              <Protected type="supply">
                <SupExpenseForm />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-expense-table"
            element={
              <Protected type="supply">
                <SupExpenseTable />
              </Protected>
            }
          />
          <Route
            path="/supply/supply-vendor-form"
            element={
              <Protected type="supply">
                <SupVendorForm />
              </Protected>
            }
          />

          {/* ========== PARTNERS (PROTECTED) ========== */}
          <Route
            path="/partners/partners-home"
            element={
              <Protected type="partners">
                <PartnersHome />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-properties"
            element={
              <Protected type="partners">
                <PartnersProperties />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-property-details"
            element={
              <Protected type="partners">
                <PartnersPropertyDetails />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-expenses"
            element={
              <Protected type="partners">
                <PartnersExpenses />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-kyc-details"
            element={
              <Protected type="partners">
                <PartnersKycDetails />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-bank-details"
            element={
              <Protected type="partners">
                <PartnersBankDetails />
              </Protected>
            }
          />
          <Route
            path="/partners/partners-owner-details"
            element={
              <Protected type="partners">
                <PartnersOwnerDetails />
              </Protected>
            }
          />

          {/* ========== RESIDENT PORTAL (PROTECTED) ========== */}
          <Route
            path="/resident/dashboard"
            element={
              <Protected type="resident">
                <ResidentDashboard />
              </Protected>
            }
          />
          <Route
            path="/resident/profile"
            element={
              <Protected type="resident">
                <ResidentProfile />
              </Protected>
            }
          />
          <Route
            path="/resident/kyc"
            element={
              <Protected type="resident">
                <ResidentKyc />
              </Protected>
            }
          />
          <Route
            path="/resident/rent-history"
            element={
              <Protected type="resident">
                <ResidentRentHistory />
              </Protected>
            }
          />
          <Route
            path="/resident/invoice/:id"
            element={
              <Protected type="resident">
                <ResidentInvoice />
              </Protected>
            }
          />
          <Route
            path="/resident/complaints"
            element={
              <Protected type="resident">
                <ResidentComplaints />
              </Protected>
            }
          />
          <Route
            path="/resident/complaint/:id"
            element={
              <Protected type="resident">
                <ResidentComplaintDetail />
              </Protected>
            }
          />
          <Route
            path="/resident/lease"
            element={
              <Protected type="resident">
                <ResidentLease />
              </Protected>
            }
          />
          <Route
            path="/resident/payments"
            element={
              <Protected type="resident">
                <ResidentPayments />
              </Protected>
            }
          />
          <Route
            path="/resident/payment-result"
            element={<ResidentPaymentResult />}
          />
          <Route
            path="/resident/change-password"
            element={
              <Protected type="resident">
                <ResidentChangePassword />
              </Protected>
            }
          />

          {/* ========== OLD LOGIN REDIRECTS ========== */}
          {/* Redirect old per-app login URLs to unified login */}
          <Route
            path="/accounts/accounts-login"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/operations/operations-login"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/sales/sales-login"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/supply/supply-login"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/partners/partners-login"
            element={<Navigate to="/login" replace />}
          />

          {/* ========== FALLBACK ========== */}
          <Route
            path="*"
            element={
              <PublicLayout>
                <WebNotFound />
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </SidebarProvider>
  );
}

export default Routing;
