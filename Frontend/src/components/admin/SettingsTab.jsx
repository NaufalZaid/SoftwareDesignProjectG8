// SettingsTab.jsx - Platform settings tab component
import { useEffect, useState } from "react";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "../../services/adminApi";

function SettingsTab() {
  // =========================
  // PLATFORM SETTINGS STATE
  // =========================
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsRaw, setSettingsRaw] = useState(""); // JSON editor string
  const [settingsObj, setSettingsObj] = useState(null);

  const loadSettings = async () => {
    setSettingsError("");
    setSettingsObj(null);
    setSettingsRaw("");
    setSettingsLoading(true);

    try {
      const data = await getPlatformSettings();
      setSettingsObj(data);
      setSettingsRaw(JSON.stringify(data, null, 2));
    } catch (e) {
      setSettingsError(e.message || "Failed to load platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSettingsAction = async () => {
    let payload;
    try {
      payload = JSON.parse(settingsRaw);
    } catch {
      alert("Invalid JSON. Fix the JSON in the editor before saving.");
      return;
    }

    setSettingsLoading(true);
    setSettingsError("");

    try {
      const data = await updatePlatformSettings(payload);

      // backend might return updated settings (object) or a message (string)
      if (data && typeof data === "object") {
        setSettingsObj(data);
        setSettingsRaw(JSON.stringify(data, null, 2));
      }

      alert("Platform settings updated.");
    } catch (e) {
      setSettingsError(e.message || "Failed to update platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="card">
      <h2 className="sectionTitle">Platform Settings</h2>
      <div className="helpText">
        GET current settings from <code>/api/v1/admin/settings</code>. Update via{" "}
        <code>PUT /api/v1/admin/settings/update</code>.
      </div>

      <div className="row">
        <button className="secondaryBtn" onClick={loadSettings} disabled={settingsLoading}>
          {settingsLoading ? "Loading..." : "Reload Settings"}
        </button>
        <button className="primaryBtn" onClick={updateSettingsAction} disabled={settingsLoading || !settingsRaw}>
          Save Settings
        </button>
      </div>

      {settingsError ? <div className="errorBox">{settingsError}</div> : null}

      <div style={{ marginTop: 12 }}>
        <div className="smallLabel">Edit Settings JSON</div>
        <textarea
          value={settingsRaw}
          onChange={(e) => setSettingsRaw(e.target.value)}
          placeholder="Settings JSON will appear here after loading..."
          className="textarea"
        />
      </div>

      {settingsObj && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer" }}>Current Settings (read-only view)</summary>
          <pre className="pre">{JSON.stringify(settingsObj, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

export default SettingsTab;
