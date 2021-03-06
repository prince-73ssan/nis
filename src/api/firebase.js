import React from 'react';
import { Alert } from 'react-native';
import * as firebase from 'firebase';
import firebaseApp from './firebaseApp';


class Backend {
  uid = '';
  messagesRef = null;
  grade = '';
  // initialize Firebase Backend
  constructor() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setUid(user.uid);
      } else {
        Alert.alert('Seems like an erorr with Auth');
      }
    });
    firebase.database().ref(`users/${this.uid}/grade`).on('value', snap => {
      if (snap) {
        this.setGrade(snap.val());
      } else {
        Alert.alert('An error with referring students grade');
      }
    });
}
  setGrade(value) {
    this.grade = value;
  }
  getGrade() {
     return this.grade;
  }
  setUid(value) {
    this.uid = value;
  }
  getUid() {
    return this.uid;
  }

  // retrieve the messages from the Backend
  loadMessages(callback) {
    this.messagesRef = firebase.database().ref(`messages/${this.getGrade()}`);
    this.messagesRef.off();
    const onReceive = (data) => {
      const message = data.val();
      callback({
        _id: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.user._id,
          name: message.user.name,
        },
      });
    };
    this.messagesRef.limitToLast(40).on('child_added', onReceive);
  }
  // send the message to the Backend
  sendMessage(message) {
    for (let i = 0; i < message.length; i++) {
      this.messagesRef.push({
        text: message[i].text,
        user: message[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    }
  }
  // close the connection to the Backend
  closeChat() {
    if (this.messagesRef) {
      this.messagesRef.off();
    }
  }
}

export default new Backend();
