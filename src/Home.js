import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "./kcco.png";

class Home extends Component {
  // state = {
  //   cards: null,
  //   loading: true,
  //   redirectTo: null
  // };

  async componentDidMount() {
    const { cards } = this.props;
    if (!cards.state.homeCards) {
      cards.fetchHomeCards();
    }
    await cards.setCurrentHash(null);
  }

  render() {
    const { cards } = this.props;
    return (
      <div
        className={cards.state.loading ? "is-loading container" : "container"}
      >
        {cards.state.homeCards && <ShowCards cards={cards.state.homeCards} />}
      </div>
    );
  }
}

export default Home;

class ShowCards extends React.PureComponent {
  componentWillMount() {
    document.title = `(${this.props.cards.length}) Posts`;
  }
  render() {
    const { cards } = this.props;
    return (
      <div className="content">
        <p style={{ textAlign: "center" }}>
          <img src={logo} alt="Keep Calm and Chive On" />
        </p>
        {cards.map(card => {
          return (
            <div className="box" key={card.uri}>
              <article className="media">
                <div className="media-content">
                  <h3>
                    <Link
                      to={`/${card.uri}?url=${encodeURIComponent(card.url)}`}
                    >
                      {card.text}
                    </Link>
                  </h3>
                  <Link to={`/${card.uri}?url=${encodeURIComponent(card.url)}`}>
                    <img src={card.img} alt={card.text} />
                  </Link>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    );
  }
}
