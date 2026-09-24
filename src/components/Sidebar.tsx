import { Icon } from "./Icons";
import type { PageType } from "../types";

interface SidebarProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  studentCount: number;
  lessonCount: number;
  supabaseConnected: boolean;
}

export function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  studentCount,
  lessonCount,
  supabaseConnected,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard" as PageType,
      label: "Dashboard",
      icon: "dashboard" as const,
      badge: null,
    },
    {
      id: "lessons" as PageType,
      label: "Dars jadvali",
      icon: "calendar" as const,
      badge: lessonCount > 0 ? lessonCount : null,
    },
    {
      id: "students" as PageType,
      label: "O‘quvchilar",
      icon: "users" as const,
      badge: studentCount > 0 ? studentCount : null,
    },
    {
      id: "groups" as PageType,
      label: "Guruhlar",
      icon: "group" as const,
      badge: null,
    },
    {
      id: "attendance" as PageType,
      label: "Davomat olish",
      icon: "check" as const,
      badge: "Jonli",
      badgeColor: "live",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* LOGO & BRAND */}
        <div className="sidebar-brand">
          <div className="brand-logo-glow">
            <span className="brand-letter">D</span>
          </div>

          {!collapsed && (
            <div className="brand-info">
              <span className="brand-title">Davomat</span>
              <span className="brand-tag">Teacher Suite</span>
            </div>
          )}

          <button
            type="button"
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            title={collapsed ? "Kengaytirish" : "Yig‘ish"}
          >
            <Icon
              name="chevron"
              size={16}
              className={collapsed ? "rotate-180" : ""}
            />
          </button>

          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={onCloseMobile}
            title="Yopish"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-menu">
          {!collapsed && <div className="menu-group-label">ASOSIY MENYU</div>}

          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
              >
                <span className="menu-icon">
                  <Icon name={item.icon} size={20} />
                </span>

                {!collapsed && (
                  <span className="menu-label">{item.label}</span>
                )}

                {!collapsed && item.badge !== null && (
                  <span
                    className={`menu-badge ${
                      item.badgeColor === "live" ? "badge-live" : ""
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* SUPABASE STATUS CARD */}
        {!collapsed && (
          <div className="sidebar-status-card">
            <div className="status-indicator">
              <span
                className={`status-dot ${
                  supabaseConnected ? "dot-online" : "dot-offline"
                }`}
              />
              <span className="status-text">
                {supabaseConnected ? "Supabase Online" : "Lokal rejim"}
              </span>
            </div>
            <p className="status-desc">
              {supabaseConnected
                ? "Ma'lumotlar real vaqtda sinxronlanmoqda"
                : "Tarmoq bilan aloqa tekshirilmoqda"}
            </p>
          </div>
        )}

        {/* USER PROFILE FOOTER */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar-circle">TJ</div>
            {!collapsed && (
              <div className="user-details">
                <span className="user-name">Tuxtamurod</span>
                <span className="user-role">Bosh O‘qituvchi</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
