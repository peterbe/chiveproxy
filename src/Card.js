import React, { Component } from "react";
import Observer from "react-intersection-observer";
import smoothscroll from "smoothscroll-polyfill";
import { Subscribe } from "unstated";
import "intersection-observer";

import "./card.scss";
import { BoxInViewContainer } from "./State";

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
    // await cards.setCurrentHash(hash);
  };

  render() {
    const hash = this.props.match.params[0];
    const { cards } = this.props;
    return (
      <div
        className={cards.state.loading ? "is-loading container" : "container"}
      >
        {cards.state.loading && (
          <div className="content">
            <h2>Loading...</h2>
          </div>
        )}
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

class ShowCardInner extends React.PureComponent {
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
              <PictureBox
                key={picture.img}
                i={i}
                picture={picture}
                card={card}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

class ShowCard extends React.Component {
  render() {
    const props = this.props;
    return (
      <Subscribe to={[BoxInViewContainer]}>
        {inview => <ShowCardInner inview={inview} {...props} />}
      </Subscribe>
    );
  }
}

function iToId(i) {
  return `img${(i + 1).toString().padStart(3, "0")}`;
}

class PictureBox extends React.PureComponent {
  render() {
    const { i, card, picture } = this.props;
    const id = iToId(i);
    return (
      <Subscribe to={[BoxInViewContainer]}>
        {inView => (
          <div className="box" id={id} key={picture.img}>
            <Observer
              onChange={isInView => {
                if (window.scrollY > 0) {
                  inView.set(id, isInView);
                } else {
                  inView.reset();
                }
              }}
            >
              <article className="media">
                <div className="media-content">
                  <div>
                    <Image
                      src={picture.img}
                      gifsrc={picture.gifsrc}
                      caption={card.caption}
                    />
                    {picture.caption && (
                      <p className="caption">{picture.caption}</p>
                    )}
                  </div>
                </div>
              </article>
            </Observer>
          </div>
        )}
      </Subscribe>
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
            href={`#${iToId(i)}`}
            key={picture.img}
            onClick={event => {
              event.preventDefault();
              const id = event.currentTarget.getAttribute("href").slice(1);
              const element = document.getElementById(id);
              if (element) {
                window.scroll({
                  top: element.offsetTop + 30,
                  behavior: "smooth"
                });
              } else {
                console.warn(`No element with id '${id}'`);
              }
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
