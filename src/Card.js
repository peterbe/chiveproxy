import React, { Component } from "react";
import smoothscroll from "smoothscroll-polyfill";

// kick off the polyfill!
// Needed for the sake if iOS Safari
smoothscroll.polyfill();

class Card extends Component {
  async componentDidMount() {
    await this.loadHash();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match.params[0] !== this.props.match.params[0]) {
      await this.loadHash();
    }
  }

  loadHash = async () => {
    window.scrollTo(0, 0);
    const hash = this.props.match.params[0];

    const visitedHashes = JSON.parse(
      localStorage.getItem("visitedHashes") || "{}"
    );
    if (!visitedHashes[hash]) {
      visitedHashes[hash] = new Date();
      localStorage.setItem("visitedHashes", JSON.stringify(visitedHashes));
    }

    const paramsString = this.props.location.search.slice(1);
    const searchParams = new URLSearchParams(paramsString);
    const url = searchParams.get("url");

    const { cards } = this.props;
    if (!cards.state.allCards[hash]) {
      cards.fetchCard(hash, url);
    }
    await cards.setCurrentHash(hash);
  };

  render() {
    const hash = this.props.match.params[0];
    const { cards } = this.props;
    return (
      <div
        className={cards.state.loading ? "is-loading container" : "container"}
      >
        {/* <SimpleNav current={hash} history={this.props.history} /> */}

        {cards.state.loadingError && (
          <article className="message is-danger">
            <div className="message-header">
              <p>Loading Error</p>
              <button className="delete" aria-label="delete" />
            </div>
            <div className="message-body">{cards.state.loadingError}</div>
          </article>
        )}

        {cards.state.cardsNotFound[hash] && <h1>Page Not Found</h1>}
        {cards.state.allCards[hash] && (
          <ShowCard card={cards.state.allCards[hash]} />
        )}
        {/* {cards.state.allCards[hash] && (
          <SimpleNav current={hash} history={this.props.history} />
        )} */}
      </div>
    );
  }
}

export default Card;

class ShowCard extends React.PureComponent {
  componentWillMount() {
    document.title = this.props.card.text;
  }
  render() {
    const { card } = this.props;
    return (
      <div className="content">
        <h2>{card.text}</h2>
        <div className="grid">
          <Grid pictures={card.pictures} />
        </div>
        <div className="pictures">
          {card.pictures.map((picture, i) => {
            return (
              <div className="box" id={`img${i + 1}`} key={picture.img}>
                <article className="media">
                  <div className="media-content">
                    <div className="contentxxx">
                      <Image
                        src={picture.img}
                        gifsrc={picture.gifsrc}
                        caption={card.caption}
                      />

                      {card.caption && <p>{card.caption}</p>}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Grid extends React.PureComponent {
  render() {
    const { pictures } = this.props;
    return (
      <div className="box" style={{ marginBottom: 24 }}>
        {pictures.map((picture, i) => (
          <a
            href={`#img${i + 1}`}
            key={picture.img}
            onClick={event => {
              event.preventDefault();
              const id = event.currentTarget.getAttribute("href").slice(1);
              window.scroll({
                top: document.getElementById(id).offsetTop + 30,
                behavior: "smooth"
              });
            }}
          >
            <img src={picture.img} alt="im" />
          </a>
        ))}
      </div>
    );
  }
}

class Image extends React.PureComponent {
  render() {
    const { src, gifsrc, caption } = this.props;
    return <img src={gifsrc || src} alt={caption || "no caption"} />;
  }
}
