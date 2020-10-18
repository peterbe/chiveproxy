import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { useInView } from "react-intersection-observer";
import smoothscroll from "smoothscroll-polyfill";
const logo = process.env.PUBLIC_URL + "/kcco.png";

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

function Home() {
  const [showTopButton, setShowTopButton] = useState(true);

  const [since, setSince] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const getFetchUrl = useCallback(() => {
    const sp = new URLSearchParams();
    if (since) {
      sp.set("since", since);
    }
    if (search) {
      sp.set("search", search);
    }
    const queryString = sp.toString();
    const base = "/api/cards/";
    if (queryString) {
      return base + "?" + queryString;
    }
    return base;
  }, [since, search]);

  const { data, error, mutate } = useSWR(getFetchUrl(), erringFetch);

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

  function submitSearch(event) {
    event.preventDefault();
    setSearch(searchInput);
  }

  function clearSearch(event) {
    event.preventDefault();
    setSearch("");
  }

  function triggerFullReload() {
    window.location.reload();
  }
  function triggerReload() {
    mutate();
  }
  function triggerNextPage() {
    let last = data.cards[data.cards.length - 1];
    setSince(last.created);
  }

  if (error) {
    return (
      <article className="message is-danger">
        <div className="message-header">
          <p>Loading Error</p>
          <button
            className="delete"
            aria-label="delete"
            onClick={(event) => {
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
            onClick={(event) => {
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

  const loading = !error && !data;

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
            onClick={(event) => {
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
          {!showTopButton && data && (
            <Link
              to="/"
              className="navbar-item"
              onClick={(event) => {
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
        <div className="box">
          <form onSubmit={submitSearch}>
            <div className="field has-addons">
              <p className="control is-expanded">
                <input
                  className="input"
                  type="search"
                  placeholder="Search..."
                  value={searchInput}
                  disabled={loading}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                  }}
                />
              </p>
              <p className="control">
                <button className="button is-info">Search</button>
              </p>
            </div>
            {data && data.search && (
              <p>
                Found {data.search.count} matches{" "}
                <button type="button" className="button" onClick={clearSearch}>
                  Clear
                </button>
              </p>
            )}
          </form>
        </div>
        {loading && (
          <div className="box is-loading">
            <article className="media is-loading">
              <p>Loading...</p>
            </article>
          </div>
        )}
        {data && <ShowCards cards={data.cards} />}
        {data && (
          <p>
            <button
              className="button is-medium is-fullwidth"
              type="button"
              onClick={(event) => {
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
