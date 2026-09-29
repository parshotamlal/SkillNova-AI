'use client';

import AdminPayments from "../../../pages/AdminPayments";
import ProtectedRoute from "../../../context/ProtectedRoute";

export default function AdminPaymentsPage() {
  return (
    <ProtectedRoute>
      <AdminPayments />
    </ProtectedRoute>
  );
}
