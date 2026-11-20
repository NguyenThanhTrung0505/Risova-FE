export function readEquipmentImage(file) {
  if (!file) return Promise.resolve('');
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return Promise.reject(new Error('Chọn ảnh PNG, JPEG, WebP hoặc GIF.'));
  }
  if (file.size > 512 * 1024) return Promise.reject(new Error('Ảnh phải nhỏ hơn 512 KB để lưu trên thiết bị.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không đọc được ảnh đã chọn.'));
    reader.readAsDataURL(file);
  });
}

