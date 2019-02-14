import ky from "ky";
import { clear, get, set } from "idb-keyval";
import { Container } from "unstated";

window._clear_local_state = clear;

export class CardsContainer extends Container {
  state = {
    homeCards: null,
    allCards: {},
    cardsNotFound: [],
    loading: true,
    loadingError: null,
    oldestCard: null,
    updating: false
  };

  loadHomeCards = async () => {
    this.setState({ loading: true });
    this.fetchHomeCards();
  };

  fetchHomeCards = async (since = null) => {
    let response;
    try {
      response = await ky(`/api/cards/?since=${since}`);
    } catch (ex) {
      console.warn(ex);
      return this.setState({
        loading: false,
        loadingError: ex.toString()
      });
    }
    if (response.ok) {
      const data = await response.json();
      // const homeCards = this.state.homeCards || [];
      const initialCards = this.state.homeCards || [];
      const homeCards = initialCards.slice(0); // never mutate!
      const hasIds = new Set(homeCards.map(card => card.id));
      data.cards.forEach((card, i) => {
        if (!hasIds.has(card.id)) {
          hasIds.add(card.id);
          homeCards.push(card);
        }
      });
      homeCards.sort((a, b) => {
        if (a.created > b.created) return -1;
        if (a.created < b.created) return 1;
        return 0;
      });
      this.setState(
        {
          homeCards,
          loading: false,
          loadingError: null,
          updating: false,
          oldestCard: data._oldest_card
        },
        this.persistHomeCards
      );
      if (data._updating) {
        console.warn("Server is updating! Come back again soon.");
        this.setState({ updating: true });
      }
    } else {
      this.setState({
        loading: false,
        updating: false,
        loadingError: `${
          response.status
        } trying to load all the home page cards.`
      });
    }
  };

  oldestHomeCard = () => {
    if (!this.state.homeCards) {
      return null;
    }
    const dates = this.state.homeCards.map(card => card.created);
    return dates[dates.length - 1];
  };

  fetchMore = async () => {
    if (
      this.state.oldestCard &&
      this.state.oldestCard === this.oldestHomeCard()
    ) {
      alert("You've gone all the way back. Do something else with your life.");
    } else {
      this.setState({ loading: true }, () => {
        this.fetchHomeCards(this.oldestHomeCard());
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
