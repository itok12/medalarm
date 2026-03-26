// src/components/Common/Layout.js
import React from "react";

function Layout({ children }) {
  return (
    <div className="layout">
      <header>
        <h1>MedAlarm</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
