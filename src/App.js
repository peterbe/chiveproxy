import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import { CardsContainer, BoxInViewContainer } from "./State";
// XXX I really need to figure out how to import into namespaces
import { clear, get } from "idb-keyval";
import Home from "./Home";
import Card from "./Card";

let cards = new CardsContainer();
let inview = new BoxInViewContainer();

class App extends React.Component {
  render() {
    return (
      <Provider inject={[cards, inview]}>
        <Router>
          <Subscribe to={[CardsContainer, BoxInViewContainer]}>
            {(cards, inview) => (
              <div>
                {/* <Nav nextCard={cards.state.nextCard} /> */}
                <Route
                  path="/"
                  render={props => (
                    <Nav cards={cards} inview={inview} {...props} />
                  )}
                />
                <Debugging cards={cards} />
                <section className="section">
                  <Switch>
                    <Route
                      path="/"
                      exact
                      render={props => <Home cards={cards} {...props} />}
                    />
                    <Route
                      path="/(\d+)/(previous|next)"
                      render={props => <Home cards={cards} {...props} />}
                    />
                    <Route
                      path="/(\d+)"
                      render={props => <Card cards={cards} {...props} />}
                    />
                    <Route component={NoMatch} />
                  </Switch>
                </section>
                <DisplayVersion />
              </div>
            )}
          </Subscribe>
        </Router>
      </Provider>
    );
  }
}

export default App;

const NoMatch = ({ location }) => (
  <div>
    <h3>
      No match for <code>{location.pathname}</code>
    </h3>
  </div>
);

function Debugging({ cards }) {
  const [keysCount, setKeysCount] = React.useState(null);
  const [clearSure, setClearSure] = React.useState(false);
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  get("home").then(val => {
    setKeysCount(val ? val.length : 0);
  });
  // if (cards.state.homeCards) {
  //   console.log("homeCards:", cards.state.homeCards.slice(0, 4).map(c => c.id));
  // }
  // if (cards.state.newCards) {
  //   console.log("newCards:", cards.state.newCards.slice(0, 4).map(c => c.id));
  // }
  return (
    <div id="debugging">
      <h4 className="title is-4">Debugging</h4>
      <table className="table">
        <tbody>
          <tr>
            <th>state.homeCards:</th>
            <td>
              {cards.state.homeCards ? cards.state.homeCards.length : "none"}
            </td>
          </tr>
          <tr>
            <th>state.newCards:</th>
            <td>
              {cards.state.newCards ? cards.state.newCards.length : "none"}
            </td>
          </tr>
          <tr>
            <th>idb cards:</th>
            <td>{keysCount !== null ? keysCount : "none"}</td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        className={clearSure ? "button is-danger" : "button is-warning"}
        onClick={e => {
          if (!clearSure) {
            setClearSure(true);
          } else {
            clear();
            console.warn("CLEARED");
            setClearSure(false);
          }
        }}
      >
        {clearSure !== false ? "Sure?" : "Clear IndexedDB?"}
      </button>
    </div>
  );
}

const DisplayVersion = React.memo(() => {
  const element = document.querySelector("#_version");
  const data = Object.assign({}, element.dataset);
  return (
    <p className="version-info">
      <a
        href="https://github.com/peterbe/chiveproxy"
        target="_blank"
        rel="noopener noreferrer"
      >
        ChiveProxy
      </a>
      <br />
      Version{" "}
      <a
        href={`https://github.com/peterbe/chiveproxy/commit/${data.commit}`}
        title={data.date}
      >
        {data.commit.slice(0, 7)}
      </a>{" "}
      {data.date}
    </p>
  );
});

const Nav = React.memo(({ history, location, inview, cards }) => {
  let showTopButton = false;
  if (window.scrollY > 0) {
    showTopButton = Object.values(inview.state.inView).some(x => x);
  }
  return (
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
            if (this.reloadCardsTimer) {
              window.clearTimeout(this.reloadCardsTimer);
            }
            this.reloadCardsTimer = window.setTimeout(() => {
              this.props.cards.fetchHomeCards();
            }, 1000);
          }}
        >
          <button className="button is-primary">Home</button>
        </Link>
        {cards.state.loading && <span>Loading...</span>}
        {cards.state.loadingError && (
          <Link
            to="/"
            className="navbar-item"
            onClick={event => {
              event.preventDefault();
              cards.setState({ loadingError: null }, () => {
                cards.fetchHomeCards();
              });
            }}
          >
            <button className="button">☠︎ Reload</button>
          </Link>
        )}
        {history.action === "PUSH" && location.pathname !== "/" && (
          <Link
            to="/"
            className="navbar-item"
            onClick={event => {
              event.preventDefault();
              history.goBack();
            }}
          >
            <button className="button">⬅ Go back</button>
          </Link>
        )}
        {showTopButton && (
          <Link
            to={location.pathname}
            className="navbar-item"
            onClick={event => {
              event.preventDefault();
              inview.stopRecording();
              window.scroll({ top: 0, behavior: "smooth" });
              setTimeout(inview.reset, 1000);
            }}
          >
            <button className="button">⬆ Top</button>
          </Link>
        )}
      </div>
    </nav>
  );
});
