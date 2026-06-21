import api from "./api";

// ============================================================================
// STAFF MANAGEMENT (Quản lý Nhân sự / Trọng tài)
// ============================================================================

// 1 - 4. Get Staff List / Search / Filter / Pagination
export const getStaffList = async (params = {}) => {
  const response = await api.get("/api/v1/staffing/staff", { params });
  return response.data?.data;
};

// 5. Create Staff
export const createStaff = async (data) => {
  const response = await api.post("/api/v1/staffing/staff", data);
  return response.data?.data;
};

// 6. Update Staff
export const updateStaff = async (id, data) => {
  const response = await api.put(`/api/v1/staffing/staff/${id}`, data);
  return response.data?.data;
};

// ============================================================================
// REFEREE ASSIGNMENT MANAGEMENT (Quản lý Phân công Trọng tài)
// ============================================================================

// (Hàm phụ) Lấy thông tin Dashboard thống kê
export const getStaffingDashboard = async () => {
  const response = await api.get("/api/v1/staffing/dashboard");
  return response.data?.data;
};

// (Hàm phụ) Lấy danh sách phân công (để hiển thị bảng Race Assignment)
export const getRaceAssignments = async (params = {}) => {
  const response = await api.get("/api/v1/staffing/assignments", { params });
  return response.data?.data;
};

// 7. Assign Referee (POST)
export const assignReferee = async (data) => {
  const response = await api.post("/api/v1/staffing/assignments", data);
  return response.data?.data;
};

// 8. Reassign Referee
// Lưu ý: Trong ảnh ghi là PATCH, nhưng mã nguồn BE hiện đang thiết kế là PUT
export const reassignReferee = async (id, data) => {
  const response = await api.put(`/api/v1/staffing/assignments/${id}`, data);
  return response.data?.data;
};

// 9. Remove Assignment (DELETE)
export const removeAssignment = async (id) => {
  const response = await api.delete(`/api/v1/staffing/assignments/${id}`);
  return response.data?.success;
};
