import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle } from "../../components/PageTitle";

const BASE = import.meta.env.BASE_URL;
const VIDEO_SRC = `${BASE}video/palabrita-erklaervideo.mp4`;
const POSTER_SRC = `${BASE}video/palabrita-erklaervideo-poster.jpg`;

export function Video() {
  // Das Video wird nicht offline vorgehalten (SPEC §14.6): ohne Netz kommt ein Hinweis.
  const [failed, setFailed] = useState(false);
  return (
    <div className="screen video-page">
      <Link to="/more" className="back">
        ← Mehr
      </Link>
      <PageTitle>Erklärvideo</PageTitle>
      <p className="muted">
        In gut einer Minute siehst du, wie Palabrita funktioniert: Lernen,
        Verzeichnis, Formsuche und Statistik.
      </p>
      <div className="video-frame">
        {/* preload="none": Die Datei lädt erst beim Abspielen. */}
        <video
          className="video-player"
          controls
          playsInline
          preload="none"
          poster={POSTER_SRC}
          src={VIDEO_SRC}
          onError={() => setFailed(true)}
          onPlaying={() => setFailed(false)}
        >
          Dein Browser kann das Video nicht abspielen.
        </video>
      </div>
      {failed && (
        <p className="notice" role="alert">
          Das Video lässt sich gerade nicht laden. Prüfe deine
          Internetverbindung und versuche es noch einmal.
        </p>
      )}
      <p className="muted video-meta">Sprecher und Stimme sind KI-erzeugt.</p>
      <p className="muted video-credit">
        Musik: „Vibrant Momentum (Energetic Track for Engaging Content)“ von{" "}
        <a
          href="https://freesound.org/people/LolaMoore/sounds/762602"
          target="_blank"
          rel="noreferrer"
        >
          LolaMoore
        </a>
        , Lizenz{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
        . Für das Video gekürzt, ein- und ausgeblendet und in der Lautstärke
        angepasst.
      </p>
    </div>
  );
}
