import React, { Component } from 'react';
import io from 'socket.io-client';
import './app.css';
import HuaweiLogo from './huawei-logo.png';  // Pon aquí tu logo de Huawei con transparencia

export default class App extends Component {
  state = {
    step: 'login',   // 'login' | 'chat'
    username: '',
    message: '',
    messages: []
  };

  socket = null;

  componentDidMount() {
    // No conectamos hasta que el usuario elija nombre
  }

  joinChat = () => {
    const { username } = this.state;
    if (!username.trim()) return;
    this.socket = io();  // asume mismo origen
    this.socket.emit('join', username);
    this.socket.on('message', msg =>
      this.setState(state => ({ messages: [...state.messages, msg] }))
    );
    this.setState({ step: 'chat' });
  };

  sendMessage = () => {
    const { message, username } = this.state;
    if (!message.trim()) return;
    const msg = { user: username, text: message, time: Date.now() };
    this.socket.emit('message', msg);
    this.setState({ message: '' });
  };

  handleKey = e => {
    if (e.key === 'Enter') this.sendMessage();
  };

  render() {
    const { step, username, message, messages } = this.state;

    if (step === 'login') {
      return (
        <div className="login-container">
          <img src={HuaweiLogo} alt="Huawei" className="logo" />
          <h1>Bienvenido al Chat</h1>
          <input
            type="text"
            placeholder="Tu nombre"
            value={username}
            onChange={e => this.setState({ username: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && this.joinChat()}
          />
          <button onClick={this.joinChat}>Entrar</button>
        </div>
      );
    }

    return (
      <div className="chat-container">
        <header>
          <img src={HuaweiLogo} alt="Huawei" className="logo" />
          <h2>Chat en Tiempo Real</h2>
        </header>
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className="message">
              <span className="user">{m.user}:</span>
              <span className="text">{m.text}</span>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={e => this.setState({ message: e.target.value })}
            onKeyPress={this.handleKey}
          />
          <button onClick={this.sendMessage}>Enviar</button>
        </div>
      </div>
    );
  }
}
