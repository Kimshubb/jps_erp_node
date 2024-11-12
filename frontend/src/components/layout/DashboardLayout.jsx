import React, { useState } from 'react';
import {
  Menu,
  Home,
  Users,
  Wallet,
  Library,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatsCard } from './StatsCard';

const DashboardLayout = ({
  children,
  schoolName,
  currentUser,
  totalActiveStudents,
  totalInactiveStudents,
  totalPaidViaCashToday,
  totalBankedToday,
  departmentsCount
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const { logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleSubmenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      icon: <Home />,
      label: 'Dashboard',
      link: '/dashboard'
    },
    {
      icon: <Users />,
      label: 'Students',
      link: '/students',
      subMenus: [
        { label: 'View Students', link: '/students' },
        { label: 'Add Student', link: '/students/add' }
      ]
    },
    {
      icon: <Wallet />,
      label: 'Fees',
      link: '/payments',
      subMenus: [
        { label: 'View Payments', link: '/payments' },
        { label: 'New Payment', link: '/payments/new' },
        { label: 'Verify Payments', link: '/payments/verify' },
        { label: 'Fees structure', link: '/settings/fee-structure' },
        { label: 'Manage Add Fees', link: '/settings/additional-fees' },
        { label: 'Fees Reports', link: '/payments/reports' }
      ]
    },
    {
      icon: <Library />,
      label: 'Schedules',
      link: '/schedules',
      subMenus: [
        { label: 'Timetables', link: '/schedules' },
        { label: 'Borrowings', link: '/schedules/borrowings' }
      ]
    },
    {
      icon: <Settings />,
      label: 'Settings',
      link: '/settings',
      subMenus: [
        { label: 'Manage Terms', link: '/settings/terms' },
        { label: 'Migrate terms', link: '/settings/migrate-terms' },
        { label: 'Manage Grades', link: '/settings/grades' },
        { label: 'Manage Users', link: '/auth/users' }
      ]
    },
    {
      icon: <LogOut />,
      label: 'Sign out',
      link: '/logout',
      onClick: logout
    }
  ];

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <nav id="sidebar" className={`sidebar ${isSidebarOpen ? '' : 'active'}`}>
        <div className="sidebar-header text-center text-white py-3">
          <h3>{schoolName}</h3>
        </div>
        <ul className="list-unstyled components">
          {menuItems.map((item, index) => (
            <li key={index} className={openMenus[item.label] ? 'active' : ''}>
              
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick ? item.onClick() : toggleSubmenu(item.label);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
              {item.subMenus && (
                <ul className="collapse list-unstyled">
                  {item.subMenus.map((subMenu, subIndex) => (
                    <li key={subIndex}>
                      <a href={subMenu.link}>{subMenu.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Page Content */}
      <div id="content" className={`${isSidebarOpen ? '' : 'active'}`}>
        <nav className="navbar">
          <div className="container-fluid">
            <button type="button" id="sidebarCollapse" className="btn btn-info">
              <Menu />
            </button>
            <div className="user-info">
              <p>Welcome, {currentUser.username}!</p>
            </div>
          </div>
        </nav>
        <div className="container-fluid">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-4">
            <div className="col">
              <StatsCard
                title="Active Students"
                value={totalActiveStudents}
                icon={<Users />}
              />
            </div>
            <div className="col">
              <StatsCard
                title="Inactive Students"
                value={totalInactiveStudents}
                icon={<Users />}
              />
            </div>
            <div className="col">
              <StatsCard
                title="Cash Today"
                value={totalPaidViaCashToday}
                icon={<Wallet />}
              />
            </div>
            <div className="col">
              <StatsCard
                title="Bank Today"
                value={totalBankedToday}
                icon={<Wallet />}
              />
            </div>
            <div className="col">
              <StatsCard
                title="Departments"
                value={departmentsCount}
                icon={<Library />}
              />
            </div>
          </div>

          {/* ... other content ... */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;