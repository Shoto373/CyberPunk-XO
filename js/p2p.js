/**
 * P2P.JS - Resilient Serverless Multiplayer Engine
 * Hybrid Architecture: WebRTC PeerJS (across devices) + BroadcastChannel & Storage Event (instant local tabs)
 */

class P2PManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.isHost = false;
    this.roomCode = null;
    this.isConnected = false;
    this.localPlayerSymbol = null; // 'X' for Host, 'O' for Guest
    this.joinRetryTimer = null;
    this.joinAttempts = 0;

    // Cross-tab communication channel
    this.broadcastChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('cyber_xo_p2p_channel');
        this.setupBroadcastChannel();
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // LocalStorage fallback for cross-tab communication
    window.addEventListener('storage', (e) => this.handleStorageEvent(e));

    // Callbacks
    this.onConnectedCallback = null;
    this.onMoveCallback = null;
    this.onRematchCallback = null;
    this.onDisconnectCallback = null;
    this.onErrorCallback = null;
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  getPeerId(code) {
    return `cxo-v3-${code.toLowerCase().trim()}`;
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

    if (onStatus) onStatus(`Создание комнаты ${this.roomCode}...`);

    // Broadcast host presence locally across tabs
    this.broadcastLocal({ type: 'HOST_WAITING', room: this.roomCode });
    this.setStorageRoom('HOST', this.roomCode);

    // Initialize WebRTC PeerJS for remote connections
    if (typeof Peer !== 'undefined') {
      try {
        this.peer = new Peer(peerId, {
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun.cloudflare.com:3478' }
            ]
          }
        });

        this.peer.on('open', () => {
          if (!this.isConnected && onStatus) {
            onStatus(`Комната ${this.roomCode} в сети! Ждем подключения...`);
          }
        });

        this.peer.on('connection', (conn) => {
          this.connection = conn;
          this.setupConnection(true, onStatus);
        });

        this.peer.on('error', (err) => {
          console.warn('Peer host error:', err);
          if (err.type === 'unavailable-id') {
            this.createRoom(gameType, onStatus);
          } else if (!this.isConnected) {
            if (onStatus) onStatus(`Комната ${this.roomCode} готова (локальный режим активен).`);
          }
        });

      } catch (e) {
        console.warn('PeerJS init failed, using local tab mode:', e);
        if (onStatus) onStatus(`Комната ${this.roomCode} готова локально.`);
      }
    } else {
      if (onStatus) onStatus(`Комната ${this.roomCode} готова (локальные вкладки).`);
    }

    return this.roomCode;
  }

  /**
   * Joins an existing room by code
   */
  joinRoom(code, onStatus) {
    if (!code || !code.trim()) {
      if (onStatus) onStatus('Введите код комнаты для входа!');
      return;
    }

    this.disconnect();
    this.isHost = false;
    this.localPlayerSymbol = 'O';
    this.roomCode = code.toUpperCase().trim();
    const targetPeerId = this.getPeerId(this.roomCode);
    this.joinAttempts = 0;

    if (onStatus) onStatus(`Подключение к ${this.roomCode}...`);

    // 1. Instantly ping locally via BroadcastChannel & Storage Event
    this.broadcastLocal({ type: 'GUEST_JOINING', room: this.roomCode });
    this.setStorageRoom('GUEST_JOIN', this.roomCode);

    // 2. Connect via WebRTC PeerJS for remote devices
    if (typeof Peer !== 'undefined') {
      const startPeerJoin = () => {
        try {
          this.peer = new Peer({
            debug: 0,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' }
              ]
            }
          });

          this.peer.on('open', () => {
            if (this.isConnected) return;
            this.connectToHostPeer(targetPeerId, onStatus);
          });

          this.peer.on('error', (err) => {
            console.warn('Peer join error:', err);
            if (this.isConnected) return;

            if (err.type === 'peer-unavailable') {
              if (this.joinAttempts < 4) {
                this.joinAttempts++;
                if (onStatus) onStatus(`Поиск комнаты ${this.roomCode} (попытка ${this.joinAttempts + 1}/5)...`);
                this.joinRetryTimer = setTimeout(() => {
                  this.connectToHostPeer(targetPeerId, onStatus);
                }, 1200);
              } else {
                if (onStatus) onStatus(`Комната ${this.roomCode} не найдена. Проверьте код.`);
                if (this.onErrorCallback) {
                  this.onErrorCallback(`Комната ${this.roomCode} не найдена. Убедитесь, что хост создал её.`);
                }
              }
            } else if (!this.isConnected) {
              if (onStatus) onStatus(`Сетевая задержка. Проверьте соединение или код ${this.roomCode}`);
            }
          });

        } catch (e) {
          console.warn('Peer join init error:', e);
        }
      };

      startPeerJoin();
    }
  }

  connectToHostPeer(targetPeerId, onStatus) {
    if (!this.peer || this.isConnected) return;
    try {
      this.connection = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnection(false, onStatus);
    } catch (e) {
      console.warn('Failed to connect to peer:', e);
    }
  }

  setupConnection(isHost, onStatus) {
    if (!this.connection) return;

    this.connection.on('open', () => {
      this.isConnected = true;
      if (this.joinRetryTimer) {
        clearTimeout(this.joinRetryTimer);
        this.joinRetryTimer = null;
      }
      if (onStatus) onStatus('Соперник подключен! Бой начинается.');
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

  /**
   * BroadcastChannel local messaging between tabs
   */
  setupBroadcastChannel() {
    this.broadcastChannel.onmessage = (e) => {
      this.processLocalMessage(e.data);
    };
  }

  broadcastLocal(payload) {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }
  }

  setStorageRoom(type, room) {
    try {
      localStorage.setItem('cyber_xo_p2p_sync', JSON.stringify({ type, room, timestamp: Date.now() }));
    } catch (e) {}
  }

  handleStorageEvent(e) {
    if (e.key === 'cyber_xo_p2p_sync' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        this.processLocalMessage(data);
      } catch (err) {}
    }
  }

  processLocalMessage(data) {
    if (!data || !this.roomCode) return;

    // Host receives guest joining request on same room
    if (this.isHost && data.type === 'GUEST_JOINING' && data.room === this.roomCode) {
      this.isConnected = true;
      this.broadcastLocal({ type: 'HOST_ACCEPT', room: this.roomCode });
      this.setStorageRoom('HOST_ACCEPT', this.roomCode);

      if (this.onConnectedCallback) {
        this.onConnectedCallback(true, this.roomCode, 'X');
      }
      return;
    }

    // Guest receives host acceptance
    if (!this.isHost && data.type === 'HOST_ACCEPT' && data.room === this.roomCode) {
      this.isConnected = true;
      if (this.joinRetryTimer) {
        clearTimeout(this.joinRetryTimer);
        this.joinRetryTimer = null;
      }
      if (this.onConnectedCallback) {
        this.onConnectedCallback(false, this.roomCode, 'O');
      }
      return;
    }

    this.handleIncomingData(data);
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
    const payload = { type: 'MOVE', index, room: this.roomCode };
    if (this.connection && this.connection.open) {
      this.connection.send(payload);
    }
    this.broadcastLocal(payload);
    this.setStorageRoom('MOVE', this.roomCode);
  }

  sendRematch() {
    const payload = { type: 'REMATCH', room: this.roomCode };
    if (this.connection && this.connection.open) {
      this.connection.send(payload);
    }
    this.broadcastLocal(payload);
  }

  handleDisconnect() {
    this.isConnected = false;
    if (this.onDisconnectCallback) this.onDisconnectCallback();
  }

  disconnect() {
    if (this.joinRetryTimer) {
      clearTimeout(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }
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

  getShareUrl(roomCode = this.roomCode) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${roomCode}`;
  }

  async copyShareLink(roomCode = this.roomCode) {
    const url = this.getShareUrl(roomCode);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (e) {}
    }
    return false;
  }
}

export const p2p = new P2PManager();
