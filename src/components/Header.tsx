import { useState } from "react";
import { Icon } from "./Icons";
import type { PageType } from "../types";

interface HeaderProps {
  activePage: PageType;
  onOpenMobileMenu: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  supabaseConnected: boolean;
}

export function Header({
  activePage,
  onOpenMobileMenu,
  darkMode,
  onToggleTheme,
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
  supabaseConnected,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const pageNames: Record<PageType, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Boshqaruv paneli",
      subtitle: "Umumiy davomat statistikasi va bugungi darslar holati",
    },
    lessons: {
      title: "Dars jadvali",
      subtitle: "Bino va xonalar bo‘yicha darslarni rejalashtirish",
    },
    students: {
      title: "O‘quvchilar ro‘yxati",
      subtitle: "O‘quvchilarni qo‘shish, tahrirlash va davomat monitoringi",
    },
    groups: {
      title: "Guruhlar",
      subtitle: "Faol guruhlar va kurs darajalari",
    },
    attendance: {
      title: "Davomat belgilash",
      subtitle: "Guruhlar va sana kesimida tezkor davomat olish",
    },
  };

  const currentDateFormatted = new Intl.DateTimeFormat("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-icon-btn mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Menyu"
        >
          <Icon name="menu" size={22} />
        </button>

        <div className="header-page-title">
          <div className="title-row">
            <h1>{pageNames[activePage].title}</h1>
            <span className="live-date-pill">{currentDateFormatted}</span>
          </div>
          <p className="page-subtitle">{pageNames[activePage].subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* UNIVERSAL SEARCH BAR */}
        <div className="search-box">
          <Icon name="search" size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Qidiruv (ism, guruh, xona)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange("")}
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* SUPABASE REFRESH SYNC BUTTON */}
        <button
          type="button"
          className={`header-icon-btn ${isRefreshing ? "spin" : ""}`}
          onClick={onRefresh}
          title="Supabase ma'lumotlarini yangilash"
        >
          <Icon name="refresh" size={18} />
          {supabaseConnected && <span className="sync-online-dot" />}
        </button>

        {/* DARK / LIGHT THEME TOGGLE */}
        <button
          type="button"
          className="header-icon-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={darkMode ? "Kunduzgi rejim" : "Tungi rejim"}
          aria-label="Rejimni almashtirish"
        >
          <Icon name={darkMode ? "sun" : "moon"} size={19} />
        </button>

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="notifications-wrapper">
          <button
            type="button"
            className="header-icon-btn notify-btn"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Bildirishnomalar"
          >
            <Icon name="bell" size={19} />
            <span className="notify-badge-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <strong>Bildirishnomalar</strong>
                <button
                  type="button"
                  className="close-dropdown-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <div className="notif-body">
                <div className="notif-item">
                  <span className="notif-icon info">
                    <Icon name="clock" size={16} />
                  </span>
                  <div className="notif-text">
                    <strong>Davomat eslatmasi</strong>
                    <p>Bugungi darslar uchun davomatni to‘ldirishni unutmang.</p>
                    <small>Bugun, 09:00</small>
                  </div>
                </div>

                <div className="notif-item">
                  <span className="notif-icon success">
                    <Icon name="shield" size={16} />
                  </span>
                  <div className="notif-text">
                    <strong>Supabase ulandi</strong>
                    <p>PostgreSQL ma'lumotlar bazasi faol holatda.</p>
                    <small>Hozir</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div className="header-profile">
          <div className="profile-avatar">TJ</div>
          <div className="profile-meta desktop-only">
            <span className="name">Tuxtamurod</span>
            <span className="role">O‘qituvchi</span>
          </div>
        </div>
      </div>
    </header>
  );
}
