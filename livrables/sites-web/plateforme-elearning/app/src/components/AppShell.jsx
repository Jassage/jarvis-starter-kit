'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ role, active, go, title, subtitle, search, children, contentClass = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="edu-app">
      <Sidebar role={role} active={active} go={go} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="edu-main">
        <Topbar role={role} go={go} title={title} subtitle={subtitle} search={search} onMenu={() => setMobileOpen(true)} />
        <main className={'edu-content scroll-y ' + contentClass}>{children}</main>
      </div>
    </div>
  );
}
