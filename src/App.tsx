import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import { LandingPage } from './pages/student/LandingPage';
import { StudentEntryWizardPage } from './pages/student/StudentEntryWizardPage';
import { LegacyTestsPage } from './pages/student/LegacyTestsPage';
import { TestRunnerPage } from './pages/student/TestRunnerPage';
import { ResultPage } from './pages/student/ResultPage';

import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherTestsPage } from './pages/teacher/TeacherTestsPage';
import { TeacherTestEditorPage } from './pages/teacher/TeacherTestEditorPage';
import { TeacherResultsPage } from './pages/teacher/TeacherResultsPage';
import { TeacherLibraryPage } from './pages/teacher/TeacherLibraryPage';
import { TeacherSettingsPage } from './pages/teacher/TeacherSettingsPage';

import { SuperAdminDashboardPage } from './pages/super-admin/SuperAdminDashboardPage';
import { SuperAdminBankPage } from './pages/super-admin/SuperAdminBankPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Student & Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />

            <Route path="/test-kirish" element={<StudentEntryWizardPage />} />
            <Route path="/test-kirish.html" element={<StudentEntryWizardPage />} />

            <Route path="/eski-testlar" element={<LegacyTestsPage />} />
            <Route path="/eski-testlar.html" element={<LegacyTestsPage />} />

            <Route path="/test" element={<TestRunnerPage />} />
            <Route path="/test.html" element={<TestRunnerPage />} />

            <Route path="/natija" element={<ResultPage />} />
            <Route path="/natija.html" element={<ResultPage />} />

            {/* Auth Routes */}
            <Route path="/oqituvchi/kirish" element={<AdminLoginPage />} />
            <Route path="/oqituvchi/kirish.html" element={<AdminLoginPage />} />
            <Route path="/teacher.html" element={<Navigate to="/oqituvchi/kirish" replace />} />

            {/* Teacher Routes */}
            <Route path="/oqituvchi" element={<TeacherDashboardPage />} />
            <Route path="/oqituvchi/index.html" element={<Navigate to="/oqituvchi" replace />} />

            <Route path="/oqituvchi/sinflar" element={<TeacherClassesPage />} />
            <Route path="/oqituvchi/sinflar.html" element={<Navigate to="/oqituvchi/sinflar" replace />} />

            <Route path="/oqituvchi/testlar" element={<TeacherTestsPage />} />
            <Route path="/oqituvchi/testlar.html" element={<Navigate to="/oqituvchi/testlar" replace />} />

            <Route path="/oqituvchi/test-tahrir" element={<TeacherTestEditorPage />} />
            <Route path="/oqituvchi/test-tahrir.html" element={<TeacherTestEditorPage />} />

            <Route path="/oqituvchi/natijalar" element={<TeacherResultsPage />} />
            <Route path="/oqituvchi/natijalar.html" element={<Navigate to="/oqituvchi/natijalar" replace />} />

            <Route path="/oqituvchi/savollar-bazasi" element={<TeacherLibraryPage />} />
            <Route
              path="/oqituvchi/savollar-bazasi.html"
              element={<Navigate to="/oqituvchi/savollar-bazasi" replace />}
            />

            <Route path="/oqituvchi/sozlamalar" element={<TeacherSettingsPage />} />
            <Route path="/oqituvchi/sozlamalar.html" element={<Navigate to="/oqituvchi/sozlamalar" replace />} />

            {/* Super Admin Routes */}
            <Route path="/bosh-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/bosh-admin/index.html" element={<Navigate to="/bosh-admin" replace />} />

            <Route path="/bosh-admin/umumiy-bank" element={<SuperAdminBankPage />} />
            <Route
              path="/bosh-admin/umumiy-bank.html"
              element={<Navigate to="/bosh-admin/umumiy-bank" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
