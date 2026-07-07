import api from "./api";

function resolveDownloadPath(idOrPath) {
  if (!idOrPath) {
    throw new Error("Attachment id is required.");
  }

  if (String(idOrPath).startsWith("/api/v1/attachments/")) {
    return idOrPath;
  }

  return `/api/v1/attachments/${idOrPath}/download`;
}

function filenameFromHeaders(headers, fallback) {
  const disposition = headers?.["content-disposition"] || "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : fallback;
}

export async function downloadAttachment(idOrPath, fallbackFilename = "attachment") {
  const response = await api.get(resolveDownloadPath(idOrPath), {
    responseType: "blob",
  });

  const filename = filenameFromHeaders(response.headers, fallbackFilename);
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);

  return { filename };
}

export async function uploadAttachment(file, ownerEntityType, ownerEntityId, sensitivityLevel = "RESTRICTED") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerEntityType", ownerEntityType);
  if (ownerEntityId) {
    formData.append("ownerEntityId", ownerEntityId);
  }
  if (sensitivityLevel) {
    formData.append("sensitivityLevel", sensitivityLevel);
  }

  const response = await api.post("/api/v1/attachments", formData);
  return response.data?.data || response.data;
}

export async function getAttachments(ownerEntityType, ownerEntityId) {
  const response = await api.get("/api/v1/attachments", {
    params: { ownerEntityType, ownerEntityId },
  });
  return response.data?.data || response.data || [];
}
