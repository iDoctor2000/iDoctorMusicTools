import { useState } from "react";
import { DynamicIcon } from "./icons.jsx";
import { publicUrl } from "../utils/publicUrl.js";
import { t } from "../i18n/index.js";

/**
 * Maqueta de dispositivo con la captura de una app.
 *
 * `device` decide la silueta y la proporción de la pantalla:
 *   · "iphone" (por defecto) → marco alto 9:19,5
 *   · "ipad"                 → marco 3:4 (clase .tablet-shell), sin altavoz
 *
 * `src` permite pintar una captura concreta (las de iPad son varias por app);
 * si no se pasa, se usa la portada `app.screenshot`. `index` solo alimenta el
 * texto alternativo, para que cada imagen se anuncie con su número.
 */
export default function DeviceMockup({ app, device = "iphone", src, index = 1 }) {
  const [missingImage, setMissingImage] = useState(false);
  const isTablet = device === "ipad";
  const image = src || app.screenshot;

  return (
    <a href={app.pagePath} className={`device-shell block${isTablet ? " tablet-shell" : ""}`}>
      <div className="device-glass">
        {!isTablet && <span className="device-speaker" />}
        <div className="device-screen">
          {!missingImage && image && (
            <img
              src={publicUrl(image)}
              alt={t.apps.screenshotAlt(app.name, index)}
              width={isTablet ? 1199 : 320}
              height={isTablet ? 1600 : 693}
              loading="lazy"
              decoding="async"
              onError={() => setMissingImage(true)}
            />
          )}
          {(missingImage || !image) && (
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
        {!isTablet && <p className="mt-1 text-sm text-slate-400">{app.tagline}</p>}
      </div>
    </a>
  );
}
