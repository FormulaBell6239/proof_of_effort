import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SubmitEffortPage from './pages/SubmitEffortPage';
import VerifyPage from './pages/VerifyPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/submit" component={SubmitEffortPage} />
        <Route path="/verify" component={VerifyPage} />
        <Route path="/profile/:userId?" component={ProfilePage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
      </Switch>
    </Layout>
  );
}

export default App;
