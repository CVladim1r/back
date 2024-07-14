import './App.css';
import React from 'react';


class App extends React.Component {
  state = {data: [], count: 0}

  componentDidMount() {
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = this.onMessage

    this.setState({
      ws: ws,
      // Create an interval to send echo messages to the server
      interval: setInterval(() => ws.send('echo'), 1000)
    })
  }

  componentWillUnmount() {
    const {ws, interval} = this.state;
    ws.close()
    clearInterval(interval)
  }

  onMessage = (ev) => {
    const recv = JSON.parse(ev.data)
    const {data, count} = this.state
    let newData = [...data]
    // Remove first data if we received more than 20 values
    if (count > 20) {
      newData = newData.slice(1)
    }
    newData.push({value: recv.value, index: count})
    this.setState({data: newData, count: count + 1})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>
            WebSocket
          </h2>

        </header>
      </div>
    )
  }
}

export default App;
