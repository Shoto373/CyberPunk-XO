/**
 * P2P.JS - Serverless WebRTC Multiplayer Engine using PeerJS & BroadcastChannel Fallback
 * Allows two players to battle in real-time across devices via room codes or links.
 */

class P2PManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.isHost = false;
    this.roomCode = null;
    this.isConnected = false;
    this.localPlayerSymbol = null; // 'X' for Host, 'O' for Guest

    // BroadcastChannel for cross-tab testing on the same machine
    this.broadcastChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('cyber_xo_p2p_channel');
        this.setupBroadcastChannel();
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e);
      }
    }

    // Callbacks
    this.onConnectedCallback = null;
    this.onMoveCallback = null;
    this.onRematchCallback = null;
    this.onDisconnectCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Generates a 6-character cyberpunk room code
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Builds Peer ID from room code to avoid collisions
   */
  getPeerId(code) {
    return `cxo-${code.toLowerCase().trim()}`;
  }

  /**
   * Initializes host room
   */
  createRoom(gameType = 'classic', onStatus) {
    this.disconnect();
    this.isHost = true;
    this.localPlayerSymbol = 'X';
    this.roomCode = this.generateRoomCode();
    const peerId = this.getPeerId(this.roomCode);

    if (onStatus) onStatus(`Инициализация комнаты: ${this.roomCode}...`);

    if (typeof Peer === 'undefined') {
      // Fallback mode using BroadcastChannel
      this.isConnected = true;
      if (onStatus) onStatus(`Локальная комната готова: ${this.roomCode}`);
      if (this.onConnectedCallback) this.onConnectedCallback(true, this.roomCode, 'X');
      return this.roomCode;
    }

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        if (onStatus) onStatus(`Комната ${this.roomCode} ждет соперника...`);
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.setupConnection(true, onStatus);
      });

      this.peer.on('error', (err) => {
        console.warn('Peer error:', err);
        if (err.type === 'unavailable-id') {
          // If code collision, retry with new code
          this.createRoom(gameType, onStatus);
        } else if (this.onErrorCallback) {
          this.onErrorCallback(err.message || 'Ошибка сети WebRTC');
        }
      });

    } catch (e) {
      console.error('Failed to init Peer:', e);
      if (this.onErrorCallback) this.onErrorCallback('WebRTC недоступен. Используется локальный режим.');
    }

    return this.roomCode;
  }

  /**
   * Joins an existing room by code
   */
  joinRoom(code, onStatus) {
    this.disconnect();
    this.isHost = false;
    this.localPlayerSymbol = 'O';
    this.roomCode = code.toUpperCase().trim();
    const targetPeerId = this.getPeerId(this.roomCode);

    if (onStatus) onStatus(`Подключение к ${this.roomCode}...`);

    if (typeof Peer === 'undefined') {
      // Fallback BroadcastChannel
      this.isConnected = true;
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'GUEST_JOINED', room: this.roomCode });
      }
      if (onStatus) onStatus(`Подключено к ${this.roomCode}!`);
      if (this.onConnectedCallback) this.onConnectedCallback(false, this.roomCode, 'O');
      return;
    }

    try {
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.connection = this.peer.connect(targetPeerId, { reliable: true });
        this.setupConnection(false, onStatus);
      });

      this.peer.on('error', (err) => {
        console.warn('Peer join error:', err);
        if (this.onErrorCallback) {
          this.onErrorCallback('Не удалось найти комнату ' + this.roomCode);
        }
      });

    } catch (e) {
      console.error('Join room failed:', e);
      if (this.onErrorCallback) this.onErrorCallback('Ошибка подключения WebRTC');
    }
  }

  setupConnection(isHost, onStatus) {
    if (!this.connection) return;

    this.connection.on('open', () => {
      this.isConnected = true;
      if (onStatus) onStatus('Соперник подключился! Бой начинается.');
      if (this.onConnectedCallback) {
        this.onConnectedCallback(isHost, this.roomCode, this.localPlayerSymbol);
      }
    });

    this.connection.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.connection.on('close', () => {
      this.handleDisconnect();
    });

    this.connection.on('error', (err) => {
      console.warn('Connection error:', err);
      this.handleDisconnect();
    });
  }

  setupBroadcastChannel() {
    this.broadcastChannel.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (this.isHost && data.type === 'GUEST_JOINED' && data.room === this.roomCode) {
        this.isConnected = true;
        if (this.onConnectedCallback) {
          this.onConnectedCallback(true, this.roomCode, 'X');
        }
      }

      this.handleIncomingData(data);
    };
  }

  handleIncomingData(data) {
    if (!data) return;

    switch (data.type) {
      case 'MOVE':
        if (this.onMoveCallback) this.onMoveCallback(data.index);
        break;
      case 'REMATCH':
        if (this.onRematchCallback) this.onRematchCallback();
        break;
      case 'DISCONNECT':
        this.handleDisconnect();
        break;
    }
  }

  sendMove(index) {
    const payload = { type: 'MOVE', index };
    if (this.connection && this.connection.open) {
      this.connection.send(payload);
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }
  }

  sendRematch() {
    const payload = { type: 'REMATCH' };
    if (this.connection && this.connection.open) {
      this.connection.send(payload);
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    if (this.onDisconnectCallback) this.onDisconnectCallback();
  }

  disconnect() {
    if (this.connection) {
      try {
        this.connection.send({ type: 'DISCONNECT' });
        this.connection.close();
      } catch (e) {}
      this.connection = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.isConnected = false;
    this.roomCode = null;
  }

  /**
   * Generates full share URL
   */
  getShareUrl(roomCode = this.roomCode) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${roomCode}`;
  }

  /**
   * Copies share link to clipboard
   */
  async copyShareLink(roomCode = this.roomCode) {
    const url = this.getShareUrl(roomCode);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    return false;
  }
}

export const p2p = new P2PManager();
