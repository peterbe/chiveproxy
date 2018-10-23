import ky from "ky";
import { Container } from "unstated";

export class CardsContainer extends Container {
  state = {
    homeCards: null,
    allCards: {},
    cardsNotFound: [],
    loading: true,
    loadingError: null,
    nextCard: null,
    prevCard: null
  };

  fetchHomeCards = async () => {
    const response = await ky("/api/cards/");
    if (response.ok) {
      const data = await response.json();
      this.setState({
        homeCards: data.cards,
        loading: false,
        loadingError: null
      });
    } else {
      this.setState({
        loading: false,
        loadingError: `${
          response.status
        } trying to load all the home page cards.`
      });
    }
  };

  fetchCard = async (hash, url) => {
    const response = await ky(`/api/cards/${hash}/?url=${url}`);
    if (response.status === 404) {
      this.setState(state => {
        return {
          cardsNotFound: [...state.cardsNotFound, hash],
          loading: false,
          loadingError: null
        };
      });
    } else if (response.ok) {
      const data = await response.json();
      this.setState({
        loading: false,
        loadingError: null,
        allCards: Object.assign({ [hash]: data }, this.state.allCards)
      });
    } else {
      this.setState({
        loading: false,
        loadingError: `${response.status} trying to load ${url}`
      });
    }
  };

  setCurrentHash = async hash => {
    if (!hash) {
      this.setState({
        nextCard: null,
        prevCard: null
      });
    } else {
      if (!this.state.homeCards) {
        await this.fetchHomeCards();
        this.setCurrentHash(hash);
      } else {
        let prevCard = null;
        let nextCard = null;
        const currentIndex = this.state.homeCards.findIndex(
          card => card.uri === hash
        );
        if (currentIndex > 0) {
          prevCard = this.state.homeCards[currentIndex - 1];
        }
        nextCard = this.state.homeCards[currentIndex + 1];
        this.setState({ nextCard, prevCard });
      }
    }
  };
}
