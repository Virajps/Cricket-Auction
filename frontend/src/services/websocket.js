import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = (process.env.REACT_APP_WS_URL || 'https://pale-lucinda-squadify-d90cdf3a.koyeb.app/ws').replace(/\/$/, '');

class WebSocketService {
    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                // Resubscribe to any existing subscriptions
                this.resubscribe();
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });
        this.subscriptions = new Map();
    }

    connect() {
        if (!this.client.connected) {
            this.client.activate();
        }
    }

    disconnect() {
        if (this.client.connected) {
            this.client.deactivate();
        }
        this.subscriptions.clear();
    }

    resubscribe() {
        this.subscriptions.forEach((callback, destination) => {
            this.client.subscribe(destination, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
        });
    }

    subscribeToBids(callback) {
        const destination = '/topic/bids';
        this.subscriptions.set(destination, callback);
        
        if (this.client.connected) {
            this.client.subscribe(destination, (message) => {
                try {
                    const bid = JSON.parse(message.body);
                    callback(bid);
                } catch (error) {
                    console.error('Error parsing bid message:', error);
                }
            });
        }
    }

    subscribeToPlayerUpdates(playerId, callback) {
        const destination = `/topic/players/${playerId}`;
        this.subscriptions.set(destination, callback);
        
        if (this.client.connected) {
            this.client.subscribe(destination, (message) => {
                try {
                    const player = JSON.parse(message.body);
                    callback(player);
                } catch (error) {
                    console.error('Error parsing player update:', error);
                }
            });
        }
    }

    placeBid(bid) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/bids',
                body: JSON.stringify(bid)
            });
        } else {
            console.warn('Cannot place bid: WebSocket not connected');
        }
    }
}

export const webSocketService = new WebSocketService(); 
