type ExportCsvOptions = {
  filename: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
};

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportCsv({ filename, headers, rows }: ExportCsvOptions) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("CSV dışa aktarma yalnızca tarayıcı ortamında çalışır.");
  }

  const csvContent = [
    headers.map(escapeCsvValue).join(";"),
    ...rows.map((row) => row.map(escapeCsvValue).join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename || "export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
