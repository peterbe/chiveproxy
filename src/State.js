import ky from "ky";
import { Container } from "unstated";

export class CardsContainer extends Container {
  state = {
    homeCards: null,
    allCards: {},
    cardsNotFound: [],
    loading: true,
    loadingError: null
    // nextCard: null
    // prevCard: null
  };

  fetchHomeCards = async () => {
    this.setState({ loading: true });
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
}

export class BoxInViewContainer extends Container {
  state = {
    inView: {},
    recording: true
  };
  reset = () => {
    this.setState({ inView: {}, recording: true });
  };

  stopRecording = () => {
    this.setState({ recording: false });
  };

  set = (id, is) => {
    if (this.state.recording) {
      console.log(id, is);
      const inView = Object.assign({}, this.state.inView);
      inView[id] = is;
      this.setState({ inView });
    }
  };
}
