import React, { Component } from "react";

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

// class SimpleNav extends React.PureComponent {
//   render() {
//     // const { current } = this.props;
//     const { history } = this.props;
//     return (
//       <nav className="level is-mobile">
//         {/* {current && (
//           <p className="level-item has-text-centered">
//             <Link to={`/${current}/previous`} className="link is-info">
//               Previous
//             </Link>
//           </p>
//         )} */}
//         <p className="level-item has-text-centered">
//           {history.action === "PUSH" ? (
//             <Link
//               to="/"
//               className="button is-info"
//               onClick={event => {
//                 event.preventDefault();
//                 history.goBack();
//               }}
//             >
//               Go Back
//             </Link>
//           ) : (
//             <Link to="/" className="button is-info">
//               Home
//             </Link>
//           )}
//         </p>
//         {/* {current && (
//           <p className="level-item has-text-centered">
//             <Link to={`/${current}/next`} className="link is-info">
//               Next
//             </Link>
//           </p>
//         )} */}
//       </nav>
//     );
//   }
// }
class ShowCard extends React.PureComponent {
  componentWillMount() {
    document.title = this.props.card.text;
  }
  render() {
    const { card } = this.props;
    return (
      <div className="content">
        <h2>{card.text}</h2>
        <div className="pictures">
          {card.pictures.map(picture => {
            return (
              <div className="box" key={picture.img}>
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

class Image extends React.PureComponent {
  // async componentDidMount() {
  //   const { gifsrc } = this.props;
  //   console.log('COULD PRELOAD', gifsrc);
  // }
  render() {
    const { src, gifsrc, caption } = this.props;
    // if (gifsrc) {
    //   return (
    //     <img src={src} className="is-overlay" alt={caption || 'no caption'} />
    //   );
    // } else {
    //   return <img src={src} alt={caption || 'no caption'} />;
    // }
    return <img src={gifsrc || src} alt={caption || "no caption"} />;
  }
}
