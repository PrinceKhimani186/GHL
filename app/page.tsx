"use client";
import { useEffect, useState } from "react";

const FIELD_MAP = [
  { label: "City", key: "city" },
  { label: "Zoom Link", key: "1__zoom_link" },
  { label: "Webinar Host", key: "webinar_host" },
  { label: "Webinar Host Email", key: "webinar_host_email" },
  { label: "Domain Name", key: "domain_name" },
];

export default function Page() {
  const [form, setForm] = useState<Record<string, string>>({
    webinar_date: "2025-12-27",
    webinar_time: "",
    timezone: "",
    city: "",
    "1__zoom_link": "",
    webinar_host: "",
    webinar_host_email: "",
    domain_name: "",
  });

  const [customValueIds, setCustomValueIds] = useState<Record<string, string>>(
    {}
  );

  const [loading, setLoading] = useState(false);

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
     PUT: UPDATE CUSTOM VALUES
     ========================= */
  const saveCustomValues = async (
    updates: { id: string; value: string, name: string}[]
  ) => {
    setLoading(true);
    try {
      console.log(updates);
      await fetch("/api/ghl/customValues", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      alert("Saved successfully");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSingle = (fieldKey: string) => {
    const id = customValueIds[fieldKey];
    if (!id) return;

    saveCustomValues([{ id, value: form[fieldKey], name: form[fieldKey] }]);
  };

  const handleSaveAll = () => {
    const updates = FIELD_MAP.map((f) => {
      console.log("f =>", form[f.label], "f =>", form)
      const id = customValueIds[f.key];
      if (!id) return null;
      return { id, value: form[f.key],name : f.key};
    }).filter(Boolean) as { id: string; name: string; value: string }[];

    console.log("updates ==>", updates)
    saveCustomValues(updates);
  };

  return (
    <div className="webinar-grid">
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
      </div>

      <div className="card">
        <h3>🎥 Webinar Details</h3>

        {FIELD_MAP.map((field) => (
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

            <button
              className="save-btn"
              disabled={loading || !customValueIds[field.key]}
              onClick={() => handleSaveSingle(field.key)}
            >
              SAVE
            </button>
          </div>
        ))}

        <button
          className="save-all"
          disabled={loading}
          onClick={handleSaveAll}
        >
          SAVE ALL DETAILS
        </button>
      </div>
    </div>
  );
}
