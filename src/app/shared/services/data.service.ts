import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  public currentUser!: User;
  public lastEmojis!: string[];

  private users!: User[];
  private channels!: Channel[];

  private usersSubject = new BehaviorSubject<User[]>([]);
  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  private currentUserChannelsSubject = new BehaviorSubject<Channel[]>([]);


  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }


  //################# DATAS FOR CURRENT-USER #################

  /**
 * Sets the current user and stores it in local storage.
 * @param {User} user - The user to set as the current user.
 * @returns {void}
 */
  setCurrentUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }


  /**
   * Loads the current user from local storage if running in a browser environment.
   * @returns {void}
   */
  loadCurrentUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
        this.currentUser.id = this.currentUser.id!;
        const user = JSON.parse(userJson);
        if (user && user.id) {
          this.currentUser = user;
        } else {
        }
      }
    }
  }


  //################# DATAS FOR USERS #################

  /**
   * Observable property that emits an array of users.
   * @returns {Observable<User[]>} An observable emitting an array of users.
   */
  get users$(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }


  /**
   * Sets the users and emits the updated array to subscribers.
   * @param {User[]} users - The array of users to set.
   * @returns {void}
   */
  setUsers(users: User[]): void {
    this.usersSubject.next(users);
    this.users = users;
  }


  //################# DATAS FOR CHANNELS #################

  /**
   * Observable property that emits an array of channels.
   * @returns {Observable<Channel[]>} An observable emitting an array of channels.
   */
  get channels$(): Observable<Channel[]> {
    return this.channelsSubject.asObservable();
  }


  /**
   * Sets the channels and emits the updated array to subscribers.
   * @param {Channel[]} channels - The array of channels to set.
   * @returns {void}
   */
  setChannels(channels: Channel[]): void {
    this.channelsSubject.next(channels);
    this.channels = channels;
  }


  /**
   * Observable property that emits an array of channels associated with the current user.
   * @returns {Observable<Channel[]>} An observable emitting an array of channels.
   */
  get currentUserChannels$(): Observable<Channel[]> {
    return this.currentUserChannelsSubject.asObservable();
  }


  /**
   * Sets the channels associated with the current user and emits the updated array to subscribers.
   * @param {Channel[]} channels - The array of channels associated with the current user to set.
   * @returns {void}
   */
  setCurrentUserChannels(channels: Channel[]): void {
    this.currentUserChannelsSubject.next(channels);
  }


  //################# GLOBAL FUNCTIONS FOR USERS #################

  /**
   * Retrieves the user associated with the given message.
   * @param {ChannelMessage | DirectMessage} message - The message for which to retrieve the user.
   * @returns {User} The user associated with the message, or a new User instance if not found.
   */
  public getUserFromMessage(message: ChannelMessage | DirectMessage): User {
    const user = this.users.find((user) => user.id === message.fromUserID);
    return user ? user : new User();
  }


  /**
   * Retrieves the user associated with the given reply.
   * @param {Reply} reply - The reply for which to retrieve the user.
   * @returns {User} The user associated with the reply, or a new User instance if not found.
   */
  public getUserFromReply(reply: Reply): User {
    const user = this.users.find((user) => user.id === reply.userID);
    return user ? user : new User();
  }


  /**
   * Retrieves the user with the given name.
   * @param {string} name - The name of the user to retrieve.
   * @returns {User | undefined} The user with the specified name, or undefined if not found.
   */
  public getUserByName(name: string): User | undefined {
    const user = this.users.find((user) => user.name === name);
    if (user) return user;
    else return;
  }


  /**
   * Retrieves the user object associated with the provided ID.
   * @param {string} id - The ID of the user to retrieve.
   * @returns {User | undefined} The user object associated with the provided ID, or undefined if not found.
   */
  public getUserById(id: string): User | undefined {
    const user = this.users.find((user) => user.id === id);
    if (user) return user;
    else return;
  }


  /**
   * Retrieves the name of the user with the given ID.
   * @param {string} userID - The ID of the user to retrieve the name for.
   * @returns {string} The name of the user with the specified ID, or an empty string if not found.
   */
  public getUserNameById(userID: string): string {
    if (!this.users) return '';
    const user = this.users.find((user) => user.id === userID);
    return user ? user.name : '';
  }


  /**
   * Retrieves the avatar of the user with the given ID.
   * @param {string} userID - The ID of the user to retrieve the avatar for.
   * @returns {string} The avatar URL of the user with the specified ID, or an empty string if not found.
   */
  public getUserAvatarById(userID: string): string {
    if (!this.users) return '';
    const user = this.users.find((user) => user.id === userID);
    return user ? user.avatar : '';
  }


  //################# GLOBAL FUNCTIONS FOR USERS ################# 

  /**
   * Retrieves the name of the channel with the given ID.
   * @param {string} channelID - The ID of the channel to retrieve the name for.
   * @returns {string} The name of the channel with the specified ID, or an empty string if not found.
   */
  public getChannelNameById(channelID: string): string {
    if (!this.channels) return '';
    const channel = this.channels.find((channel) => channel.id === channelID);
    return channel ? channel.name : '';
  }


  //################# GLOBAL FUNCTIONS FOR EMOJIS ################# 

  /**
   * Loads the last used emojis from local storage.
   * If no emojis are found in local storage, default emojis are loaded.
   * @returns {void}
   */
  public loadLastEmojis(): void {
    let load = localStorage.getItem('lastEmojis');
    if (load) this.lastEmojis = load.split(',');
    else this.lastEmojis = ['👍', '😀'];
  }

}
