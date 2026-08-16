import { useState } from "react";
import { DynamicIcon } from "./icons.jsx";
import { publicUrl } from "../utils/publicUrl.js";
import { t } from "../i18n/index.js";

export default function DeviceMockup({ app }) {
  const [missingImage, setMissingImage] = useState(false);

  return (
    <a href={app.pagePath} className="device-shell block">
      <div className="device-glass">
        <span className="device-speaker" />
        <div className="device-screen">
          {!missingImage && (
            <img
              src={publicUrl(app.screenshot)}
              alt={t.apps.screenshotAlt(app.name, 1)}
              width={320}
              height={693}
              loading="lazy"
              decoding="async"
              onError={() => setMissingImage(true)}
            />
          )}
          {missingImage && (
            <div className="screen-placeholder">
              <div className="screen-topbar">
                <span />
                <span />
              </div>
              <div className="screen-core">
                <DynamicIcon name={app.icon} className="h-12 w-12 text-neon-cyan" />
                <p>{app.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 text-center">
        <p className="font-display text-lg font-bold text-white">{app.name}</p>
        <p className="mt-1 text-sm text-slate-400">{app.tagline}</p>
      </div>
    </a>
  );
}
