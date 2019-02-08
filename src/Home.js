import React from "react";
import { Link } from "react-router-dom";
import logo from "./kcco.png";

class Home extends React.Component {
  async componentDidMount() {
    const { cards } = this.props;
    if (!cards.state.homeCards) {
      cards.readHomeCardsFromCache().finally(() => {
        cards.loadHomeCards();
      });
    } else {
      cards.fetchHomeCards();
    }
  }

  async componentDidUpdate() {
    if (this.props.history.action === "PUSH") {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { cards } = this.props;
    return (
      <div
        className={cards.state.loading ? "is-loading container" : "container"}
      >
        {cards.state.loadingError && (
          <article className="message is-danger">
            <div className="message-header">
              <p>Loading Error</p>
              <button
                className="delete"
                aria-label="delete"
                onClick={event => {
                  cards.loadHomeCards();
                  // cards.setState({ loadingError: null });
                }}
              />
            </div>
            <div className="message-body">{cards.state.loadingError}</div>
          </article>
        )}
        {/* {cards.state.updating && (
          <article className="message is-info">
            <div className="message-header">
              <p>Updating...</p>
              <button
                className="delete"
                type="button"
                aria-label="delete"
                onClick={event => {
                  cards.setState({ updating: false });
                }}
              />
            </div>
            <div className="message-body">
              Hold your bananas! The server is updating.
            </div>
          </article>
        )} */}
        {cards.state.homeCards && <ShowCards cards={cards.state.homeCards} />}
        {cards.state.homeCards && (
          <p>
            <button
              className="button is-medium is-fullwidth"
              type="button"
              onClick={event => {
                cards.fetchMore();
              }}
            >
              Load Moar!
            </button>
            >
          </p>
        )}
      </div>
    );
  }
}

export default Home;

function ShowCards({ cards }) {
  React.useEffect(() => {
    document.title = `(${cards.length}) Posts`;
  });

  return (
    <div className="content">
      <p style={{ textAlign: "center" }}>
        <img src={logo} alt="Keep Calm and Chive On" />
      </p>
      {cards.map(card => {
        return (
          <div className="box" key={card.id}>
            <article className="media">
              <div className="media-content">
                <h3>
                  <Link to={`/${card.id}?url=${encodeURIComponent(card.url)}`}>
                    {card.text}
                  </Link>
                </h3>
                <Link to={`/${card.id}?url=${encodeURIComponent(card.url)}`}>
                  <img src={card.img} alt={card.text} />
                </Link>
                <br />
                <small>{card.human_time}</small>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
