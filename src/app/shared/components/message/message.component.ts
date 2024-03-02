import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { ChannelMessage } from '../../models/channel-message.class';
import { User } from '../../models/user.class';
import { DialogShowUserComponent } from '../dialogs/dialog-show-user/dialog-show-user.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Reply } from '../../models/reply.class';
import { ChannelMessagesService } from '../../firebase-services/channel-message.service';
import { DialogEmojiComponent } from '../dialogs/dialog-emoji/dialog-emoji.component';
import { PositionService } from '../../../shared/services/position.service';
import { DataService } from '../../services/data.service';
import { Like, SortedLikes } from '../../models/like.class';
import { TextOutputComponent } from './text-output/text-output.component';
import { EditMessageComponent } from './edit-message/edit-message.component';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    CommonModule,
    TextOutputComponent,
    EditMessageComponent
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnChanges {

  @Input() msg!: ChannelMessage | Reply;
  @Input() channelMsg!: ChannelMessage;
  @Input() index!: number;
  @Input() user!: User;
  @Input() isChannelMsg: Boolean = false;
  @Input() isEditDisabled: Boolean = false;

  @Output() threadOutput: EventEmitter<ChannelMessage> = new EventEmitter<ChannelMessage>();

  @ViewChild('emoijBtn') emoijBtn!: ElementRef;
  @ViewChild('likesRow') likesRow!: ElementRef;

  allLikes: Like[] = [];
  sortedLikes: SortedLikes[] = [];
  replaies: Reply[] = [];

  isEditMsg = false;
  currentUserID: string;
  oldText: string = '';
  posLikesRow = 2;
  message = '';

  constructor(
    public dialog: MatDialog,
    private messageFBS: ChannelMessagesService,
    public data: DataService,
    private PositionService: PositionService) {
    data.currentUser.id ? this.currentUserID = data.currentUser.id : this.currentUserID = '';
    if (!data.lastEmojis) this.data.loadLastEmojis()
  }

  ngOnInit() {
    if (!this.user) {
      this.user = new User({
        id: '',
        uid: '',
        email: 'Lädt...',
        name: 'Lädt...',
        avatar: '../../../../../assets/img/avatars/unknown.jpg'
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.allLikes = this.msg.likes;
      this.sortedLikes = this.fillSortedLikes();
      if (this.msg instanceof Reply) return
      this.replaies = this.msg.replies;
    }
  }


  fillSortedLikes(): SortedLikes[] {
    let uniqueEmojis = this.getUniqueEmojis();
    let sortedLikes: SortedLikes[] = [];
    for (const emoji in uniqueEmojis) {
      if (Object.prototype.hasOwnProperty.call(uniqueEmojis, emoji)) {
        sortedLikes.push({ emoji, usersIDs: uniqueEmojis[emoji] });
      }
    }
    return sortedLikes;
  }


  getUniqueEmojis() {
    let uniqueEmojis: { [key: string]: string[] } = {};
    this.allLikes.forEach(like => {
      if (!uniqueEmojis[like.emoji]) uniqueEmojis[like.emoji] = [like.userID];
      else if (!uniqueEmojis[like.emoji].includes(like.userID)) {
        uniqueEmojis[like.emoji].push(like.userID);
      }
    });
    return uniqueEmojis
  }


  setTime(timestemp: number): string {
    let date = new Date(timestemp);
    return date.getHours() + ':' + date.getMinutes()
  }


  openShowUserDialog(user: User) {
    this.dialog.open(DialogShowUserComponent, {
      panelClass: ['card-round-corners'],
      data: { user: user },
    });
  }


  setThreadOutput() {
    if (this.msg instanceof ChannelMessage) this.threadOutput.emit(this.msg)
    else return
  }


  setMsgText(text: string) {
    this.message = text;
  }


  // edit functions

  editPossible(): boolean {
    if (this.isEditDisabled) return false
    let out;
    if (this.msg instanceof ChannelMessage) (this.msg.fromUserID === this.currentUserID) ? out = true : out = false;
    else (this.msg.userID === this.currentUserID) ? out = true : out = false;
    return out
  }


  toggleEditMsg() {
    this.isEditMsg = !this.isEditMsg;
  }


  openDialogEmoji(): void {
    const dialogRef = this.dialog.open(DialogEmojiComponent, {
      panelClass: ['card-round-corners'],
      data: {},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && !this.isEditMsg) return this.addLike(result);
      else return
    });
  }


  async addLike(emoji: string) {
    this.saveEmojiLocal(emoji);
    let newLike = this.newLike(emoji);
    for (let i = 0; i < this.msg.likes.length; i++) {
      if (this.msg.likes[i].userID === newLike.userID) this.msg.likes.splice(i, 1);
    }
    this.msg.likes.push(newLike);
    if (this.msg instanceof ChannelMessage) await this.messageFBS.updateChannelMessage(this.msg)
    else if (this.channelMsg) await this.messageFBS.updateChannelMessage(this.channelMsg)
    this.sortedLikes = this.fillSortedLikes();
  }


  saveEmojiLocal(emoji: string) {
    if (this.data.lastEmojis.includes(emoji)) return
    this.data.lastEmojis.push(emoji);
    if (this.data.lastEmojis.length > 2) this.data.lastEmojis.splice(0, (this.data.lastEmojis.length - 2));
    localStorage.setItem('lastEmojis', this.data.lastEmojis.toString())
  }


  newLike(emoji: string): Like {
    let like = new Like();
    like.emoji = emoji;
    like.userID = this.currentUserID;
    like.date = new Date().getTime();
    return like
  }


  setHiddenLikePos() {
    let pos = this.PositionService.getDialogPosWithCorner(this.likesRow, 'bottom');
    if (pos?.bottom) this.posLikesRow = parseInt(pos.bottom);
  }

  // Methode zum Setzen des Ersatzbildes
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '../../../../assets/img/avatars/unknown.jpg';
  }

}
