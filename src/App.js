import JoinRoom from "./components/JoinRoom"
import StreamVideo from "./components/StreamVideo"
import New from "./components/New"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/:id" component={New} />
        <Route exact path="/chat/:id" component={StreamVideo} />
        <Route exact path="/" component={JoinRoom} />
      </Switch>
    </Router>
  )
}

export default App
