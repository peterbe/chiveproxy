import ky from "ky";
import { get, set } from "idb-keyval";
import { Container } from "unstated";

export class CardsContainer extends Container {
  state = {
    homeCards: null,
    allCards: {},
    cardsNotFound: [],
    loading: true,
    loadingError: null
  };

  fetchHomeCards = async () => {
    this.setState({ loading: true });
    let response;
    try {
      response = await ky("/api/cards/");
    } catch (ex) {
      console.warn(ex);
      return this.setState({
        loading: false,
        loadingError: ex.toString()
      });
    }
    if (response.ok) {
      const data = await response.json();
      this.setState(
        {
          homeCards: data.cards,
          loading: false,
          loadingError: null
        },
        this.persistHomeCards
      );
    } else {
      this.setState({
        loading: false,
        loadingError: `${
          response.status
        } trying to load all the home page cards.`
      });
    }
  };

  readHomeCardsFromCache = () => {
    return get("home").then(val => {
      return this.setState({ homeCards: val });
    });
  };

  persistHomeCards = () => {
    set("home", this.state.homeCards).catch(err =>
      console.warn("Persisting home cards to IDB failed", err)
    );
  };

  fetchCard = async (hash, url) => {
    let response;
    try {
      response = await ky(`/api/cards/${hash}/?url=${url}`);
    } catch (ex) {
      console.warn(ex);
      return this.setState({
        loading: false,
        loadingError: ex.toString()
      });
    }

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
      const inView = Object.assign({}, this.state.inView);
      inView[id] = is;
      this.setState({ inView });
    }
  };
}
