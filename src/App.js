import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { Provider } from "unstated";
import { Subscribe } from "unstated";
import { CardsContainer } from "./State";
import Home from "./Home";
import Card from "./Card";

let cards = new CardsContainer();

class App extends React.Component {
  render() {
    return (
      <Provider inject={[cards]}>
        <Router>
          <Subscribe to={[CardsContainer]}>
            {cards => (
              <div>
                {/* <Nav nextCard={cards.state.nextCard} /> */}
                <Route
                  path="/"
                  render={props => <Nav cards={cards} {...props} />}
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

class Nav extends React.PureComponent {
  render() {
    const {
      cards: {
        state: { nextCard = null }
      },
      history,
      location
    } = this.props;
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
          {nextCard && (
            <Link
              to={`/${nextCard.uri}?url=${encodeURIComponent(nextCard.url)}`}
              className="navbar-item"
            >
              <button className="button">Next ➡</button>
            </Link>
          )}
        </div>
      </nav>
    );
  }
}
