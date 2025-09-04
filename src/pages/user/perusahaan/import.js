import React, { useState } from "react";
import * as XLSX from "xlsx";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";

const ImportPekerjaanFisikPage = () => {
  const [excelData, setExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Baca file Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });

      const sheetName = "Pekerjaan";
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false, // biar serial Excel otomatis jadi string tanggal
      });

      setExcelData(sheet);
    };

    reader.readAsArrayBuffer(file);
  };

  // Simpan ke Firestore
  const handleSaveToFirestore = async () => {
    if (excelData.length === 0) {
      alert("Tidak ada data yang bisa diimport!");
      return;
    }

    setUploading(true);

    try {
      for (const row of excelData) {
        // 1. Simpan pekerjaan fisik
        const pekerjaanRef = await addDoc(collection(db, "pekerjaan_fisik"), {
          perusahaan_id: row["Id Perusahaan"] || "-",
          jenis_pekerjaan: row["Kegiatan"] || "-",
          pekerjaan: row["Sub Kegiatan"] || "-",
          deskripsi: row["Paket Pekerjaan"] || "-",
          bagian: (row["Bagian"] || "-").toLowerCase(),
          tanggal_pekerjaan: row["Tanggal"] || null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        const pekerjaanId = pekerjaanRef.id;

        // 2. Simpan ke galeri (kalau ada URL)
        if (row["url"]) {
          await addDoc(collection(db, "galeri"), {
            id_pekerjaan: pekerjaanId,
            url_gambar: row["url"],
            public_id: row["public_id"] || "",
            keterangan: row["keterangan"] || "",
            created_at: serverTimestamp(),
            thumbnail: true, // defaultin satu jadi thumbnail
          });
        }
      }

      alert("Data berhasil diimport ke Firestore!");
      setExcelData([]);
    } catch (error) {
      console.error("Gagal import:", error);
      alert("Gagal import data, cek console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed z-50">
        <Navbar />
        <Sidebar />
      </div>

      <div className="flex-1 md:ml-72 pt-20 p-8">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">
          Import Data Pekerjaan Fisik & Galeri
        </h2>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4"
        />

        {excelData.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <h3 className="font-semibold mb-2">Preview Data:</h3>
            <table className="table-auto border-collapse border border-gray-400 text-sm">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key} className="border border-gray-400 px-2 py-1">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border border-gray-400 px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {excelData.length > 0 && (
          <button
            onClick={handleSaveToFirestore}
            disabled={uploading}
            className={`px-4 py-2 rounded text-white ${
              uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "Mengupload..." : "Simpan ke Firestore"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImportPekerjaanFisikPage;
