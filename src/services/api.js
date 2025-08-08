import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/cloudinary';

export const deleteImageCloudinary = async (public_id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, {
      public_id,
    });
    return response.data;
  } catch (error) {
    console.error("Gagal hapus dari Cloudinary:", error);
    throw error;
  }
};
