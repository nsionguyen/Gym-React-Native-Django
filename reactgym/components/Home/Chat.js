import React, { useState, useEffect, useRef } from 'react';
import { db } from "../../firebase/config"
import { collection, query, where, getDocs, onSnapshot, updateDoc, addDoc, Timestamp } from 'firebase/firestore'; // Firebase SDK v9+
import { useContext, useReducer } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import MessageItem from './MessageItem';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useRoute } from '@react-navigation/native';
const Chat = () => {
    const route = useRoute();
    const { friendName1 } = route.params;

    // console.log("name truyen qua:", friendName1);
    const user = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [sender, setSender] = useState(user.first_name);
    const [friendName, setFriendName] = useState(friendName1);


    const flatListRef = useRef(null);
    const [isListReady, setIsListReady] = useState(false);






    const queryResult = query(collection(db, 'Chats'), where('chatters', '==', `${sender}xx${friendName}`));
    const queryResult2 = query(collection(db, 'Chats'), where('chatters', '==', `${friendName}xx${sender}`));














    const handleSubmit = async () => {
        try {
            const timestamp = Timestamp.now();
            const newMessage = {
                message,
                timestamp,
                sender,
            };

            const querySnapshot = await getDocs(queryResult);
            const querySnapshot2 = await getDocs(queryResult2);

            if (!querySnapshot.empty || !querySnapshot2.empty) {
                querySnapshot.docs.forEach((document) => {
                    updateDoc(document.ref, {
                        conversation: [...document.data().conversation, newMessage],
                    });
                });
                querySnapshot2.docs.forEach((document) => {
                    updateDoc(document.ref, {
                        conversation: [...document.data().conversation, newMessage],
                    });
                });
            } else {

                await addDoc(collection(db, 'Chats'), {
                    chatters: `${sender}xx${friendName}`,
                    conversation: [newMessage],
                });
            }
            setMessage("");

        } catch (error) {
            console.error(error);
        }

    };

    useEffect(() => {
        const fetchMessages = async () => {
            const querySnapshot = await getDocs(queryResult);
            const querySnapshot2 = await getDocs(queryResult2);

            if (!querySnapshot.empty || !querySnapshot2.empty) {
                let allMessages = querySnapshot.docs.map((doc) => doc.data().conversation)

                allMessages = allMessages.concat(
                    querySnapshot2.docs.map((doc) => doc.data().conversation)
                )

                allMessages = allMessages.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)

                setMessages(allMessages)
            }
        };





        // Lắng nghe các thay đổi trong thời gian thực
        const unsub1 = onSnapshot(queryResult, (snapshot) => {
            const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
            setMessages(allMessages);
        });

        const unsub2 = onSnapshot(queryResult2, (snapshot) => {
            const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
            setMessages(allMessages);
        })

        fetchMessages()


        return () => {
            unsub1();
            unsub2();
        };

    }, []);

    useEffect(() => {
        setIsListReady(true)
    }, [messages])



    return (
        <View style={{ flex: 1, padding: 20 }}>

            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Chat</Text>
            {messages[0] !== undefined && (
                <FlatList
                    initialNumToRender={10}
                    ref={flatListRef}
                    onContentSizeChange={() => {
                        if (isListReady)
                            flatListRef?.current?.scrollToEnd({ animated: true });
                    }}
                    data={messages[0]}
                    keyExtractor={(item) => item.timestamp}
                    renderItem={({ item }) => (
                        <MessageItem item={item} sender={sender} />
                    )}
                />)}

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 5,
                    padding: 10,
                    marginTop: 10,
                    marginBottom: 20,
                }}
                autoCorrect={false}
                autoComplete="off"
                importantForAutofill="no"
                value={message}
                onChangeText={(t) => setMessage(t)}
                placeholder="Type a message"
            />
            <TouchableOpacity
                onPress={handleSubmit}
                style={{
                    backgroundColor: '#007bff',
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16 }}>Send</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Chat;