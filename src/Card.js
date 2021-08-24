import React, { useEffect, useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import useSWR from "swr";

import smoothscroll from "smoothscroll-polyfill";

import "./card.scss";

// kick off the polyfill!
// Needed for the sake if iOS Safari
smoothscroll.polyfill();

function fetchWithTimeout(url, options, timeout = 4000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]);
}

function erringFetch(url) {
  return fetchWithTimeout(url).then((r) => {
    if (!r.ok) {
      throw new Error(`${r.status} on ${url}`);
    }
    return r.json();
  });
}

function Card() {
  const [showTopButton, setShowTopButton] = useState(true);

  let { id } = useParams();
  const fetchUrl = useState(`/api/cards/${id}/`);
  const { data, error } = useSWR(fetchUrl, erringFetch, {});

  useEffect(() => {
    if (data) {
      document.title = data.text;
    }
  }, [data]);

  function triggerFullReload() {
    window.location.reload();
  }
  let history = useHistory();

  const [headerRef, headerInView] = useInView();
  useEffect(() => {
    if (!headerInView) {
      if (!showTopButton) {
        setShowTopButton(true);
      }
    } else if (showTopButton) {
      setShowTopButton(false);
    }
  }, [headerInView, showTopButton]);

  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [supportWebShare, setSupportWebShare] = useState(false);
  useEffect(() => {
    if (navigator.share) {
      setSupportWebShare(true);
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    if (shared) {
      setTimeout(() => {
        if (mounted) {
          setShared(false);
        }
      }, 9000);
    }
    return () => {
      mounted = false;
    };
  }, [shared]);

  return (
    <div>
      <nav
        className="navbar is-fixed-top"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <Link
            to="/"
            className="navbar-item"
            onClick={() => {
              window.scroll({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <button
              className={
                !data && !error
                  ? "button is-primary is-loading"
                  : "button is-primary"
              }
            >
              Home
            </button>
          </Link>
          {showTopButton && (
            <Link
              to="/"
              className="navbar-item"
              onClick={(event) => {
                event.preventDefault();
                window.scroll({ top: 0, behavior: "smooth" });
              }}
            >
              <button className="button">⬆ Top</button>
            </Link>
          )}
          {error && (
            <Link
              to="/"
              className="navbar-item"
              onClick={() => {
                window.scroll({ top: 0, behavior: "smooth" });
                triggerFullReload();
              }}
            >
              <button className="button">☠︎ Reload</button>
            </Link>
          )}
          {!error && data && (
            <Link
              to="/"
              className="navbar-item"
              onClick={(event) => {
                if (history.action === "PUSH") {
                  event.preventDefault();
                  history.goBack();
                }
              }}
            >
              <button className="button">⬅ Back</button>
            </Link>
          )}
          {!error && data && supportWebShare && (
            <Link
              to="/"
              className="navbar-item"
              onClick={(event) => {
                event.preventDefault();

                const shareData = {
                  title: "The Chive PWA",
                  text: data.text,
                  url: window.location.href,
                };
                try {
                  navigator
                    .share(shareData)
                    .then(() => {
                      setShared(true);
                      setShareError(null);
                    })
                    .catch((e) => {
                      if (!e.toString().includes("AbortError")) {
                        setShareError(e);
                      }
                    });
                } catch (err) {
                  setShareError(err);
                }
              }}
            >
              <button className="button">{shared ? "Shared" : "Share"}</button>
            </Link>
          )}
        </div>
      </nav>

      <div className={!data && !error ? "is-loading container" : "container"}>
        {!data && !error && (
          <div className="content">
            <h2>Loading...</h2>
          </div>
        )}

        {error && (
          <article className="message is-danger">
            <div className="message-header">
              <p>Loading Error</p>
              <button className="delete" aria-label="delete" />
            </div>
            <div className="message-body">{error.toString()}</div>
          </article>
        )}

        {shareError && (
          <article className="message is-danger">
            <div className="message-header">
              <p>Share Error</p>
              <button
                className="delete"
                aria-label="delete"
                onClick={() => {
                  setShareError(null);
                }}
              />
            </div>
            <div className="message-body">{shareError.toString()}</div>
          </article>
        )}
        {data && <ShowCard card={data} headerRef={headerRef} />}
      </div>
    </div>
  );
}

export default Card;

function ShowCard({ card, headerRef }) {
  if (!card.pictures.length) {
    return (
      <div className="content">
        <h2>{card.text}</h2>
        <article className="message is-danger">
          <div className="message-header">
            <p>No Pictures Error</p>
          </div>
          <div className="message-body">
            Sorry. Something's gone nuts. There are no pictures in this post.
          </div>
        </article>
      </div>
    );
  }
  return (
    <div className="content">
      <h2 ref={headerRef}>{card.text}</h2>
      <div className="grid">
        <Grid pictures={card.pictures} />
      </div>
      <div className="pictures">
        {card.pictures.map((picture, i) => {
          return (
            <PictureBox key={picture.img} i={i} picture={picture} card={card} />
          );
        })}
      </div>
    </div>
  );
}

function iToId(i) {
  return `img${(i + 1).toString().padStart(3, "0")}`;
}

function PictureBox({ i, card, picture }) {
  const id = iToId(i);

  function splitlines(s) {
    return s.split(/\n/g);
  }
  return (
    <div className="box" id={id} key={picture.img}>
      <article className="media">
        <div className="media-content">
          <div>
            <Image
              src={picture.img}
              gifsrc={picture.gifsrc}
              mp4src={picture.mp4src}
              caption={card.caption}
            />
            {picture.caption_html ? (
              <p
                className="caption"
                dangerouslySetInnerHTML={{ __html: picture.caption_html }}
              ></p>
            ) : picture.caption ? (
              <p className="caption">
                {splitlines(picture.caption).map((line, i) => {
                  return [<span key={line}>{line}</span>, <br key={i} />];
                })}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}

const Grid = React.memo(({ pictures }) => {
  return (
    <div className="box" style={{ marginBottom: 24 }}>
      {pictures.map((picture, i) => (
        <a
          href={`#${iToId(i)}`}
          key={picture.img}
          onClick={(event) => {
            event.preventDefault();
            const id = event.currentTarget.getAttribute("href").slice(1);
            const element = document.getElementById(id);
            if (element) {
              window.scroll({
                top: element.offsetTop + 30,
                behavior: "smooth",
              });
            } else {
              console.warn(`No element with id '${id}'`);
            }
          }}
        >
          <img src={picture.img} alt="im" />
        </a>
      ))}
    </div>
  );
});

const Image = React.memo(({ src, gifsrc, mp4src, caption }) => {
  const { ref, inView } = useInView();
  if (mp4src) {
    return (
      <video
        ref={ref}
        autoPlay={inView}
        loop
        muted
        controls={true}
        poster={src}
      >
        <source src={mp4src} type="video/mp4" />
      </video>
    );
  } else {
    return (
      <img src={gifsrc || src} alt={caption || "no caption"} loading="lazy" />
    );
  }
});
