import { useState } from "react";
import { DynamicIcon } from "./icons.jsx";
import { publicUrl } from "../utils/publicUrl.js";

export default function DeviceMockup({ app, size = "phone" }) {
  const [missingImage, setMissingImage] = useState(false);
  const isTablet = size === "tablet";

  return (
    <article className={isTablet ? "device-shell tablet-shell" : "device-shell"}>
      <div className="device-glass">
        <span className="device-speaker" />
        <div className="device-screen">
          {!missingImage && (
            <img
              src={publicUrl(app.screenshot)}
              alt={`Captura de ${app.name}`}
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
              <div className="mini-wave" aria-hidden="true">
                {Array.from({ length: 18 }, (_, index) => (
                  <span key={index} style={{ "--i": index }} />
                ))}
              </div>
              <p className="screen-path">{app.screenshot}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 text-center">
        <p className="font-display text-lg font-bold text-white">{app.name}</p>
        <p className="mt-1 text-sm text-slate-400">{app.tagline}</p>
      </div>
    </article>
  );
}
