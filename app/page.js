"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const STATUS_COLORS = {
  Confirmed: { background: "#d4edda", color: "#155724" },
  TBD: { background: "#fff3cd", color: "#856404" },
  Cancelled: { background: "#f8d7da", color: "#721c24" },
};

const FORMAT_COLORS = {
  "In-Person": { background: "#d1ecf1", color: "#0c5460" },
  Virtual: { background: "#e2d9f3", color: "#4a235a" },
  Hybrid: { background: "#fce8d5", color: "#7b3f00" },
};

function Badge({ text, colorMap }) {
  const style = colorMap[text] || { background: "#e9ecef", color: "#495057" };
  return (
    <span
      style={{
        ...style,
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}

function parseDate(val) {
  if (!val) return null;
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(val) {
  const d = parseDate(val);
  if (!d) return val || "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeRow(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[k.trim()] = v;
  }
  return norm;
}

function col(row, name) {
  return row[name] ?? "";
}

function safeUrl(raw) {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    // not a valid URL
  }
  return null;
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setEvents(rows.map(normalizeRow));
        setExpandedRow(null);
      } catch {
        setError("Failed to parse the file. Please upload a valid .xlsx, .xls, or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const filtered = events.filter((row) => {
    const query = searchText.toLowerCase();
    const name = col(row, "Event Name (with Industry)").toString().toLowerCase();
    const owner = col(row, "Main Event contact").toString().toLowerCase();
    const location = col(row, "Geo Location").toString().toLowerCase()
      || col(row, "Geo Location ").toString().toLowerCase();

    if (query && !name.includes(query) && !owner.includes(query) && !location.includes(query)) {
      return false;
    }

    const start = parseDate(col(row, "Start Date"));
    const finish = parseDate(col(row, "Finish Date"));

    if (startFilter) {
      const filterStart = new Date(startFilter);
      if (finish && finish < filterStart) return false;
      if (!finish && start && start < filterStart) return false;
    }

    if (endFilter) {
      const filterEnd = new Date(endFilter);
      if (start && start > filterEnd) return false;
    }

    return true;
  });

  const hasEvents = events.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fa" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #0070f3 0%, #00c6fb 100%)",
          color: "#fff",
          padding: "28px 40px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: 0.5 }}>
          📅 Marketing Events Tracker
        </h1>
        <p style={{ margin: "6px 0 0", opacity: 0.88, fontSize: 14 }}>
          Upload your Excel spreadsheet to view and filter upcoming marketing events
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* Upload Section */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "24px 28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              ⬆ Upload Excel File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            {fileName && (
              <span style={{ fontSize: 13, color: "#555" }}>
                📄 <strong>{fileName}</strong>
                {hasEvents && (
                  <span style={{ marginLeft: 8, color: "#0070f3" }}>
                    — {events.length} event{events.length !== 1 ? "s" : ""} loaded
                  </span>
                )}
              </span>
            )}
          </div>
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#f8d7da",
                color: "#721c24",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Filters */}
        {hasEvents && (
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: "18px 28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              marginBottom: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 220px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Event name, owner, or location..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: "0 1 180px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>
                📅 Start Date (from)
              </label>
              <input
                type="date"
                value={startFilter}
                onChange={(e) => setStartFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: "0 1 180px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 4 }}>
                📅 End Date (to)
              </label>
              <input
                type="date"
                value={endFilter}
                onChange={(e) => setEndFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {(searchText || startFilter || endFilter) && (
              <button
                onClick={() => {
                  setSearchText("");
                  setStartFilter("");
                  setEndFilter("");
                }}
                style={{
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#555",
                  alignSelf: "flex-end",
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {hasEvents && (searchText || startFilter || endFilter) && (
          <div style={{ fontSize: 13, color: "#666", marginBottom: 12, paddingLeft: 2 }}>
            Showing <strong>{filtered.length}</strong> of <strong>{events.length}</strong> events
          </div>
        )}

        {/* Events Table */}
        {hasEvents && (
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 28px", textAlign: "center", color: "#888", fontSize: 15 }}>
                No events match your search or filter criteria.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8f9fb", borderBottom: "2px solid #e8eaf0" }}>
                      {[
                        "Event Name",
                        "Dates",
                        "Location",
                        "Format",
                        "Status",
                        "Quarter",
                        "Owner",
                        "Budget",
                        "Pipeline",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "12px 14px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "#333",
                            whiteSpace: "nowrap",
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, idx) => {
                      const isExpanded = expandedRow === idx;
                      const status = col(row, "Status (Confirmed, TBD, Cancelled)").toString();
                      const format = col(row, "Format (In-Person, Virtual, Hybrid)").toString();
                      const location =
                        col(row, "Geo Location").toString() ||
                        col(row, "Geo Location ").toString();
                      const notes = col(row, "Notes").toString();
                      const website = col(row, "Website Link(s)").toString();

                      return (
                        <>
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid #f0f0f0",
                              background: isExpanded ? "#f0f7ff" : idx % 2 === 0 ? "#fff" : "#fafbfc",
                              transition: "background 0.15s",
                            }}
                          >
                            <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1a1a2e", maxWidth: 220 }}>
                              {col(row, "Event Name (with Industry)").toString()}
                            </td>
                            <td style={{ padding: "12px 14px", whiteSpace: "nowrap", color: "#555" }}>
                              <div>{formatDate(col(row, "Start Date"))}</div>
                              {col(row, "Finish Date") && (
                                <div style={{ fontSize: 11, color: "#888" }}>
                                  → {formatDate(col(row, "Finish Date"))}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#555", maxWidth: 140 }}>
                              {location}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {format && <Badge text={format} colorMap={FORMAT_COLORS} />}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {status && <Badge text={status} colorMap={STATUS_COLORS} />}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#555" }}>
                              {col(row, "Quarter").toString()}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#555", maxWidth: 140 }}>
                              {col(row, "Main Event contact").toString()}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#555", whiteSpace: "nowrap" }}>
                              {col(row, "Estimated Budget").toString()}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#555", whiteSpace: "nowrap" }}>
                              {col(row, "Expected Pipeline").toString()}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {(notes || website) && (
                                <button
                                  onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                  style={{
                                    background: "none",
                                    border: "1px solid #bbb",
                                    borderRadius: 5,
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    color: "#555",
                                  }}
                                  title={isExpanded ? "Hide details" : "Show details"}
                                >
                                  {isExpanded ? "▲" : "▼"}
                                </button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`exp-${idx}`} style={{ background: "#f0f7ff" }}>
                              <td
                                colSpan={10}
                                style={{ padding: "14px 28px 16px", borderBottom: "1px solid #d0e4ff" }}
                              >
                                {notes && (
                                  <div style={{ marginBottom: website ? 10 : 0 }}>
                                    <strong style={{ fontSize: 12, color: "#444" }}>Notes:</strong>{" "}
                                    <span style={{ fontSize: 13, color: "#555" }}>{notes}</span>
                                  </div>
                                )}
                                {website && (
                                  <div>
                                    <strong style={{ fontSize: 12, color: "#444" }}>Website:</strong>{" "}
                                    {safeUrl(website) ? (
                                      <a
                                        href={safeUrl(website)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: 13, color: "#0070f3" }}
                                      >
                                        {website}
                                      </a>
                                    ) : (
                                      <span style={{ fontSize: 13, color: "#555" }}>{website}</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasEvents && !error && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#888",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "#555" }}>
              No events loaded yet
            </div>
            <div style={{ fontSize: 14 }}>
              Upload an Excel file (.xlsx, .xls) or CSV to get started
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
