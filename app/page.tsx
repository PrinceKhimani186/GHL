"use client";
import { useEffect, useState } from "react";

/* =====================
   WEBINAR DETAILS FIELDS
   ===================== */
const DETAILS_FIELDS = [
  { label: "City", key: "city" },
  { label: "Zoom Link", key: "1__zoom_link" },
  { label: "Webinar Host", key: "webinar_host" },
  { label: "Webinar Host Email", key: "webinar_host_email" },
  { label: "Domain Name", key: "domain_name" },
];

/* ==========================
   WEBINAR DATE & TIME FIELDS
   ========================== */
const DATETIME_FIELDS = [
  { label: "Next Webinar Date", key: "2__next_webinar_date" },
  { label: "Webinar Time", key: "webinar_time" },
  { label: "Timezone", key: "timezone" },
];

export default function Page() {
  const [form, setForm] = useState<Record<string, string>>({
    webinar_date: "2025-12-27", // UI date
    webinar_time: "",
    timezone: "",

    city: "",
    "1__zoom_link": "",
    webinar_host: "",
    webinar_host_email: "",
    domain_name: "",
    "2__next_webinar_date": "",
  });

  const [customValueIds, setCustomValueIds] = useState<Record<string, string>>(
    {}
  );

  const [loadingDateTime, setLoadingDateTime] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* =========================
     GET: FETCH CUSTOM VALUES
     ========================= */
  useEffect(() => {
    const fetchCustomValues = async () => {
      const res = await fetch("/api/ghl/customValues");
      const data = await res.json();

      const idMap: Record<string, string> = {};
      const valueMap: Record<string, string> = {};

      data.customValues?.forEach((cv: any) => {
        const cleanKey = cv.fieldKey
          .replace("{{", "")
          .replace("}}", "")
          .replace("custom_values.", "")
          .trim();

        idMap[cleanKey] = cv.id;
        valueMap[cleanKey] = cv.value || "";
      });

      setCustomValueIds(idMap);
      setForm((prev) => ({ ...prev, ...valueMap }));
    };

    fetchCustomValues();
  }, []);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* =========================
     SHARED PUT CALL
     ========================= */
  const putCustomValues = async (
    updates: { id: string; name: string; label: string; value: string }[]
  ) => {
    await fetch("/api/ghl/customValues", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
  };

  /* =========================
     SAVE: DATE & TIME ONLY
     ========================= */
  const handleSaveDateTime = async () => {
    setLoadingDateTime(true);
    try {
      const updates: {
        id: string;
        name: string;
        label: string;
        value: string;
      }[] = [];

      if (!form.webinar_date || !form.webinar_time) {
        alert("Please select date and time");
        return;
      }

      // Combine local date + time
      const localDateTime = new Date(
        `${form.webinar_date}T${form.webinar_time}:00`
      );

      // Convert to UTC
      const utcString = localDateTime.toISOString();

      // Human readable (UTC)
      const readableUTC = new Date(utcString).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      });

      DATETIME_FIELDS.forEach((field) => {
        const id = customValueIds[field.key];
        if (!id) return;

        let value = "";

        if (field.key === "2__next_webinar_date") {
          // Append UTC date & time
          value = `${readableUTC}`;
        } else if (field.key === "webinar_time") {
          value = form.webinar_time;
        } else if (field.key === "timezone") {
          value = form.timezone;
        }

        updates.push({
          id,
          name: field.key,
          label: field.label,
          value,
        });
      });

      if (updates.length) {
        await putCustomValues(updates);
        alert("Webinar date & time saved (UTC)");
      }
    } catch {
      alert("Failed to save webinar date & time");
    } finally {
      setLoadingDateTime(false);
    }
  };

  /* =========================
     SAVE: DETAILS ONLY
     ========================= */
  const handleSaveDetails = async () => {
    setLoadingDetails(true);
    try {
      const updates = DETAILS_FIELDS.map((field) => {
        const id = customValueIds[field.key];
        if (!id) return null;

        return {
          id,
          name: field.key,
          label: field.label,
          value: form[field.key],
        };
      }).filter(Boolean) as {
        id: string;
        name: string;
        label: string;
        value: string;
      }[];

      if (updates.length) {
        await putCustomValues(updates);
        alert("Webinar details saved");
      }
    } catch {
      alert("Failed to save details");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="webinar-grid">
      {/* ================= DATE & TIME ================= */}
      <div className="card">
        <h3>📅 Webinar Date & Time</h3>

        <div className="field-normal">
          <label>Webinar Date</label>
          <input
            type="date"
            value={form.webinar_date}
            onChange={(e) => updateField("webinar_date", e.target.value)}
          />
        </div>

        <div className="field-normal">
          <label>Webinar Time</label>
          <input
            type="time"
            value={form.webinar_time}
            onChange={(e) => updateField("webinar_time", e.target.value)}
          />
        </div>

        <div className="field-normal">
          <label>Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
          >
            <option value="">Select timezone</option>
            <option value="EST">Eastern</option>
            <option value="CST">Central</option>
            <option value="MST">Mountain</option>
            <option value="PST">Pacific</option>
          </select>
        </div>

        <button
          className="primary-btn"
          disabled={loadingDateTime}
          onClick={handleSaveDateTime}
        >
          SAVE WEBINAR DATE & TIME
        </button>
      </div>

      {/* ================= DETAILS ================= */}
      <div className="card">
        <h3>🎥 Webinar Details</h3>

        {DETAILS_FIELDS.map((field) => (
          <div className="save-row" key={field.key}>
            <div className="field-float">
              <input
                placeholder=" "
                value={form[field.key] || ""}
                onChange={(e) =>
                  updateField(field.key, e.target.value)
                }
              />
              <label>{field.label}</label>
            </div>
          </div>
        ))}

        <button
          className="save-all"
          disabled={loadingDetails}
          onClick={handleSaveDetails}
        >
          SAVE ALL DETAILS
        </button>
      </div>
    </div>
  );
}
