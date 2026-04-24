import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    defaults: { headers: { common: {} }, withCredentials: false },
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/admin/dashboard' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: 'admin',
    userType: 'admin',
    isLoading: false,
    logout: vi.fn(),
    DEFAULT_ROUTES: {
      admin: '/admin/dashboard',
    },
  }),
}));

vi.mock('../Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../Sidebar', () => ({
  default: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

// Mock lucide-react icons used in Dashboard
vi.mock('lucide-react', () => ({
  LayoutDashboard: () => <span />,
  Users: () => <span />,
  FileText: () => <span />,
  Building2: () => <span />,
  TrendingUp: () => <span />,
  ClipboardList: () => <span />,
  BedDouble: () => <span />,
  Wrench: () => <span />,
  DollarSign: () => <span />,
  UserCheck: () => <span />,
  Package: () => <span />,
  PieChart: () => <span />,
}));

import Dashboard from '../Dashboard';

// ─── Tests ──────────────────────────────────────────────────────────

describe('Dashboard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Dashboard isExpanded={true} setIsExpanded={vi.fn()} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders the Navbar component', () => {
    const { getByTestId } = render(
      <Dashboard isExpanded={true} setIsExpanded={vi.fn()} />,
    );
    expect(getByTestId('navbar')).toBeInTheDocument();
  });
});
