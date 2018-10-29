import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import { CardsContainer, BoxInViewContainer } from "./State";
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
                <section className="section">
                  <Switch>
                    <Route
                      path="/"
                      exact
                      render={props => <Home cards={cards} {...props} />}
                    />
                    <Route
                      path="/([a-f0-9]{8})/(previous|next)"
                      render={props => <Home cards={cards} {...props} />}
                    />
                    <Route
                      path="/([a-f0-9]{8})"
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

class DisplayVersion extends React.PureComponent {
  getVersionData = () => {
    const element = document.querySelector("#_version");
    return Object.assign({}, element.dataset);
  };

  render() {
    const data = this.getVersionData();
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
  }
}
class Nav extends React.PureComponent {
  render() {
    const { history, location, inview } = this.props;
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
          <Link to="/" className="navbar-item">
            <button className="button is-primary">Home</button>
          </Link>
          {history.action === "PUSH" &&
            location.pathname !== "/" && (
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
  }
}
