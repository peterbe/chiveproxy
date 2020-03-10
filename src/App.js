import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// Maybe when the dust has settled import this to just be able to clear
// import { clear, get } from "idb-keyval";
import Home from "./Home";
import Card from "./Card";

function App() {
  return (
    <Router>
      <section className="section">
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/:id" exact>
            <Card />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </section>
      <DisplayVersion />
    </Router>
  );
}

export default App;

function NoMatch({ location }) {
  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
}

const DisplayVersion = React.memo(() => {
  const element = document.querySelector("#_version");
  const data = Object.assign({}, element.dataset);
  return (
    <p className="version-info">
      <a
        href="https://github.com/peterbe/chiveproxy"
        target="_blank"
        rel="noopener noreferrer"
      >
        ChiveProxy
      </a>
      <br />
      Version{" "}
      <a
        href={`https://github.com/peterbe/chiveproxy/commit/${data.commit}`}
        title={data.date}
      >
        {data.commit.slice(0, 7)}
      </a>{" "}
      {data.date}
    </p>
  );
});
