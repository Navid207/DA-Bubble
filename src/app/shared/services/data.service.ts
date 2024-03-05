import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChannelMessage } from '../models/channel-message.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Reply } from '../models/reply.class';
import { isPlatformBrowser } from '@angular/common';
import { DirectMessage } from '../models/direct-message.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  users!: User[];
  currentUser!: User;
  currentUserID!: string; // ggf. löschen
  channels!: Channel[];
  public lastEmojis!: string[];

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  private currentUserChannelsSubject = new BehaviorSubject<Channel[]>([]);
  public currentUserChannels$ = this.currentUserChannelsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  logCurrentUserData() {
    console.log('Aktueller Benutzer:', this.currentUser);
    console.log('Aktuelle Benutzer-ID:', this.currentUserID);
    console.log('Kanäle:', this.currentUserChannelsSubject.getValue());
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
        this.currentUserID = this.currentUser.id!;
      }
    }
  }

  getUserFromMessage(message: ChannelMessage | DirectMessage): User {
    const user = this.users.find((user) => user.id === message.fromUserID);
    return user ? user : new User();
  }

  getUserFromReply(reply: Reply): User {
    const user = this.users.find((user) => user.id === reply.userID);
    return user ? user : new User();
  }

  getUserByName(name: string): User | undefined {
    const user = this.users.find((user) => user.name === name);
    if (user) return user;
    else return;
  }

  setUsers(users: User[]) {
    this.usersSubject.next(users);
  }

  setChannels(channels: Channel[]) {
    this.channelsSubject.next(channels);
  }

  setCurrentUserChannels(channels: Channel[]) {
    this.currentUserChannelsSubject.next(channels);
  }

  public getUserNameById(userID: string): string {
    if (!this.users) return '';
    const user = this.users.find((user) => user.id === userID);
    return user ? user.name : '';
  }

  public getUserAvatarById(userID: string): string {
    if (!this.users) return '';
    const user = this.users.find((user) => user.id === userID);
    return user ? user.avatar : '';
  }

  public getChannelNameById(channelID: string): string {
    if (!this.channels) return '';
    const channel = this.channels.find((channel) => channel.id === channelID);
    return channel ? channel.name : '';
  }

  loadLastEmojis() {
    let load = localStorage.getItem('lastEmojis');
    if (load) this.lastEmojis = load.split(',');
    else this.lastEmojis = ['👍', '😀'];
  }
}
