import api from "./api";

const mapRegistration = (item) => ({
  id: item.registrationId || item.id,
  code: item.registrationCode || item.code,
  status: item.status,
  submittedAt: item.submittedAt,
  rejectionReason: item.rejectionReason,
  refereeNotes: item.refereeNotes,
  tournament: {
    id: item.tournamentId || item.tournament?.id,
    name: item.tournamentName || item.tournament?.name
  },
  horse: {
    id: item.horseId || item.horse?.id,
    name: item.horseName || item.horse?.name,
    code: item.horseCode || item.horse?.code,
    image: item.horseImage || item.horse?.image,
    age: item.horseAge || item.horse?.age || 0,
    stable: item.horseStable || item.horse?.stable,
    breed: item.horseBreed || item.horse?.breed,
    sire: item.horseSire || item.horse?.sire,
    dam: item.horseDam || item.horse?.dam
  },
  owner: {
    id: item.ownerUserId || item.owner?.id,
    name: item.ownerName || item.owner?.name
  },
  eligibility: item.eligibility || {}
});

// List registrations (with filters like status=SUBMITTED)
export async function getRegistrations(filters = {}) {
  try {
    const apiFilters = { ...filters };
    if (apiFilters.page && apiFilters.page > 0) {
      apiFilters.page = apiFilters.page - 1;
    }
    
    // Map pageSize to size for Spring Boot pagination
    if (apiFilters.pageSize) {
      apiFilters.size = apiFilters.pageSize;
      delete apiFilters.pageSize;
    }

    const params = new URLSearchParams(apiFilters).toString();
    const response = await api.get(`/api/v1/registrations?${params}`);
    const data = response.data?.data || response.data || {};
    
    const rawItems = data.content || data.items || [];
    
    return {
      items: rawItems.map(mapRegistration),
      totalItems: data.totalElements || data.totalItems || 0,
      totalPages: data.totalPages || 0
    };
  } catch (err) {
    console.error("API getRegistrations failed:", err.message);
    throw err;
  }
}

// Approve a registration
export async function approveRegistration(id) {
  try {
    const response = await api.patch(`/api/v1/registrations/${id}/approve`);
    return response.data;
  } catch (err) {
    console.error(`API approveRegistration for ${id} failed:`, err.message);
    throw err;
  }
}

// Reject a registration
export async function rejectRegistration(id, reason) {
  try {
    const response = await api.patch(`/api/v1/registrations/${id}/reject`, { reason });
    return response.data;
  } catch (err) {
    console.error(`API rejectRegistration for ${id} failed:`, err.message);
    throw err;
  }
}

export async function getRegistrationList(filters = {}) { return getRegistrations(filters); }
export async function getRegistrationDetail(id) {
  try {
    const res = await api.get(`/api/v1/registrations/${id}`);
    const rawData = res.data?.data || res.data;
    return mapRegistration(rawData);
  } catch (e) {
    throw e;
  }
}
export async function submitRegistration(data) { try { const res = await api.post('/api/v1/registrations', data); return res.data; } catch(e){ throw e; } }
