import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { useInView } from "react-intersection-observer";
import smoothscroll from "smoothscroll-polyfill";
const logo = process.env.PUBLIC_URL + "/kcco.png";

// kick off the polyfill!
// Needed for the sake if iOS Safari
smoothscroll.polyfill();

function erringFetch(url) {
  return fetch(url).then(r => {
    if (!r.ok) {
      throw new Error(`${r.status} on ${url}`);
    }
    return r.json();
  });
}

function Home() {
  const [showTopButton, setShowTopButton] = useState(true);

  const [fetchUrl, setFetchUrl] = useState("/api/cards/");
  const { data, error } = useSWR(fetchUrl, erringFetch);

  React.useEffect(() => {
    if (data && data.cards) {
      document.title = `(${data.cards.length}) Posts`;
    }
  }, [data]);

  const [logoRef, logoInView] = useInView();
  useEffect(() => {
    if (!logoInView) {
      if (!showTopButton) {
        setShowTopButton(true);
      }
    } else if (showTopButton) {
      setShowTopButton(false);
    }
  }, [logoInView, showTopButton]);

  function triggerFullReload() {
    window.location.reload();
  }
  function triggerReload() {
    setFetchUrl(`/api/cards/?r=${Math.random()}`);
  }
  function triggerNextPage() {
    let sp = new URLSearchParams();
    let last = data.cards[data.cards.length - 1];
    sp.set("since", last.created);
    setFetchUrl(`/api/cards/?${sp.toString()}`);
  }

  if (error) {
    return (
      <article className="message is-danger">
        <div className="message-header">
          <p>Loading Error</p>
          <button
            className="delete"
            aria-label="delete"
            onClick={event => {
              event.preventDefault();
              triggerFullReload();
            }}
          />
        </div>
        <div className="message-body">
          {error.toString()}
          <br />
          <Link
            to="/"
            className="button"
            onClick={event => {
              window.scroll({ top: 0, behavior: "smooth" });
              triggerFullReload();
            }}
          >
            ☠︎ Reload
          </Link>
        </div>
      </article>
    );
  }

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
            onClick={event => {
              window.scroll({
                top: 0,
                behavior: "smooth"
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
              onClick={event => {
                event.preventDefault();
                window.scroll({ top: 0, behavior: "smooth" });
              }}
            >
              <button className="button">⬆ Top</button>
            </Link>
          )}
          {!showTopButton && data && (
            <Link
              to="/"
              className="navbar-item"
              onClick={event => {
                window.scroll({ top: 0, behavior: "smooth" });
                triggerReload();
              }}
            >
              <button className="button">♺ Refresh</button>
            </Link>
          )}
        </div>
      </nav>
      <div className="content">
        <p style={{ textAlign: "center" }} ref={logoRef}>
          <img src={logo} alt="Keep Calm and Chive On" />
        </p>
        {data ? (
          <ShowCards cards={data.cards} />
        ) : (
          <div className="box is-loading">
            <article className="media is-loading">
              <p>Loading...</p>
            </article>
          </div>
        )}

        {data && (
          <p>
            <button
              className="button is-medium is-fullwidth"
              type="button"
              onClick={event => {
                triggerNextPage();
              }}
            >
              Load Moar!
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;

function ShowCards({ cards }) {
  if (!cards.length) {
    return <b>No cards. Weird!</b>;
  } else {
    return cards.map((card, i) => {
      // legacy junk from older storage hacks
      if (!card.id) return null;

      return <Box card={card} key={card.id} />;
    });
  }
}

function Box({ card }) {
  return (
    <div className="box">
      <article className="media">
        <div className="media-content">
          <h3>
            <Link to={`/${card.id}`}>{card.text}</Link>
          </h3>
          <Link to={`/${card.id}`}>
            <img src={card.img} alt={card.text} />
          </Link>

          <br />
          <small>{card.human_time}</small>
        </div>
      </article>
    </div>
  );
}
