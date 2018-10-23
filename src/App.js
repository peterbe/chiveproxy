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
                {/* <Nav cards={cards} /> */}
                <Nav
                  nextCard={cards.state.nextCard}
                  prevCard={cards.state.prevCard}
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

// class Nav extends React.PureComponent {
//   state = { open: false };
//   render() {
//     const { nextCard, prevCard, allCards } = this.props;
//     return (
//       <nav className="navbar" role="navigation" aria-label="main navigation">
//         <div className="navbar-brand">
//           <Link to="/" className="navbar-item">
//             <button className="button">Home</button>
//           </Link>
//           {prevCard && (
//             <Link
//               to={`/${prevCard.uri}?url=${encodeURIComponent(prevCard.url)}`}
//               className="navbar-item"
//             >
//               <button className="button">Previous</button>
//             </Link>
//           )}
//           {nextCard && (
//             <Link
//               to={`/${nextCard.uri}?url=${encodeURIComponent(nextCard.url)}`}
//               className="navbar-item"
//             >
//               <button className="button">Next</button>
//             </Link>
//           )}
//           <a
//             href="/"
//             role="button"
//             className={
//               this.state.open
//                 ? "is-active navbar-burger burger"
//                 : "navbar-burger burger"
//             }
//             aria-label="menu"
//             aria-expanded="false"
//             data-target="navbarBasicExample"
//             onClick={event => {
//               event.preventDefault();
//               this.setState({ open: !this.state.open });
//             }}
//           >
//             <span aria-hidden="true" />
//             <span aria-hidden="true" />
//             <span aria-hidden="true" />
//           </a>
//         </div>

//         <div
//           id="navbarBasicExample"
//           className={this.state.open ? "is-active navbar-menu" : "navbar-menu"}
//         >
//           <div className="navbar-start">
//             <Link to="/" className="navbar-item">
//               Home
//             </Link>
//             {/* <a className="navbar-item">Documentation</a> */}
//           </div>

//           <div className="navbar-end">
//             <div className="navbar-item">
//               {/* <div class="buttons">
//           <a class="button is-primary">
//             <strong>Sign up</strong>
//           </a>
//           <a class="button is-light">
//             Log in
//           </a>
//         </div> */}
//             </div>
//           </div>
//         </div>
//       </nav>
//     );
//   }
// }
class Nav extends React.PureComponent {
  state = { open: false };
  render() {
    const { nextCard, prevCard } = this.props;
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
          {prevCard && (
            <Link
              to={`/${prevCard.uri}?url=${encodeURIComponent(prevCard.url)}`}
              className="navbar-item"
            >
              <button className="button">Previous</button>
            </Link>
          )}
          {nextCard && (
            <Link
              to={`/${nextCard.uri}?url=${encodeURIComponent(nextCard.url)}`}
              className="navbar-item"
            >
              <button className="button">Next</button>
            </Link>
          )}
        </div>
      </nav>
    );
  }
}
