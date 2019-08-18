import React from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const logo = process.env.PUBLIC_URL + "/kcco.png";

class Home extends React.Component {
  async componentDidMount() {
    const { cards } = this.props;
    if (!cards.state.homeCards) {
      cards.readHomeCardsFromCache().finally(() => {
        cards.loadHomeCards();
      });
    } else {
      cards.fetchHomeCards(null, true);
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

  const beenInView = React.useMemo(() => {
    return new Set(JSON.parse(sessionStorage.getItem("beenInView") || "[]"));
  }, []);

  return (
    <div className="content">
      <p style={{ textAlign: "center" }}>
        <img src={logo} alt="Keep Calm and Chive On" />
      </p>
      {cards.map((card, i) => {
        // legacy junk from older storage hacks
        if (!card.id) return null;

        return (
          <Box
            card={card}
            key={card.id}
            startInView={i <= 10 || beenInView.has(card.id)}
          />
        );
      })}
    </div>
  );
}

// XXX I don't think this memo works! Probably because of bad mutations.
const Box = React.memo(({ card, startInView }) => {
  const [beenInView, setBeenInView] = React.useState(startInView);

  const [ref, inView] = useInView({
    /* https://www.npmjs.com/package/react-intersection-observer#options */
    triggerOnce: true
  });
  React.useEffect(() => {
    if (beenInView && !startInView) {
      const rememberedInView = JSON.parse(
        sessionStorage.getItem("beenInView") || "[]"
      );
      rememberedInView.push(card.id);
      sessionStorage.setItem("beenInView", JSON.stringify(rememberedInView));
    }
  }, [beenInView, card, startInView]);
  if (inView && !beenInView) {
    setBeenInView(true);
  }
  return (
    <div className="box" ref={ref}>
      <article className="media">
        <div className="media-content">
          <h3>
            <Link to={`/${card.id}?url=${encodeURIComponent(card.url)}`}>
              {card.text}
            </Link>
          </h3>
          {inView || beenInView ? (
            <Link to={`/${card.id}?url=${encodeURIComponent(card.url)}`}>
              <img src={card.img} alt={card.text} />
            </Link>
          ) : (
            <div className="loading-picture">Loading picture...</div>
          )}
          <br />
          <small>{card.human_time}</small>
        </div>
      </article>
    </div>
  );
});
