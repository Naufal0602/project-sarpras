import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>403 - Akses Ditolak</h1>
      <p>Kamu tidak punya izin untuk mengakses halaman ini.</p>
      <button onClick={handleBack} style={{ marginTop: '20px' }}>
        ← Kembali ke Halaman Sebelumnya
      </button>
    </div>
  );
};

export default UnauthorizedPage;
