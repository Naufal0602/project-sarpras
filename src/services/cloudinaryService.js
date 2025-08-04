
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "sarpras_upload"); // ganti sesuai preset kamu

  const res = await fetch("https://api.cloudinary.com/v1_1/dppfdwttz/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload ke Cloudinary gagal");

  const json = await res.json();

  return {
    secure_url: json.secure_url,
    public_id: json.public_id,
  };
};